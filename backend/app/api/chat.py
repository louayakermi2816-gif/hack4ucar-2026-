"""
chat.py — AI Chat endpoint.
POST /api/chat — sends a question to Mistral with DB context.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.base import get_db
from app.models.models import User
from app.services.auth import get_current_user
from app.services.chat import chat_with_mistral, generate_insights

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    language: str = "fr"


class ChatResponse(BaseModel):
    reply: str
    role: str


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Send a message to the AI assistant.
    The assistant has access to the database and answers based on the user's role.
    """
    if not body.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    reply = chat_with_mistral(
        question=body.message,
        db=db,
        user_role=user.role,
        user_name=user.full_name,
        institution_id=user.institution_id,
        language=body.language,
    )

    return ChatResponse(reply=reply, role=user.role)

@router.get("/chat/insights")
def insights(
    inst_ids: str | None = None,
    language: str = "fr",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate 3 smart insights based on selected institutions."""
    selected_ids = [i.strip() for i in inst_ids.split(",")] if inst_ids else []
    if user.role == "dean" and user.institution_id:
        selected_ids = [str(user.institution_id)]
        
    lines = generate_insights(db, selected_ids, language)
    return {"insights": lines}
