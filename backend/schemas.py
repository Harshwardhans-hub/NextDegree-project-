# ─────────────────────────────────────────────────────────────────────────────
# schemas.py — Pydantic models for request validation and response shaping
#
# This file centralises all shared Pydantic schemas.
# Route-specific schemas (ROI, EMI) live inside their own route files
# because they are tightly coupled to those endpoints.
# ─────────────────────────────────────────────────────────────────────────────

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


# ─────────────────────────────────────────────────────────────────────────────
# Profile Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    """
    Validates the incoming POST /profile request body.
    Pydantic automatically validates all fields before the route handler runs.
    """
    full_name:         str   = Field(..., min_length=2,  max_length=100,  description="Student's full name")
    email:             EmailStr                                             # validates a@b.c format
    cgpa:              float = Field(..., ge=0.0,  le=10.0,               description="CGPA on 10-point scale")
    gre_score:         int   = Field(..., ge=260,  le=340,                description="GRE total score (260–340)")
    ielts_score:       float = Field(..., ge=0.0,  le=9.0,                description="IELTS band (0–9)")
    preferred_country: str   = Field(..., min_length=2,  max_length=60)
    course_interest:   str   = Field(..., min_length=2,  max_length=100)
    budget:            int   = Field(..., gt=0,    le=100_000_000,        description="Total budget in INR")
    family_income:     int   = Field(..., ge=0,    le=500_000_000,        description="Annual family income in INR")

    @field_validator("cgpa")
    @classmethod
    def cgpa_range(cls, v: float) -> float:
        if not (0.0 <= v <= 10.0):
            raise ValueError("CGPA must be between 0.0 and 10.0")
        return v

    @field_validator("gre_score")
    @classmethod
    def gre_range(cls, v: int) -> int:
        if not (260 <= v <= 340):
            raise ValueError("GRE score must be between 260 and 340")
        return v

    @field_validator("ielts_score")
    @classmethod
    def ielts_range(cls, v: float) -> float:
        if not (0.0 <= v <= 9.0):
            raise ValueError("IELTS score must be between 0.0 and 9.0")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "full_name":         "Ronak Shah",
                "email":             "ronak@gmail.com",
                "cgpa":              8.1,
                "gre_score":         305,
                "ielts_score":       7.5,
                "preferred_country": "USA",
                "course_interest":   "Computer Science",
                "budget":            3500000,
                "family_income":     600000,
            }
        }
    }


class ProfileResponse(BaseModel):
    """Schema for the success response returned after saving a profile."""
    message:    str           = "Profile submitted successfully"
    profile_id: Optional[int] = None


# ─────────────────────────────────────────────────────────────────────────────
# ROI Schemas (used for documentation / type hints — route validation is inline)
# ─────────────────────────────────────────────────────────────────────────────

class ROIInput(BaseModel):
    """
    Simple 4-field ROI input.
    Formula:
        total_cost       = tuition_fees + living_cost + visa_cost
        roi_percentage   = ((expected_salary - total_cost) / total_cost) × 100
        break_even_years = total_cost / expected_salary
    """
    tuition_fees:    float = Field(..., gt=0, le=50_000_000,  description="Tuition fees in INR")
    living_cost:     float = Field(..., gt=0, le=20_000_000,  description="Living expenses in INR")
    visa_cost:       float = Field(0,   ge=0, le=2_000_000,   description="Visa + travel cost in INR")
    expected_salary: float = Field(..., gt=0, le=500_000_000, description="Expected annual salary in INR")


class ROIOutput(BaseModel):
    """Shape of the ROI analysis response for documentation."""
    total_cost:       float
    roi_percentage:   float
    break_even_years: float
    roi_category:     str    # Excellent | Good | Average | Low


# ─────────────────────────────────────────────────────────────────────────────
# EMI Schemas (used for documentation / type hints — route validation is inline)
# ─────────────────────────────────────────────────────────────────────────────

class EMIInput(BaseModel):
    """
    EMI calculation input using standard formula:
        EMI = [P × R × (1+R)^N] / [(1+R)^N − 1]
    Where:
        P = loan_amount
        R = interest_rate / 100 / 12
        N = duration_years × 12
    """
    loan_amount:    float = Field(..., gt=0, le=100_000_000, description="Loan principal in INR")
    interest_rate:  float = Field(10.5, ge=0, le=30,         description="Annual interest rate %")
    duration_years: int   = Field(10,   ge=1, le=30,         description="Repayment tenure in years")


class EMIOutput(BaseModel):
    """Shape of the EMI calculator response for documentation."""
    monthly_emi:     float
    total_repayment: float
    total_interest:  float
