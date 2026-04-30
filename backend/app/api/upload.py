"""
upload.py — File upload endpoint.
POST /api/upload — receives CSV/Excel, parses it, stores data in the database.
"""
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.models import (
    Document, AcademicRecord, EmploymentRecord, FinanceRecord,
    EsgRecord, HrRecord, ResearchRecord, InfrastructureRecord,
    PartnershipRecord
)
from app.services.parser import parse_file, detect_data_type

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
):
    """
    Upload a CSV or Excel file for a specific institution.
    The parser detects which data type it is and saves it.
    """
    # Validate file type
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("csv", "xlsx", "xls"):
        raise HTTPException(400, f"Unsupported file type: .{ext}. Use CSV or Excel.")

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
        # Parse the file
        records = parse_file(file_bytes, file.filename)

        if not records:
            doc.status = "error"
            db.commit()
            raise HTTPException(400, "File is empty or could not be parsed.")

        # Detect data type from column names
        columns = list(records[0].keys())
        data_type = detect_data_type(columns)

        if data_type == "unknown":
            doc.status = "error"
            db.commit()
            raise HTTPException(
                400,
                f"Could not detect data type. Columns found: {columns}"
            )

        # Get the right model
        Model = MODEL_MAP[data_type]

        # Insert each row
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

        return {
            "status": "success",
            "document_id": str(doc.id),
            "data_type": data_type,
            "rows_inserted": inserted,
            "columns_detected": columns,
        }

    except HTTPException:
        raise
    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(500, f"Processing failed: {str(e)}")
