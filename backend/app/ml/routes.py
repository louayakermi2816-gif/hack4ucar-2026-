"""
routes.py — FastAPI endpoints for ML predictions.

Endpoints:
  GET /api/ml/dropout-risk       → Dropout risk per institution
  GET /api/ml/enrollment-forecast → Enrollment projections 2026-2027
  GET /api/ml/budget-forecast     → Budget projections 2026
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.base import get_db
from app.models.models import User
from app.services.auth import get_current_user
from app.ml.engine import predict_dropout_risk, forecast_enrollment, forecast_budget

router = APIRouter(prefix="/api/ml", tags=["ml-predictions"])


@router.get("/dropout-risk")
def get_dropout_risk(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Returns a list of institutions ranked by dropout risk.
    Each entry includes: risk_score, risk_level, current & predicted rates.
    """
    return predict_dropout_risk(db)


@router.get("/enrollment-forecast")
def get_enrollment_forecast(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Returns historical enrollment data + 4-semester forecast (2026-2027).
    Includes model confidence (R² score).
    """
    return forecast_enrollment(db)


@router.get("/budget-forecast")
def get_budget_forecast(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Returns historical budget data + 4-quarter forecast (2026).
    Includes separate confidence scores for allocated vs consumed.
    """
    return forecast_budget(db)
