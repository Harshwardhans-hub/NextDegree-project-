# ─────────────────────────────────────────────────────────────────────────────
# routes/recommend.py — API route for university recommendations
#
# Endpoint:  POST /api/recommend
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter
from pydantic import BaseModel, Field

from recommendation import get_recommendations

router = APIRouter()


class RecommendRequest(BaseModel):
    """
    Input schema for the recommendation engine.
    Only the fields needed for scoring are required here.
    """
    cgpa:              float = Field(..., ge=0,   le=10)
    gre_score:         int   = Field(..., ge=260, le=340)
    budget:            int   = Field(..., gt=0)
    preferred_country: str
    course_interest:   str

    class Config:
        json_schema_extra = {
            "example": {
                "cgpa": 8.1,
                "gre_score": 305,
                "budget": 3500000,
                "preferred_country": "USA",
                "course_interest": "Computer Science"
            }
        }


@router.post("/", status_code=200)
def recommend(req: RecommendRequest):
    """
    Calls the rule-based recommendation engine and returns
    a ranked list of matching universities.
    """
    results = get_recommendations(
        cgpa              = req.cgpa,
        gre_score         = req.gre_score,
        budget            = req.budget,
        preferred_country = req.preferred_country,
        course_interest   = req.course_interest,
    )
    return results
