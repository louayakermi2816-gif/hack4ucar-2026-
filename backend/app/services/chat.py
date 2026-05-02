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


def _find_page_hint(question: str, language: str = "fr") -> str:
    """Check if the user is asking about finding a page."""
    q = question.lower()
    for keyword, page in PAGE_MAP.items():
        if keyword in q:
            if language == "en":
                return f"\n\n💡 You can find this information on the **{page}** page in the sidebar."
            elif language == "ar":
                return f"\n\n💡 يمكنك العثور على هذه المعلومات في صفحة **{page}** في القائمة الجانبية."
            else:
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
    language: str = "fr",
) -> str:
    """Send a question to Mistral with database context."""
    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key:
        return "Mistral API key not configured."

    try:
        # Gather DB context
        context = _gather_context(db, user_role, institution_id)
        page_hint = _find_page_hint(question, language)

        lang_names = {"fr": "French", "en": "English", "ar": "Arabic"}
        response_lang = lang_names.get(language, "French")

        system_prompt = f"""You are UcarOS AI Assistant for the University of Carthage (UCAR).
You help university leadership analyze KPI data and navigate the platform.

Current user: {user_name} (role: {user_role})
User's selected language: {response_lang}

Here is the current data from our database:
{context}

IMPORTANT RULES:
- YOU MUST RESPOND IN {response_lang.upper()}. This is mandatory.
- ALWAYS answer the user's SPECIFIC question first. Do NOT dump all data.
- If the user asks WHERE to find something, tell them which sidebar page to click.
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
        page_hint = _find_page_hint(question, language)
        if page_hint:
            if language == "en":
                return f"I couldn't reach the AI, but here's a hint:{page_hint}"
            elif language == "ar":
                return f"لم أتمكن من الاتصال بالذكاء الاصطناعي، ولكن إليك تلميح:{page_hint}"
            return f"Je n'ai pas pu contacter l'IA, mais voici une indication :{page_hint}"
        if language == "en":
            return "Sorry, an error occurred with the AI assistant. Please try again."
        elif language == "ar":
            return "عذرًا، حدث خطأ في مساعد الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
        return f"Désolé, une erreur s'est produite avec l'assistant IA. Réessayez dans quelques instants."

def generate_insights(db: Session, selected_ids: list[str], language: str = "fr") -> list[str]:
    """Ask Mistral to generate 3 actionable insights based on selected institutions."""
    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key:
        return ["La clé API Mistral n'est pas configurée."] * 3

    # Gather Context
    acad_q = db.query(func.avg(AcademicRecord.success_rate), func.avg(AcademicRecord.dropout_rate))
    if selected_ids:
        acad_q = acad_q.filter(AcademicRecord.institution_id.in_(selected_ids))
    acad = acad_q.first()
    succ = round(acad[0], 1) if acad and acad[0] else "N/A"
    drop = round(acad[1], 1) if acad and acad[1] else "N/A"

    prompt = f"""
    You are an AI analyst for a University President.
    Current data for selected institutions:
    - Success Rate: {succ}%
    - Dropout Rate: {drop}%
    
    Write EXACTLY 3 short, actionable insights/bullet points about this data.
    Do not use introductory text. Just output 3 bullet points starting with a dash (-).
    Respond in {'French' if language == 'fr' else 'English'}.
    """

    try:
        response = httpx.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "mistral-small-latest",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
                "max_tokens": 300,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
        reply = data["choices"][0]["message"]["content"].strip()
        
        # Parse bullet points
        lines = [line.strip().lstrip('-').lstrip('*').strip() for line in reply.split('\n') if line.strip()]
        return lines[:3]
    except Exception as e:
        logger.error("Insights generation failed: %s", e)
        return ["Analyse IA non disponible pour le moment.", "Vérifiez la connexion réseau.", "Consultez les graphiques pour plus de détails."]

