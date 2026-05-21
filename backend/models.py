# ─────────────────────────────────────────────────────────────────────────────
# models.py — SQLAlchemy ORM model for the 'users' table
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy import Column, Integer, String, Float
from database import Base


class UserProfile(Base):
    """
    Represents a student profile stored in SQLite.
    Maps to the 'users' table in nextdegree.db.
    """
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name        = Column(String,  nullable=False)
    email            = Column(String,  unique=True, index=True, nullable=False)
    cgpa             = Column(Float,   nullable=False)
    gre_score        = Column(Integer, nullable=False)
    ielts_score      = Column(Float,   nullable=False)
    preferred_country= Column(String,  nullable=False)
    course_interest  = Column(String,  nullable=False)
    budget           = Column(Integer, nullable=False)
    family_income    = Column(Integer, nullable=False)
