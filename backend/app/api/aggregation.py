"""
aggregation.py — Dashboard overview + cross-institution analytics.

These endpoints return aggregate data (averages, totals, rankings)
across ALL institutions — exactly what the President's dashboard needs.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.base import get_db
from app.models.models import (
    Institution, AcademicRecord, FinanceRecord, HrRecord,
    ResearchRecord, EmploymentRecord, EsgRecord, Alert, User
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview")
def overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Main dashboard stats — the first thing the President sees.
    Returns: total institutions, avg success rate, total budget, active alerts.
    """
    total_institutions = db.query(func.count(Institution.id)).scalar()

    avg_success = db.query(func.avg(AcademicRecord.success_rate)).scalar()
    avg_dropout = db.query(func.avg(AcademicRecord.dropout_rate)).scalar()
    avg_attendance = db.query(func.avg(AcademicRecord.attendance_rate)).scalar()

    total_budget = db.query(func.sum(FinanceRecord.budget_allocated)).scalar()
    total_consumed = db.query(func.sum(FinanceRecord.budget_consumed)).scalar()

    total_staff = db.query(
        func.sum(HrRecord.teaching_staff_count + HrRecord.admin_staff_count)
    ).scalar()

    total_publications = db.query(func.sum(ResearchRecord.publications)).scalar()
    total_patents = db.query(func.sum(ResearchRecord.patents)).scalar()

    active_alerts = db.query(func.count(Alert.id)).filter(
        Alert.resolved_at.is_(None)
    ).scalar()

    return {
        "total_institutions": total_institutions or 0,
        "academic": {
            "avg_success_rate": round(avg_success, 1) if avg_success else 0,
            "avg_dropout_rate": round(avg_dropout, 1) if avg_dropout else 0,
            "avg_attendance_rate": round(avg_attendance, 1) if avg_attendance else 0,
        },
        "finance": {
            "total_budget_allocated": round(total_budget, 0) if total_budget else 0,
            "total_budget_consumed": round(total_consumed, 0) if total_consumed else 0,
            "utilization_rate": round((total_consumed / total_budget * 100), 1) if total_budget and total_consumed else 0,
        },
        "hr": {
            "total_staff": total_staff or 0,
        },
        "research": {
            "total_publications": total_publications or 0,
            "total_patents": total_patents or 0,
        },
        "active_alerts": active_alerts or 0,
    }


@router.get("/ranking")
def ranking(
    metric: str = Query("success_rate", description="Which metric to rank by"),
    limit: int = Query(10, ge=1, le=33),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Rank institutions by a given metric. Used for bar charts.
    
    Supported metrics:
    - success_rate, dropout_rate, attendance_rate (academic)
    - budget_allocated, cost_per_student (finance)
    - publications, patents (research)
    - employability_rate (employment)
    """
    metric_map = {
        "success_rate": (AcademicRecord, AcademicRecord.success_rate),
        "dropout_rate": (AcademicRecord, AcademicRecord.dropout_rate),
        "attendance_rate": (AcademicRecord, AcademicRecord.attendance_rate),
        "budget_allocated": (FinanceRecord, FinanceRecord.budget_allocated),
        "cost_per_student": (FinanceRecord, FinanceRecord.cost_per_student),
        "publications": (ResearchRecord, ResearchRecord.publications),
        "patents": (ResearchRecord, ResearchRecord.patents),
        "employability_rate": (EmploymentRecord, EmploymentRecord.employability_rate),
    }

    if metric not in metric_map:
        return {"error": f"Unknown metric. Available: {list(metric_map.keys())}"}

    Model, column = metric_map[metric]

    results = (
        db.query(
            Institution.name,
            func.avg(column).label("value"),
        )
        .join(Model, Model.institution_id == Institution.id)
        .group_by(Institution.id, Institution.name)
        .order_by(func.avg(column).desc())
        .limit(limit)
        .all()
    )

    return [
        {"institution": r.name, "value": round(float(r.value), 1) if r.value else 0}
        for r in results
    ]


@router.get("/by-type")
def by_type(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Count institutions by type (faculté, école, institut).
    Used for pie charts.
    """
    results = (
        db.query(
            Institution.institution_type,
            func.count(Institution.id).label("count"),
        )
        .group_by(Institution.institution_type)
        .all()
    )
    return [
        {"type": r.institution_type, "count": r.count}
        for r in results
    ]


@router.get("/alerts-summary")
def alerts_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Alert breakdown by severity. Used for alert badge counts.
    """
    results = (
        db.query(
            Alert.severity,
            func.count(Alert.id).label("count"),
        )
        .filter(Alert.resolved_at.is_(None))
        .group_by(Alert.severity)
        .all()
    )
    return {r.severity: r.count for r in results}
