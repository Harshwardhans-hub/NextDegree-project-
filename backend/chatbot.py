# ─────────────────────────────────────────────────────────────────────────────
# chatbot.py — Gemini AI Mentor Service for NextDegree AI
#
# Uses the new google-genai SDK (replaces deprecated google-generativeai)
#
# SETUP:
#   1. Get a free API key at: https://aistudio.google.com/app/apikey
#   2. Add to backend/.env:  GEMINI_API_KEY=your_key_here
#   3. Run: py -m pip install google-genai python-dotenv
# ─────────────────────────────────────────────────────────────────────────────

import os
from dotenv import load_dotenv
from fastapi import HTTPException

# ── Load environment variables from backend/.env ──────────────────────────────
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ── Check if API key is configured ────────────────────────────────────────────
_GEMINI_READY = bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here")

if not _GEMINI_READY:
    print("WARNING: GEMINI_API_KEY is not set in backend/.env")
    print("   The AI Mentor will return a placeholder response.")
    print("   Get your free key at: https://aistudio.google.com/app/apikey")
else:
    # Import and configure google-genai SDK
    from google import genai
    from google.genai import types
    _client = genai.Client(api_key=GEMINI_API_KEY)


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
    Sends the student's message to Gemini and returns the AI mentor's reply.

    Args:
        message      : The student's current question or message
        chat_history : Optional prior messages for context.
                       Each item: {"role": "user"|"model", "text": str}

    Returns:
        str: The AI mentor's reply text

    Raises:
        HTTPException 400 : If message is empty
        HTTPException 429 : If API quota exceeded
        HTTPException 500 : If Gemini call fails
    """

    # ── Fallback when API key is not configured ───────────────────────────────
    if not _GEMINI_READY:
        return (
            "Hi! I'm NextDegree AI, your study abroad mentor. "
            "The AI backend is not connected yet (API key missing in backend/.env). "
            "Get a free Gemini API key at https://aistudio.google.com/app/apikey and "
            "add it to backend/.env as GEMINI_API_KEY=your_key. "
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
        # ── Build conversation history in Gemini Content format ───────────────
        contents = []

        if chat_history:
            for turn in chat_history:
                role = turn.get("role", "user")
                text = turn.get("text", "").strip()
                if role in ("user", "model") and text:
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part(text=text)],
                        )
                    )

        # Add the current user message
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text=message.strip())],
            )
        )

        # ── Call Gemini API ───────────────────────────────────────────────────
        response = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.75,        # Slightly creative but grounded
                max_output_tokens=1024,  # Keep responses concise
            ),
        )

        # ── Extract reply ─────────────────────────────────────────────────────
        reply = response.text.strip() if response.text else ""

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

        if "api_key" in err or "api key" in err or "invalid" in err:
            raise HTTPException(
                status_code=500,
                detail={
                    "error":   "Invalid Gemini API key.",
                    "message": "Check your GEMINI_API_KEY in backend/.env",
                    "help":    "Get a free key at https://aistudio.google.com/app/apikey",
                }
            )

        if "quota" in err or "rate" in err or "429" in err:
            raise HTTPException(
                status_code=429,
                detail={
                    "error":   "API quota exceeded.",
                    "message": "You have hit the Gemini free-tier limit. Please wait and try again.",
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
