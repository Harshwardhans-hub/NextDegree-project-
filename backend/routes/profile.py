# ─────────────────────────────────────────────────────────────────────────────
# routes/profile.py — API route for student profile submission
#
# Endpoint:  POST /api/profile
# Fixed:     Duplicate email now UPDATES instead of 400 error
#            profile_id is now returned in response
#            Detailed validation logging added
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from database import get_db
import models
import schemas

router = APIRouter()


@router.post("/", response_model=schemas.ProfileResponse, status_code=200)
def submit_profile(profile: schemas.ProfileCreate, db: Session = Depends(get_db)):
    """
    Accepts a student profile, validates it, and saves it to SQLite.

    Behaviour:
      - If email does NOT exist  → create new record, return 200 + profile_id
      - If email already exists  → UPDATE the existing record (upsert), return 200
      This avoids 400 errors during development / demo re-submissions.
    """

    # ── Debug logging (visible in uvicorn terminal) ───────────────────────────
    print("\n[PROFILE] Incoming request payload:")
    print(json.dumps(profile.model_dump(), indent=2))

    # ── Upsert: update if email already exists ────────────────────────────────
    existing = db.query(models.UserProfile).filter(
        models.UserProfile.email == profile.email
    ).first()

    if existing:
        # Update all fields so demo re-submissions always reflect latest data
        existing.full_name         = profile.full_name
        existing.cgpa              = profile.cgpa
        existing.gre_score         = profile.gre_score
        existing.ielts_score       = profile.ielts_score
        existing.preferred_country = profile.preferred_country
        existing.course_interest   = profile.course_interest
        existing.budget            = profile.budget
        existing.family_income     = profile.family_income

        db.commit()
        db.refresh(existing)

        print(f"[PROFILE] Updated existing profile for {profile.email} (id={existing.id})")
        return schemas.ProfileResponse(
            message="Profile updated successfully",
            profile_id=existing.id,
        )

    # ── Create new record ─────────────────────────────────────────────────────
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

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    print(f"[PROFILE] Created new profile for {profile.email} (id={db_profile.id})")
    return schemas.ProfileResponse(
        message="Profile submitted successfully",
        profile_id=db_profile.id,
    )


@router.get("/all", status_code=200)
def get_all_profiles(db: Session = Depends(get_db)):
    """
    Returns all saved profiles (useful for admin / debugging).
    """
    profiles = db.query(models.UserProfile).all()
    return profiles
