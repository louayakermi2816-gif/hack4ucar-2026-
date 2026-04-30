"""
upload.py — File upload endpoint.
POST /api/upload — receives CSV/Excel/PDF, parses it, stores data in the database.
Only admin role can upload files.

Pipeline:
  1. Parse file → extract rows
  2. Try keyword-based detection (fast, no API call)
  3. If unknown → use Mistral AI to map columns (smart, handles French/Arabic)
  4. Insert mapped rows into the correct database table
"""
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.models import (
    Document, AcademicRecord, EmploymentRecord, FinanceRecord,
    EsgRecord, HrRecord, ResearchRecord, InfrastructureRecord,
    PartnershipRecord, User
)
from app.services.parser import parse_file, detect_data_type
from app.services.ai_mapper import ai_map_columns, apply_mapping
from app.services.auth import require_role

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["upload"])

# Maps data type → SQLAlchemy model
MODEL_MAP = {
    "academic":       AcademicRecord,
    "finance":        FinanceRecord,
    "hr":             HrRecord,
    "employment":     EmploymentRecord,
    "esg":            EsgRecord,
    "research":       ResearchRecord,
    "infrastructure": InfrastructureRecord,
    "partnership":    PartnershipRecord,
}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    institution_id: str = Form(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """
    Upload a CSV, Excel, or PDF file for a specific institution.
    The parser detects which data type it is and saves it.
    Falls back to Mistral AI when column names don't match the schema.
    """
    # Validate file type
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("csv", "xlsx", "xls", "pdf"):
        raise HTTPException(400, f"Unsupported file type: .{ext}. Use CSV, Excel, or PDF.")

    # Read file bytes
    file_bytes = await file.read()

    # Save document record
    doc = Document(
        id=uuid.uuid4(),
        institution_id=institution_id,
        filename=file.filename,
        file_type=ext,
        status="processing",
    )
    db.add(doc)

    try:
        # ── Step 1: Parse the file ────────────────────────────────────
        records = parse_file(file_bytes, file.filename)

        if not records:
            doc.status = "error"
            db.commit()
            raise HTTPException(400, "File is empty or could not be parsed.")

        # ── Step 2: Try keyword-based detection (fast) ────────────────
        columns = list(records[0].keys())
        data_type = detect_data_type(columns)
        ai_used = False
        ai_confidence = None
        original_columns = columns.copy()

        # ── Step 3: If unknown → use Mistral AI (smart) ──────────────
        if data_type == "unknown":
            logger.info("Keyword detection failed for columns: %s. Trying AI...", columns)
            
            ai_result = ai_map_columns(
                raw_columns=columns,
                sample_row=records[0],
            )

            if ai_result and ai_result.get("table") in MODEL_MAP:
                data_type = ai_result["table"]
                ai_confidence = ai_result.get("confidence", 0.0)
                ai_used = True

                # Rename columns in all records
                records = apply_mapping(records, ai_result["column_mapping"])
                columns = list(records[0].keys())

                logger.info(
                    "AI mapped to table=%s (confidence=%.2f). Columns: %s → %s",
                    data_type, ai_confidence, original_columns, columns
                )
            else:
                doc.status = "error"
                db.commit()
                raise HTTPException(
                    400,
                    f"Could not detect data type (even with AI). Columns found: {columns}"
                )

        # ── Step 4: Insert rows ───────────────────────────────────────
        Model = MODEL_MAP[data_type]

        inserted = 0
        for row in records:
            row["id"] = uuid.uuid4()
            row["institution_id"] = institution_id

            # Only keep columns that exist on the model
            valid_cols = {c.name for c in Model.__table__.columns}
            clean_row = {k: v for k, v in row.items() if k in valid_cols}

            db.add(Model(**clean_row))
            inserted += 1

        doc.status = "done"
        db.commit()

        # Build response
        response = {
            "status": "success",
            "document_id": str(doc.id),
            "data_type": data_type,
            "rows_inserted": inserted,
            "columns_detected": columns,
        }

        # Add AI info if it was used
        if ai_used:
            response["ai_assisted"] = True
            response["ai_confidence"] = ai_confidence
            response["original_columns"] = original_columns

        return response

    except HTTPException:
        raise
    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(500, f"Processing failed: {str(e)}")

