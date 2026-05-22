# ─────────────────────────────────────────────────────────────────────────────
# chatbot.py — Grok AI Mentor Service for NextDegree AI
#
# Uses the openai SDK pointed to xAI's API endpoint.
#
# SETUP:
#   1. Get a key at: https://console.xai.com/
#   2. Add to backend/.env:  XAI_API_KEY=your_key_here
#   3. Run: py -m pip install openai python-dotenv
# ─────────────────────────────────────────────────────────────────────────────

import os
from dotenv import load_dotenv
from fastapi import HTTPException

# ── Load environment variables from backend/.env ──────────────────────────────
load_dotenv()
XAI_API_KEY = os.getenv("XAI_API_KEY", "")

# ── Check if API key is configured ────────────────────────────────────────────
_XAI_READY = bool(XAI_API_KEY and XAI_API_KEY != "your_xai_api_key_here")

if not _XAI_READY:
    print("WARNING: XAI_API_KEY is not set in backend/.env")
    print("   The AI Mentor will return a placeholder response.")
    print("   Get your key at: https://console.xai.com/")
else:
    # Import and configure openai SDK for xAI
    from openai import OpenAI
    _client = OpenAI(
        api_key=XAI_API_KEY,
        base_url="https://api.xai.com/v1",
    )


# ─────────────────────────────────────────────────────────────────────────────
# System Prompt — Defines the AI Mentor's personality and knowledge scope
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are NextDegree AI, a friendly and experienced educational mentor helping
Indian students plan their study abroad journey.

Your expertise covers:
- University selection and comparison (USA, UK, Canada, Australia, Germany)
- MS, MBA, and undergraduate admissions guidance
- GRE, IELTS, TOEFL score benchmarks and preparation advice
- Statement of Purpose (SOP), LOR, and application document tips
- Education loan guidance and EMI planning for Indian students
- Return on Investment (ROI) analysis for study abroad decisions
- Visa processes (F-1, UK Student, Canadian Study Permit, German Student Visa)
- Scholarship opportunities for Indian students
- Post-graduation work permits and career opportunities abroad

Your communication style:
- Friendly and approachable, like a trusted senior who studied abroad
- Give specific, practical advice with real numbers and data
- Use bullet points when listing options or steps
- Be honest and do not make false promises about admissions or outcomes
- Keep responses concise (150-300 words unless a detailed comparison is needed)
- Avoid robotic or overly formal language

Important constraints:
- Do NOT provide immigration legal advice beyond general information
- Do NOT guarantee university admissions or visa approvals
- Stay focused on study abroad topics and politely redirect off-topic questions"""


# ─────────────────────────────────────────────────────────────────────────────
# Main Function: get_mentor_reply
# ─────────────────────────────────────────────────────────────────────────────

def get_mentor_reply(
    message: str,
    chat_history: list[dict] | None = None,
) -> str:
    """
    Sends the student's message to Grok and returns the AI mentor's reply.

    Args:
        message      : The student's current question or message
        chat_history : Optional prior messages for context.
                       Each item: {"role": "user"|"model", "text": str}

    Returns:
        str: The AI mentor's reply text

    Raises:
        HTTPException 400 : If message is empty
        HTTPException 429 : If API quota exceeded
        HTTPException 500 : If API call fails
    """

    # ── Fallback when API key is not configured ───────────────────────────────
    if not _XAI_READY:
        return (
            "Hi! I'm NextDegree AI, your study abroad mentor. "
            "The AI backend is not connected yet (API key missing in backend/.env). "
            "Get a Grok API key at https://console.xai.com/ and "
            "add it to backend/.env as XAI_API_KEY=your_key. "
            "Once configured, I can help with university comparisons, GRE tips, "
            "loan planning, ROI analysis, and much more!"
        )

    # ── Input validation ──────────────────────────────────────────────────────
    if not message or not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if len(message) > 2000:
        raise HTTPException(
            status_code=400,
            detail="Message too long. Please keep questions under 2000 characters."
        )

    try:
        # ── Build conversation history in OpenAI format ───────────────────────
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if chat_history:
            for turn in chat_history:
                # Convert 'model' back to 'assistant' for OpenAI API format
                role = "assistant" if turn.get("role") == "model" else "user"
                text = turn.get("text", "").strip()
                if role in ("user", "assistant") and text:
                    messages.append({"role": role, "content": text})

        # Add the current user message
        messages.append({"role": "user", "content": message.strip()})

        # ── Call Grok API ─────────────────────────────────────────────────────
        response = _client.chat.completions.create(
            model="grok-2-latest",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        # ── Extract reply ─────────────────────────────────────────────────────
        reply = response.choices[0].message.content.strip()

        if not reply:
            raise HTTPException(
                status_code=500,
                detail="The AI returned an empty response. Please try again."
            )

        return reply

    except HTTPException:
        raise  # Re-raise our own clean errors

    except Exception as e:
        err = str(e).lower()

        if "api_key" in err or "api key" in err or "unauthorized" in err or "401" in err:
            raise HTTPException(
                status_code=500,
                detail={
                    "error":   "Invalid Grok API key.",
                    "message": "Check your XAI_API_KEY in backend/.env",
                    "help":    "Get a key at https://console.xai.com/",
                }
            )

        if "quota" in err or "rate" in err or "429" in err:
            raise HTTPException(
                status_code=429,
                detail={
                    "error":   "API quota exceeded.",
                    "message": "You have hit the Grok API limit. Please wait and try again.",
                }
            )

        if "timeout" in err or "deadline" in err:
            raise HTTPException(
                status_code=504,
                detail={
                    "error":   "Request timed out.",
                    "message": "The AI took too long. Please try a shorter question.",
                }
            )

        raise HTTPException(
            status_code=500,
            detail={
                "error":   "AI service error.",
                "message": "Something went wrong with the AI mentor. Please try again.",
            }
        )
