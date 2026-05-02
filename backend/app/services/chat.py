"""
chat.py — AI Chat service using Mistral.
Queries the database for context, then asks Mistral to answer.
"""
import os
import json
import logging
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    Institution, AcademicRecord, FinanceRecord, HrRecord,
    ResearchRecord, EmploymentRecord, EsgRecord
)

logger = logging.getLogger(__name__)

# Navigation map for directing users
PAGE_MAP = {
    "budget": "/finance",
    "finance": "/finance",
    "dépenses": "/finance",
    "enrollment": "/enrollment",
    "inscription": "/enrollment",
    "effectif": "/enrollment",
    "academic": "/academic",
    "académique": "/academic",
    "réussite": "/academic",
    "abandon": "/academic",
    "research": "/research",
    "recherche": "/research",
    "publications": "/research",
    "faculty": "/faculty",
    "enseignant": "/faculty",
    "personnel": "/faculty",
    "hr": "/faculty",
    "facilities": "/facilities",
    "infrastructure": "/facilities",
    "strategy": "/strategy",
    "stratégie": "/strategy",
    "analytics": "/analytics",
    "analyse": "/analytics",
    "settings": "/settings",
    "paramètres": "/settings",
    "import": "/upload",
    "upload": "/upload",
}


def _find_page_hint(question: str) -> str:
    """Check if the user is asking about finding a page."""
    q = question.lower()
    for keyword, page in PAGE_MAP.items():
        if keyword in q:
            return f"\n\n💡 Vous pouvez trouver ces informations sur la page **{page}** dans le menu latéral."
    return ""


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
        exec_rate = round(consumed / budget * 100, 1) if budget else 0
        context_parts.append(f"Total budget: {round(budget):,} TND, consumed: {round(consumed):,} TND, execution rate: {exec_rate}%")

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
        # Gather DB context
        context = _gather_context(db, user_role, institution_id)
        page_hint = _find_page_hint(question)

        system_prompt = f"""You are UcarOS AI Assistant for the University of Carthage (UCAR).
You help university leadership analyze KPI data and navigate the platform.

Current user: {user_name} (role: {user_role})

Here is the current data from our database:
{context}

IMPORTANT RULES:
- ALWAYS answer the user's SPECIFIC question first. Do NOT dump all data.
- If the user asks WHERE to find something, tell them which sidebar page to click.
- Answer in the same language the user writes in (French, English, or Arabic).
- Be concise — 2-3 sentences maximum unless asked for detail.
- If you don't have enough data to answer, say so honestly.
- Reference specific numbers from the data when relevant.
- For navigation questions, mention the exact page name from the sidebar.

Available pages in the sidebar:
- Dashboard: overview of all KPIs
- Enrollment: student numbers and trends
- Academic Affairs: success rates, dropout rates
- Research & Grants: publications, patents, funding
- Finance: budget allocation, execution rates
- Faculty & Staff: HR statistics
- Facilities: infrastructure data
- Strategy: strategic planning
- Analytics: advanced charts and predictions
- Import Data: upload CSV/Excel/PDF files
- Settings: theme, language, profile
"""

        # Use httpx directly for Mistral API
        response = httpx.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-small-latest",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question},
                ],
                "temperature": 0.3,
                "max_tokens": 500,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        reply = data["choices"][0]["message"]["content"].strip()

        return reply + page_hint

    except Exception as e:
        logger.error("Mistral chat failed: %s", e)
        # Fallback: try to answer navigation questions without Mistral
        page_hint = _find_page_hint(question)
        if page_hint:
            return f"Je n'ai pas pu contacter l'IA, mais voici une indication :{page_hint}"
        return f"Désolé, une erreur s'est produite avec l'assistant IA. Réessayez dans quelques instants."
