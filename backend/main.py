# ─────────────────────────────────────────────────────────────────────────────
# main.py — NextDegree AI FastAPI Application
#
# HOW TO RUN:
#   Open a terminal inside /backend and run:
#   py -m uvicorn main:app --reload --port 8000
#
# API docs: http://127.0.0.1:8000/docs
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

# ── Route modules ─────────────────────────────────────────────────────────────
from routes import profile
from routes import recommend
from routes import roi
from routes import emi
from routes import chat

# ── Auto-create all DB tables on startup ──────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── FastAPI app instance ───────────────────────────────────────────────────────
app = FastAPI(
    title="NextDegree AI",
    description=(
        "Backend API for NextDegree AI — study abroad planning platform.\n\n"
        "**Modules:**\n"
        "- `/api/profile`   — Save student profile\n"
        "- `/api/recommend` — University recommendation engine\n"
        "- `/api/roi`       — ROI analysis & financial projection\n"
        "- `/api/emi`       — Education loan EMI calculator\n"
        "- `/api/chat`      — AI Mentor Chatbot (powered by Gemini)\n"
    ),
    version="1.0.0",
)

# ── CORS — allow the React frontend on localhost:5173 ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register all route groups ─────────────────────────────────────────────────
app.include_router(profile.router,   prefix="/api/profile",   tags=["Profile"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["Recommend"])
app.include_router(roi.router,       prefix="/api/roi",       tags=["ROI Analysis"])
app.include_router(emi.router,       prefix="/api/emi",       tags=["EMI Calculator"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["AI Mentor Chat"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    """Confirms the server is live."""
    return {"message": "NextDegree AI Backend Running", "status": "ok"}
