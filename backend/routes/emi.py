# ─────────────────────────────────────────────────────────────────────────────
# routes/emi.py — FastAPI route for Education Loan EMI Calculator
#
# Endpoint: POST /api/emi
#
# Request Body:
#   {
#     "loan_amount":   2500000,
#     "interest_rate": 10.5,
#     "duration_years": 10
#   }
#
# Response: monthly EMI, total repayment, total interest, charts data
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator
from emi import calculate_emi

router = APIRouter()


# ── Request Schema ────────────────────────────────────────────────────────────

class EMIRequest(BaseModel):
    """
    Validates the incoming EMI calculation request.
    Uses industry-standard constraints for education loans.
    """
    loan_amount:    float = Field(
        ...,
        gt=0,
        le=100_000_000,
        description="Education loan principal amount in INR",
        examples=[2500000],
    )
    interest_rate:  float = Field(
        default=10.5,
        ge=1.0,
        le=30.0,
        description="Annual interest rate in % (e.g. 10.5 for 10.5% p.a.)",
        examples=[10.5],
    )
    duration_years: int   = Field(
        default=10,
        ge=1,
        le=30,
        description="Loan repayment tenure in years",
        examples=[10],
    )

    @field_validator("loan_amount")
    @classmethod
    def loan_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("loan_amount must be greater than 0.")
        return v

    @field_validator("interest_rate")
    @classmethod
    def rate_in_valid_range(cls, v: float) -> float:
        if not (0 <= v <= 50):
            raise ValueError("interest_rate must be between 0 and 50 percent.")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "loan_amount":    2500000,
                "interest_rate":  10.5,
                "duration_years": 10,
            }
        }
    }


# ── Route Handler ─────────────────────────────────────────────────────────────

@router.post(
    "/",
    status_code=200,
    summary="Calculate Education Loan EMI",
    description=(
        "Calculates monthly EMI using the standard reducing-balance formula. "
        "Returns total repayment, total interest, year-wise amortization schedule, "
        "repayment timeline, and Indian bank suggestions. All amounts in INR."
    ),
)
def emi_calculator(req: EMIRequest):
    """
    POST /api/emi

    EMI Formula:
        EMI = [P × R × (1+R)^N] / [(1+R)^N − 1]

    Where:
        P = loan_amount
        R = interest_rate / 100 / 12   (monthly rate)
        N = duration_years × 12         (total months)

    Response includes:
    - monthly_emi, total_repayment, total_interest
    - loan_summary (for cards)
    - repayment_breakdown (for Pie chart)
    - amortization (for BarChart)
    - repayment_timeline (for Line chart)
    - bank_suggestions (for Table)
    """
    result = calculate_emi(
        loan_amount    = req.loan_amount,
        interest_rate  = req.interest_rate,
        duration_years = req.duration_years,
    )
    return result
