# ─────────────────────────────────────────────────────────────────────────────
# routes/profile.py — API route for student profile submission
#
# Endpoint:  POST /api/profile
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter()


@router.post("/", response_model=schemas.ProfileResponse, status_code=201)
def submit_profile(profile: schemas.ProfileCreate, db: Session = Depends(get_db)):
    """
    Accepts a student profile, validates it, and saves it to SQLite.

    Steps:
      1. Check if email already exists (prevent duplicates)
      2. Create a new UserProfile ORM object
      3. Commit to the database
      4. Return a success JSON message
    """

    # ── Step 1: Check for duplicate email ────────────────────────────────────
    existing = db.query(models.UserProfile).filter(
        models.UserProfile.email == profile.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"A profile with email '{profile.email}' already exists."
        )

    # ── Step 2: Build the SQLAlchemy model instance ───────────────────────────
    db_profile = models.UserProfile(
        full_name         = profile.full_name,
        email             = profile.email,
        cgpa              = profile.cgpa,
        gre_score         = profile.gre_score,
        ielts_score       = profile.ielts_score,
        preferred_country = profile.preferred_country,
        course_interest   = profile.course_interest,
        budget            = profile.budget,
        family_income     = profile.family_income,
    )

    # ── Step 3: Save to the database ─────────────────────────────────────────
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)  # Populate the auto-generated id field

    # ── Step 4: Return success response ──────────────────────────────────────
    return schemas.ProfileResponse(message="Profile submitted successfully")


@router.get("/all", status_code=200)
def get_all_profiles(db: Session = Depends(get_db)):
    """
    Returns all saved profiles (useful for admin/debugging).
    """
    profiles = db.query(models.UserProfile).all()
    return profiles
