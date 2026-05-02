"""
engine.py — ML prediction engine for UcarOS.

Three models:
  1. Dropout Risk Scoring   → flags institutions likely to exceed dropout thresholds
  2. Enrollment Forecasting → projects student headcount for 2026 & 2027
  3. Budget Forecasting     → predicts next-year budget allocation & consumption

All models use scikit-learn LinearRegression trained on historical
data from PostgreSQL (seeded 2019-2025).
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    AcademicRecord, FinanceRecord, ResearchRecord,
    EmploymentRecord, Institution,
)


# ── 1. DROPOUT RISK ──────────────────────────────────────────────────────
def predict_dropout_risk(db: Session):
    """
    For each institution, fit a linear trend on dropout_rate over semesters.
    If the trend is RISING → high risk.
    Score = latest dropout rate + slope * weight.
    """
    institutions = db.query(Institution).all()
    results = []

    for inst in institutions:
        records = (
            db.query(AcademicRecord)
            .filter(AcademicRecord.institution_id == inst.id)
            .order_by(AcademicRecord.semester)
            .all()
        )
        if len(records) < 3:
            continue

        # X = semester index (0, 1, 2, ...), Y = dropout_rate
        X = np.arange(len(records)).reshape(-1, 1)
        y_dropout = np.array([r.dropout_rate or 0 for r in records])
        y_success = np.array([r.success_rate or 0 for r in records])

        # Fit dropout trend
        model = LinearRegression().fit(X, y_dropout)
        slope = model.coef_[0]
        latest_dropout = y_dropout[-1]
        predicted_next = model.predict([[len(records)]])[0]

        # Risk score: weighted combination of current rate + trend direction
        risk_score = round(min(100, max(0, latest_dropout * 0.6 + predicted_next * 0.4)), 1)

        # Classify risk level
        if risk_score > 12 or slope > 0.5:
            risk_level = "HIGH"
        elif risk_score > 8 or slope > 0.2:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # R² confidence
        r2 = r2_score(y_dropout, model.predict(X))

        results.append({
            "institution_id": str(inst.id),
            "institution_name": inst.name,
            "institution_type": inst.institution_type,
            "current_dropout_rate": round(latest_dropout, 1),
            "predicted_dropout_rate": round(max(0, predicted_next), 1),
            "avg_success_rate": round(float(np.mean(y_success)), 1),
            "trend_slope": round(slope, 3),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": round(max(0, r2 * 100), 1),
        })

    # Sort by risk score descending (highest risk first)
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results


# ── 2. ENROLLMENT FORECAST ───────────────────────────────────────────────
def forecast_enrollment(db: Session):
    """
    Aggregate total enrolled_students per semester across all institutions,
    then fit a linear regression to project 2026 and 2027.
    """
    # Get total enrollment per semester
    semester_totals = (
        db.query(
            AcademicRecord.semester,
            func.sum(AcademicRecord.enrolled_students).label("total"),
        )
        .group_by(AcademicRecord.semester)
        .order_by(AcademicRecord.semester)
        .all()
    )

    if len(semester_totals) < 4:
        return {"error": "Not enough data for forecasting"}

    semesters = [s.semester for s in semester_totals]
    totals = [int(s.total) for s in semester_totals]

    X = np.arange(len(semesters)).reshape(-1, 1)
    y = np.array(totals)

    model = LinearRegression().fit(X, y)
    r2 = r2_score(y, model.predict(X))

    # Predict next 4 semesters (2026 S1, S2 and 2027 S1, S2)
    future_indices = np.array([
        [len(semesters)],
        [len(semesters) + 1],
        [len(semesters) + 2],
        [len(semesters) + 3],
    ])
    predictions = model.predict(future_indices)

    # Build historical + forecast data
    historical = [
        {"semester": sem, "enrolled": tot, "type": "actual"}
        for sem, tot in zip(semesters, totals)
    ]
    forecast = [
        {"semester": "S1-2026", "enrolled": int(max(0, predictions[0])), "type": "predicted"},
        {"semester": "S2-2026", "enrolled": int(max(0, predictions[1])), "type": "predicted"},
        {"semester": "S1-2027", "enrolled": int(max(0, predictions[2])), "type": "predicted"},
        {"semester": "S2-2027", "enrolled": int(max(0, predictions[3])), "type": "predicted"},
    ]

    return {
        "historical": historical,
        "forecast": forecast,
        "trend_slope": round(model.coef_[0], 1),
        "confidence": round(max(0, r2 * 100), 1),
        "model": "LinearRegression",
    }


# ── 3. BUDGET FORECAST ───────────────────────────────────────────────────
def forecast_budget(db: Session):
    """
    Aggregate budget_allocated and budget_consumed per period,
    then project next fiscal year.
    """
    period_totals = (
        db.query(
            FinanceRecord.period,
            func.sum(FinanceRecord.budget_allocated).label("allocated"),
            func.sum(FinanceRecord.budget_consumed).label("consumed"),
        )
        .group_by(FinanceRecord.period)
        .order_by(FinanceRecord.period)
        .all()
    )

    if len(period_totals) < 4:
        return {"error": "Not enough data for forecasting"}

    periods = [p.period for p in period_totals]
    allocated = [float(p.allocated) for p in period_totals]
    consumed = [float(p.consumed) for p in period_totals]

    X = np.arange(len(periods)).reshape(-1, 1)

    # Model for allocated budget
    model_alloc = LinearRegression().fit(X, np.array(allocated))
    r2_alloc = r2_score(np.array(allocated), model_alloc.predict(X))

    # Model for consumed budget
    model_cons = LinearRegression().fit(X, np.array(consumed))
    r2_cons = r2_score(np.array(consumed), model_cons.predict(X))

    # Predict next 4 quarters (2026)
    future_indices = np.array([
        [len(periods)],
        [len(periods) + 1],
        [len(periods) + 2],
        [len(periods) + 3],
    ])
    pred_alloc = model_alloc.predict(future_indices)
    pred_cons = model_cons.predict(future_indices)

    historical = [
        {
            "period": p, "allocated": round(a, 0),
            "consumed": round(c, 0), "type": "actual",
        }
        for p, a, c in zip(periods, allocated, consumed)
    ]

    forecast = [
        {
            "period": f"Q{i+1}-2026",
            "allocated": round(max(0, pred_alloc[i]), 0),
            "consumed": round(max(0, pred_cons[i]), 0),
            "type": "predicted",
        }
        for i in range(4)
    ]

    return {
        "historical": historical,
        "forecast": forecast,
        "allocated_trend_slope": round(model_alloc.coef_[0], 0),
        "consumed_trend_slope": round(model_cons.coef_[0], 0),
        "confidence_allocated": round(max(0, r2_alloc * 100), 1),
        "confidence_consumed": round(max(0, r2_cons * 100), 1),
        "model": "LinearRegression",
    }
