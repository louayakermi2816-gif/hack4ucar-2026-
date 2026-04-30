"""
parser.py — Reads uploaded CSV / Excel files and returns extracted rows.
"""
import pandas as pd
from io import BytesIO
from typing import List, Dict, Any


def parse_file(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Read a CSV or Excel file and return rows as a list of dicts.

    Example output:
    [
        {"success_rate": 72.3, "dropout_rate": 8.1, "semester": "S1-2025"},
        {"success_rate": 68.9, "dropout_rate": 10.3, "semester": "S2-2025"},
    ]
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    buf = BytesIO(file_bytes)

    if ext == "csv":
        df = pd.read_csv(buf)
    elif ext in ("xlsx", "xls"):
        df = pd.read_excel(buf)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")

    # Clean column names: strip whitespace, lowercase
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    # Drop completely empty rows
    df = df.dropna(how="all")

    # Convert to list of dicts
    records = df.to_dict(orient="records")

    return records


def detect_data_type(columns: List[str]) -> str:
    """
    Guess which table the data belongs to based on column names.

    Returns: 'academic', 'finance', 'hr', 'employment', 'esg',
             'research', 'infrastructure', 'partnership', or 'unknown'
    """
    col_set = set(columns)

    # Each table has signature columns
    signatures = {
        "academic":       {"success_rate", "dropout_rate", "semester"},
        "finance":        {"budget_allocated", "budget_consumed"},
        "hr":             {"teaching_staff_count", "absenteeism_rate"},
        "employment":     {"employability_rate", "insertion_delay_days"},
        "esg":            {"energy_kwh", "carbon_kg"},
        "research":       {"publications", "patents"},
        "infrastructure": {"room_occupancy_rate", "equipment_status"},
        "partnership":    {"active_agreements", "incoming_mobility"},
    }

    best_match = "unknown"
    best_score = 0

    for data_type, sig_cols in signatures.items():
        score = len(col_set & sig_cols)
        if score > best_score:
            best_score = score
            best_match = data_type

    return best_match
