"""
parser.py — Reads uploaded CSV / Excel files and returns extracted rows.
"""
import pandas as pd
import pdfplumber
from io import BytesIO
from typing import List, Dict, Any


def parse_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extract tables from a PDF file using pdfplumber.
    """
    buf = BytesIO(file_bytes)
    records = []
    
    with pdfplumber.open(buf) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                
                # Assume the first row is the header
                header = table[0]
                
                # Clean header names (lowercase, no spaces)
                clean_header = [
                    str(c).strip().lower().replace(" ", "_").replace("\n", "") 
                    if c else f"col_{i}" 
                    for i, c in enumerate(header)
                ]
                
                # Process rows
                for row in table[1:]:
                    if len(row) == len(clean_header):
                        record = dict(zip(clean_header, row))
                        # Basic data type conversion (e.g. "85.5%" -> 85.5)
                        for k, v in record.items():
                            if isinstance(v, str):
                                cleaned_v = v.strip().replace("%", "").replace(",", ".")
                                try:
                                    record[k] = float(cleaned_v)
                                except ValueError:
                                    pass
                        records.append(record)
                        
    return records


def parse_file(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Read a CSV, Excel, or PDF file and return rows as a list of dicts.
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    
    # Handle PDF files
    if ext == "pdf":
        return parse_pdf(file_bytes)
        
    # Handle Excel / CSV files
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
