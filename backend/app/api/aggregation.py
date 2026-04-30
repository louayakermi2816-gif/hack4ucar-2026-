"""
aggregation.py — Dashboard overview + cross-institution analytics.

Role-aware endpoints:
  - President / Admin: see ALL institutions (global view)
  - Dean: see ONLY their own campus (filtered by institution_id)
  - Researcher: see everything (read-only)
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


def _is_dean(user: User) -> bool:
    """Check if the user is a dean with an assigned institution."""
    return user.role == "dean" and user.institution_id is not None


@router.get("/overview")
def overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Main dashboard stats.
    President/Admin: sees ALL institutions.
    Dean: sees ONLY their campus.
    """
    dean = _is_dean(user)

    # Institution count
    inst_q = db.query(func.count(Institution.id))
    if dean:
        inst_q = inst_q.filter(Institution.id == user.institution_id)
    total_institutions = inst_q.scalar()

    # Academic averages
    acad_q = db.query(
        func.avg(AcademicRecord.success_rate),
        func.avg(AcademicRecord.dropout_rate),
        func.avg(AcademicRecord.attendance_rate),
    )
    if dean:
        acad_q = acad_q.filter(AcademicRecord.institution_id == user.institution_id)
    avg_success, avg_dropout, avg_attendance = acad_q.one()

    # Finance totals
    fin_q = db.query(
        func.sum(FinanceRecord.budget_allocated),
        func.sum(FinanceRecord.budget_consumed),
    )
    if dean:
        fin_q = fin_q.filter(FinanceRecord.institution_id == user.institution_id)
    total_budget, total_consumed = fin_q.one()

    # HR totals
    hr_q = db.query(func.sum(HrRecord.teaching_staff_count + HrRecord.admin_staff_count))
    if dean:
        hr_q = hr_q.filter(HrRecord.institution_id == user.institution_id)
    total_staff = hr_q.scalar()

    # Research totals
    res_q = db.query(func.sum(ResearchRecord.publications), func.sum(ResearchRecord.patents))
    if dean:
        res_q = res_q.filter(ResearchRecord.institution_id == user.institution_id)
    total_publications, total_patents = res_q.one()

    # Alerts
    alert_q = db.query(func.count(Alert.id)).filter(Alert.resolved_at.is_(None))
    if dean:
        alert_q = alert_q.filter(Alert.institution_id == user.institution_id)
    active_alerts = alert_q.scalar()

    return {
        "total_institutions": total_institutions or 0,
        "viewing_as": "dean" if dean else "global",
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
        "hr": {"total_staff": total_staff or 0},
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
    Dean: only sees their own campus in the ranking.
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
    dean = _is_dean(user)

    q = (
        db.query(
            Institution.name,
            func.avg(column).label("value"),
        )
        .join(Model, Model.institution_id == Institution.id)
    )

    if dean:
        q = q.filter(Model.institution_id == user.institution_id)

    results = (
        q.group_by(Institution.id, Institution.name)
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
    Dean: only sees their own institution type.
    """
    dean = _is_dean(user)

    q = db.query(
        Institution.institution_type,
        func.count(Institution.id).label("count"),
    )

    if dean:
        q = q.filter(Institution.id == user.institution_id)

    results = q.group_by(Institution.institution_type).all()

    return [
        {"type": r.institution_type, "count": r.count}
        for r in results
    ]


@router.get("/alerts-summary")
def alerts_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Alert breakdown by severity. Used for alert badge counts.
    Dean: only sees alerts for their campus.
    """
    dean = _is_dean(user)

    q = (
        db.query(
            Alert.severity,
            func.count(Alert.id).label("count"),
        )
        .filter(Alert.resolved_at.is_(None))
    )

    if dean:
        q = q.filter(Alert.institution_id == user.institution_id)

    results = q.group_by(Alert.severity).all()

    return {r.severity: r.count for r in results}
