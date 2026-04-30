"""
chat.py — AI Chat service using Mistral.
Queries the database for context, then asks Mistral to answer.
"""
import os
import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    Institution, AcademicRecord, FinanceRecord, HrRecord,
    ResearchRecord, EmploymentRecord, EsgRecord
)

logger = logging.getLogger(__name__)


def _gather_context(db: Session, user_role: str, institution_id=None) -> str:
    """
    Pull key stats from the DB to give Mistral context.
    Dean: only their campus. President: global summary.
    """
    context_parts = []

    # Get institutions
    inst_q = db.query(Institution)
    if user_role == "dean" and institution_id:
        inst_q = inst_q.filter(Institution.id == institution_id)
    institutions = inst_q.all()
    
    context_parts.append(f"Total institutions: {len(institutions)}")
    context_parts.append("Institutions: " + ", ".join([i.name for i in institutions[:10]]))

    # Academic stats per institution (top 5)
    for inst in institutions[:5]:
        acad = db.query(
            func.avg(AcademicRecord.success_rate),
            func.avg(AcademicRecord.dropout_rate),
        ).filter(AcademicRecord.institution_id == inst.id).one()
        
        if acad[0]:
            context_parts.append(
                f"{inst.name}: success_rate={round(acad[0],1)}%, dropout={round(acad[1],1)}%"
            )

    # Global finance
    fin_q = db.query(
        func.sum(FinanceRecord.budget_allocated),
        func.sum(FinanceRecord.budget_consumed),
    )
    if user_role == "dean" and institution_id:
        fin_q = fin_q.filter(FinanceRecord.institution_id == institution_id)
    budget, consumed = fin_q.one()
    if budget:
        context_parts.append(f"Total budget: {round(budget)} TND, consumed: {round(consumed)} TND")

    # Research
    res_q = db.query(func.sum(ResearchRecord.publications), func.sum(ResearchRecord.patents))
    if user_role == "dean" and institution_id:
        res_q = res_q.filter(ResearchRecord.institution_id == institution_id)
    pubs, patents = res_q.one()
    if pubs:
        context_parts.append(f"Total publications: {pubs}, patents: {patents}")

    return "\n".join(context_parts)


def chat_with_mistral(
    question: str,
    db: Session,
    user_role: str,
    user_name: str,
    institution_id=None,
) -> str:
    """Send a question to Mistral with database context."""
    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key:
        return "Mistral API key not configured."

    try:
        from mistralai.client import MistralClient
        from mistralai.models.chat_completion import ChatMessage

        client = MistralClient(api_key=api_key)

        # Gather DB context
        context = _gather_context(db, user_role, institution_id)

        system_prompt = f"""You are UcarOS AI Assistant for the University of Carthage (UCAR).
You help university leadership analyze KPI data.

Current user: {user_name} (role: {user_role})

Here is the current data from our database:
{context}

Rules:
- Answer in the same language the user writes in (French, English, or Arabic).
- Be concise but insightful.
- If you don't have enough data, say so honestly.
- Always reference specific numbers from the data above.
- For a Dean, focus on their campus. For a President, give the global view.
"""

        response = client.chat(
            model="mistral-small-latest",
            messages=[
                ChatMessage(role="system", content=system_prompt),
                ChatMessage(role="user", content=question),
            ],
            temperature=0.3,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error("Mistral chat failed: %s", e)
        return f"Error: {str(e)}"
