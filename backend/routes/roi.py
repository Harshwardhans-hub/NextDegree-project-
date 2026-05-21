# ─────────────────────────────────────────────────────────────────────────────
# routes/roi.py — FastAPI route for ROI Analysis
#
# Endpoint: POST /api/roi
#
# Request Body:
#   {
#     "tuition_fees":   2800000,
#     "living_cost":     800000,
#     "visa_cost":       300000,
#     "expected_salary": 8500000
#   }
#
# Response: analytics-ready JSON with ROI%, break-even years, charts data
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from roi import calculate_roi

router = APIRouter()


# ── Request Schema ────────────────────────────────────────────────────────────

class ROIRequest(BaseModel):
    """
    Validates the incoming ROI calculation request.
    All cost fields must be positive numbers.
    """
    tuition_fees:    float = Field(
        ...,
        gt=0,
        le=50_000_000,
        description="Total tuition fees in INR (e.g. 2800000 = ₹28L)",
        examples=[2800000],
    )
    living_cost:     float = Field(
        ...,
        gt=0,
        le=20_000_000,
        description="Total living expenses in INR",
        examples=[800000],
    )
    visa_cost:       float = Field(
        default=0,
        ge=0,
        le=2_000_000,
        description="Visa, travel, and miscellaneous cost in INR",
        examples=[300000],
    )
    expected_salary: float = Field(
        ...,
        gt=0,
        le=500_000_000,
        description="Expected annual salary after degree in INR",
        examples=[8500000],
    )

    @field_validator("tuition_fees", "living_cost", "expected_salary")
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Value must be a positive number.")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "tuition_fees":    2800000,
                "living_cost":      800000,
                "visa_cost":        300000,
                "expected_salary": 8500000,
            }
        }
    }


# ── Response Example Schema (documentation only) ──────────────────────────────

class ROIResponse(BaseModel):
    total_cost:       float
    roi_percentage:   float
    break_even_years: float
    roi_category:     str


# ── Route Handler ─────────────────────────────────────────────────────────────

@router.post(
    "/",
    status_code=200,
    summary="Calculate Study Abroad ROI",
    description=(
        "Calculates Return on Investment (ROI) for studying abroad. "
        "Returns cost breakdown, ROI%, break-even years, salary projection, "
        "and pie chart data. All amounts in INR."
    ),
)
def roi_analysis(req: ROIRequest):
    """
    POST /api/roi

    Computes:
    - Total Cost = tuition + living + visa
    - ROI % = ((salary - cost) / cost) × 100
    - Break-even = cost / salary
    - ROI Category: Excellent / Good / Average / Low
    - Cost breakdown for Pie Chart
    - 10-year salary projection for Line Chart
    """
    result = calculate_roi(
        tuition_fees    = req.tuition_fees,
        living_cost     = req.living_cost,
        visa_cost       = req.visa_cost,
        expected_salary = req.expected_salary,
    )
    return result
