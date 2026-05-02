from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid
from fpdf import FPDF

from app.models.base import get_db
from app.models.models import (
    Institution, AcademicRecord, FinanceRecord, HrRecord, ResearchRecord, User
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

def _is_dean(user: User) -> bool:
    return user.role == "dean" and user.institution_id is not None

@router.get("/download")
def download_report(
    inst_ids: str | None = Query(None, description="Comma-separated UUIDs"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    dean = _is_dean(user)
    selected_ids = [i.strip() for i in inst_ids.split(",") if i.strip()] if inst_ids else []
    if dean:
        selected_ids = [str(user.institution_id)]

    # Fetch data
    acad_q = db.query(
        func.avg(AcademicRecord.success_rate),
        func.avg(AcademicRecord.dropout_rate),
        func.sum(AcademicRecord.enrolled_students),
    )
    fin_q = db.query(func.sum(FinanceRecord.budget_allocated))
    inst_q = db.query(func.count(Institution.id))

    if selected_ids:
        acad_q = acad_q.filter(AcademicRecord.institution_id.in_(selected_ids))
        fin_q = fin_q.filter(FinanceRecord.institution_id.in_(selected_ids))
        inst_q = inst_q.filter(Institution.id.in_(selected_ids))

    avg_success, avg_dropout, total_enrolled = acad_q.one()
    total_budget = fin_q.scalar()
    total_inst = inst_q.scalar()

    # Determine display name for institutions
    inst_display_name = f"{total_inst or 0} institutions"
    if selected_ids and len(selected_ids) == 1:
        single_inst = db.query(Institution).filter(Institution.id == selected_ids[0]).first()
        if single_inst:
            inst_display_name = single_inst.name

    # Create PDF
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font('helvetica', 'B', 24)
    pdf.set_text_color(212, 175, 55) # Gold
    pdf.cell(0, 15, 'UcarOS Executive Report', border=0, new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.ln(10)

    # Subtitle
    pdf.set_font('helvetica', 'I', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, f'Report generated for: {user.full_name} ({user.role.upper()})', border=0, new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f'Scope: {inst_display_name}', border=0, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    # Metrics Table
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, 'Key Performance Indicators (KPIs)', border=0, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font('helvetica', '', 12)
    pdf.cell(100, 10, 'Total Enrolled Students:', border=0)
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, f'{int(total_enrolled or 0):,}', border=0, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font('helvetica', '', 12)
    pdf.cell(100, 10, 'Average Success Rate:', border=0)
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, f'{round(avg_success or 0, 1)}%', border=0, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font('helvetica', '', 12)
    pdf.cell(100, 10, 'Average Dropout Rate:', border=0)
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, f'{round(avg_dropout or 0, 1)}%', border=0, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font('helvetica', '', 12)
    pdf.cell(100, 10, 'Total Allocated Budget:', border=0)
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, f'{int(total_budget or 0):,} TND', border=0, new_x="LMARGIN", new_y="NEXT")

    # Footer
    pdf.set_y(-15)
    pdf.set_font('helvetica', 'I', 8)
    pdf.cell(0, 10, 'Generated automatically by UcarOS (Hack4UCAR 2025)', align='C')

    # Save to temp file
    filename = f"/tmp/report_{uuid.uuid4().hex}.pdf"
    pdf.output(filename)

    return FileResponse(
        path=filename,
        filename="UcarOS_Executive_Report.pdf",
        media_type="application/pdf",
        background=None # File cleanup could be done here with BackgroundTasks
    )
