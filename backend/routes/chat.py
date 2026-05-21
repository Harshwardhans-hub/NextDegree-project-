# ─────────────────────────────────────────────────────────────────────────────
# routes/chat.py — FastAPI route for AI Mentor Chatbot
#
# Endpoint: POST /api/chat
#
# Request:
#   { "message": "Should I choose ASU or UTD for MS in CS?" }
#
# Response:
#   { "reply": "...", "message": "...", "timestamp": "..." }
#
# Supports multi-turn conversation via optional chat_history field.
# ─────────────────────────────────────────────────────────────────────────────

from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator
from chatbot import get_mentor_reply

router = APIRouter()


# ── Request Schema ────────────────────────────────────────────────────────────

class ChatTurn(BaseModel):
    """A single turn in the conversation history."""
    role: str   # "user" or "model"
    text: str   # The message content


class ChatRequest(BaseModel):
    """
    Incoming chat request from the frontend.

    Fields:
        message      : The student's current question (required)
        chat_history : Optional previous messages for multi-turn context
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The student's question or message",
        examples=["Should I choose ASU or UTD for MS in CS?"],
    )
    chat_history: list[ChatTurn] = Field(
        default=[],
        description="Previous conversation turns for multi-turn context",
    )

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be empty or only whitespace.")
        return v.strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "Should I choose ASU or UTD for MS in CS?",
                "chat_history": [],
            }
        }
    }


# ── Response Schema ───────────────────────────────────────────────────────────

class ChatResponse(BaseModel):
    """Structured response returned to the frontend."""
    reply:     str   # The AI mentor's response text
    message:   str   # Echo of the user's message
    timestamp: str   # ISO timestamp for frontend display


# ── Route Handler ─────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=ChatResponse,
    status_code=200,
    summary="AI Mentor Chat",
    description=(
        "Send a message to the NextDegree AI Mentor (powered by Google Gemini). "
        "Supports multi-turn conversation via `chat_history`. "
        "Returns AI reply, original message, and timestamp."
    ),
)
def chat_with_mentor(req: ChatRequest):
    """
    POST /api/chat

    Receives student's message, calls Gemini AI, and returns
    the mentor's reply with timestamp.

    Supports optional chat_history for contextual multi-turn conversations.

    Example request:
        {
          "message": "What GRE score do I need for Georgia Tech?",
          "chat_history": [
            { "role": "user",  "text": "I want to study CS in the USA." },
            { "role": "model", "text": "Great choice! What is your target university?" }
          ]
        }
    """

    # Convert history to the dict format expected by chatbot.py
    history = [
        {"role": turn.role, "text": turn.text}
        for turn in req.chat_history
    ]

    # Call the Gemini service
    reply = get_mentor_reply(
        message=req.message,
        chat_history=history,
    )

    return ChatResponse(
        reply=reply,
        message=req.message,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


# ── Chat History Storage (In-Memory) ─────────────────────────────────────────
# Stores sessions in memory. Cleared on server restart.
# Upgrade to SQLite via models.py for persistence.

_chat_log: list[dict] = []


@router.get(
    "/history",
    status_code=200,
    summary="Get Recent Chat History",
    description="Returns the last 50 chat messages stored in memory.",
)
def get_chat_history():
    """
    GET /api/chat/history

    Returns in-memory chat log (last 50 entries).
    This is reset when the server restarts.
    """
    return {
        "count":    len(_chat_log),
        "messages": _chat_log[-50:],
    }
