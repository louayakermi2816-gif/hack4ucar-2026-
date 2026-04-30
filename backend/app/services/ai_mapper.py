"""
ai_mapper.py — AI-assisted field extraction using Mistral.

Problem: Real-world uploads have messy column names like:
  "Taux de réussite"  →  should be "success_rate"
  "Budget alloué"     →  should be "budget_allocated"
  "Année universitaire" → should be "semester"

Solution: Send the messy column names to Mistral and ask it to map
them to our schema. Return the mapping + a confidence score.
"""
import os
import json
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

# Our full schema — every column across all 8 KPI tables
SCHEMA_COLUMNS = {
    "academic": [
        "semester", "student_count", "success_rate", "dropout_rate",
        "attendance_rate", "avg_grade"
    ],
    "finance": [
        "fiscal_year", "budget_allocated", "budget_consumed",
        "cost_per_student", "external_funding"
    ],
    "hr": [
        "fiscal_year", "teaching_staff_count", "admin_staff_count",
        "training_hours", "absenteeism_rate"
    ],
    "employment": [
        "graduation_year", "employability_rate", "avg_salary",
        "insertion_delay_days"
    ],
    "esg": [
        "report_year", "energy_kwh", "water_m3", "waste_kg",
        "carbon_kg", "green_space_m2"
    ],
    "research": [
        "year", "publications", "citations", "h_index", "patents",
        "rd_budget"
    ],
    "infrastructure": [
        "year", "total_area_m2", "room_occupancy_rate",
        "it_ratio_per_student", "equipment_status"
    ],
    "partnership": [
        "year", "active_agreements", "incoming_mobility",
        "outgoing_mobility", "joint_programs"
    ],
}

# Flatten all valid columns into a single list for the prompt
ALL_COLUMNS = []
for table, cols in SCHEMA_COLUMNS.items():
    for col in cols:
        ALL_COLUMNS.append(f"{col} ({table})")


def _build_prompt(raw_columns: List[str], sample_row: Dict[str, Any]) -> str:
    """
    Build the prompt that instructs Mistral to map columns.
    """
    schema_str = json.dumps(SCHEMA_COLUMNS, indent=2)
    
    return f"""You are a data mapping assistant for a university KPI platform.

I have a file with these column names:
{json.dumps(raw_columns)}

And here is one sample row of data:
{json.dumps(sample_row, default=str)}

Our database has 8 tables with these exact column names:
{schema_str}

Your task:
1. For each input column, find the best matching database column.
2. Also determine which table the data belongs to (academic, finance, hr, employment, esg, research, infrastructure, partnership).

Return ONLY valid JSON (no markdown, no explanation), in this exact format:
{{
  "table": "academic",
  "confidence": 0.95,
  "column_mapping": {{
    "original_col_1": "mapped_col_name",
    "original_col_2": "mapped_col_name"
  }},
  "unmapped": ["col_that_doesnt_match"]
}}

Rules:
- "confidence" is a float 0.0 to 1.0 — how confident you are in the overall mapping.
- If a column clearly doesn't match anything, put it in "unmapped".
- Column names might be in French, Arabic, or English.
- Be smart about abbreviations: "Tx réussite" = "success_rate", "Budget alloc." = "budget_allocated".
"""


def ai_map_columns(
    raw_columns: List[str],
    sample_row: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Use Mistral AI to map raw column names to our database schema.
    
    Returns:
        {
            "table": "academic",
            "confidence": 0.95,
            "column_mapping": {"Taux de réussite": "success_rate", ...},
            "unmapped": [...]
        }
        
    Returns None if Mistral is unavailable or the mapping fails.
    """
    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key:
        logger.warning("MISTRAL_API_KEY not set — skipping AI mapping")
        return None

    try:
        from mistralai.client import MistralClient
        from mistralai.models.chat_completion import ChatMessage

        client = MistralClient(api_key=api_key)
        prompt = _build_prompt(raw_columns, sample_row)

        response = client.chat(
            model="mistral-small-latest",
            messages=[
                ChatMessage(role="user", content=prompt)
            ],
            temperature=0.1,  # Low temperature = more deterministic
        )

        raw_text = response.choices[0].message.content.strip()
        
        # Sometimes the model wraps the JSON in markdown backticks
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        result = json.loads(raw_text)

        # Validate the response structure
        if "table" not in result or "column_mapping" not in result:
            logger.warning("Mistral returned invalid structure: %s", raw_text)
            return None

        # Ensure confidence exists
        if "confidence" not in result:
            result["confidence"] = 0.5

        logger.info(
            "AI mapping: table=%s, confidence=%.2f, mapped=%d cols",
            result["table"],
            result["confidence"],
            len(result["column_mapping"]),
        )
        return result

    except json.JSONDecodeError as e:
        logger.error("Mistral returned invalid JSON: %s", e)
        return None
    except Exception as e:
        logger.error("Mistral AI mapping failed: %s", e)
        return None


def apply_mapping(
    records: List[Dict[str, Any]], 
    column_mapping: Dict[str, str]
) -> List[Dict[str, Any]]:
    """
    Rename columns in all records based on the AI-generated mapping.
    
    Example:
        column_mapping = {"Taux de réussite": "success_rate"}
        records = [{"Taux de réussite": 85.5}]
        → returns [{"success_rate": 85.5}]
    """
    mapped_records = []
    for row in records:
        new_row = {}
        for old_key, value in row.items():
            new_key = column_mapping.get(old_key, old_key)
            new_row[new_key] = value
        mapped_records.append(new_row)
    return mapped_records
