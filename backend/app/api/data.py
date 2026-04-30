"""
data.py — GET endpoints for the frontend to fetch KPI data.
All endpoints require authentication (JWT token).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.models import (
    Institution, AcademicRecord, EmploymentRecord, FinanceRecord,
    EsgRecord, HrRecord, ResearchRecord, InfrastructureRecord,
    PartnershipRecord, Alert, Document, User
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api", tags=["data"])


@router.get("/institutions")
def list_institutions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Institution)
    if user.role == "dean":
        query = query.filter(Institution.id == user.institution_id)
    rows = query.order_by(Institution.name).all()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "institution_type": r.institution_type,
            "location": r.location,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}")
def get_institution(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == "dean" and str(user.institution_id) != inst_id:
        raise HTTPException(403, "You can only view your own institution")
    inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not inst:
        raise HTTPException(404, "Institution not found")
    return {
        "id": str(inst.id),
        "name": inst.name,
        "institution_type": inst.institution_type,
        "location": inst.location,
    }


@router.get("/institutions/{inst_id}/academic")
def get_academic(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(AcademicRecord).filter(
        AcademicRecord.institution_id == inst_id
    ).order_by(AcademicRecord.semester).all()
    return [
        {
            "id": str(r.id), "semester": r.semester,
            "success_rate": r.success_rate, "attendance_rate": r.attendance_rate,
            "repetition_rate": r.repetition_rate, "dropout_rate": r.dropout_rate,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/employment")
def get_employment(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(EmploymentRecord).filter(
        EmploymentRecord.institution_id == inst_id
    ).order_by(EmploymentRecord.year).all()
    return [
        {
            "id": str(r.id), "year": r.year,
            "employability_rate": r.employability_rate,
            "insertion_delay_days": r.insertion_delay_days,
            "national_conventions": r.national_conventions,
            "international_conventions": r.international_conventions,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/finance")
def get_finance(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(FinanceRecord).filter(
        FinanceRecord.institution_id == inst_id
    ).order_by(FinanceRecord.period).all()
    return [
        {
            "id": str(r.id), "period": r.period,
            "budget_allocated": r.budget_allocated,
            "budget_consumed": r.budget_consumed,
            "cost_per_student": r.cost_per_student,
            "department": r.department,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/esg")
def get_esg(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(EsgRecord).filter(
        EsgRecord.institution_id == inst_id
    ).order_by(EsgRecord.period).all()
    return [
        {
            "id": str(r.id), "period": r.period,
            "energy_kwh": r.energy_kwh, "carbon_kg": r.carbon_kg,
            "recycling_rate": r.recycling_rate, "mobility_type": r.mobility_type,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/hr")
def get_hr(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(HrRecord).filter(
        HrRecord.institution_id == inst_id
    ).order_by(HrRecord.period).all()
    return [
        {
            "id": str(r.id), "period": r.period,
            "teaching_staff_count": r.teaching_staff_count,
            "admin_staff_count": r.admin_staff_count,
            "absenteeism_rate": r.absenteeism_rate,
            "training_hours": r.training_hours,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/research")
def get_research(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(ResearchRecord).filter(
        ResearchRecord.institution_id == inst_id
    ).order_by(ResearchRecord.year).all()
    return [
        {
            "id": str(r.id), "year": r.year,
            "publications": r.publications, "active_projects": r.active_projects,
            "funding_secured": r.funding_secured, "patents": r.patents,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/infrastructure")
def get_infrastructure(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(InfrastructureRecord).filter(
        InfrastructureRecord.institution_id == inst_id
    ).all()
    return [
        {
            "id": str(r.id), "period": r.period,
            "room_occupancy_rate": r.room_occupancy_rate,
            "equipment_status": r.equipment_status,
            "ongoing_works": r.ongoing_works,
        }
        for r in rows
    ]


@router.get("/institutions/{inst_id}/partnership")
def get_partnership(inst_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(PartnershipRecord).filter(
        PartnershipRecord.institution_id == inst_id
    ).all()
    return [
        {
            "id": str(r.id),
            "active_agreements": r.active_agreements,
            "incoming_mobility": r.incoming_mobility,
            "outgoing_mobility": r.outgoing_mobility,
        }
        for r in rows
    ]


@router.get("/alerts")
def list_alerts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Alert)
    if user.role == "dean" and user.institution_id:
        q = q.filter(Alert.institution_id == user.institution_id)
    rows = q.order_by(Alert.triggered_at.desc()).all()
    return [
        {
            "id": str(r.id),
            "institution_id": str(r.institution_id),
            "kpi_domain": r.kpi_domain,
            "severity": r.severity,
            "message_fr": r.message_fr,
            "message_ar": r.message_ar,
            "triggered_at": r.triggered_at.isoformat() if r.triggered_at else None,
        }
        for r in rows
    ]


@router.get("/documents")
def list_documents(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Document)
    if user.role == "dean" and user.institution_id:
        q = q.filter(Document.institution_id == user.institution_id)
    rows = q.order_by(Document.uploaded_at.desc()).all()
    return [
        {
            "id": str(r.id),
            "institution_id": str(r.institution_id),
            "filename": r.filename,
            "file_type": r.file_type,
            "status": r.status,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
        }
        for r in rows
    ]
