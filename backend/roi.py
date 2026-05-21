# ─────────────────────────────────────────────────────────────────────────────
# roi.py — Return on Investment (ROI) Calculation Engine
#
# Formula used:
#   Total Cost       = tuition_fees + living_cost + visa_cost
#   ROI %            = ((expected_salary - total_cost) / total_cost) × 100
#   Break-even Years = total_cost / expected_salary
#
# Outputs analytics-ready JSON for Recharts charts + dashboard cards.
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import HTTPException


def calculate_roi(
    tuition_fees: float,
    living_cost: float,
    visa_cost: float,
    expected_salary: float,
) -> dict:
    """
    Calculates ROI, break-even years, and financial analytics
    for a study-abroad investment.

    Args:
        tuition_fees    : Total tuition fee in INR
        living_cost     : Total living expenses in INR
        visa_cost       : Visa + travel + misc cost in INR
        expected_salary : Expected annual salary post-degree in INR

    Returns:
        dict: Analytics-ready JSON with all computed fields
    """

    # ── Input guard — all values must be positive ─────────────────────────────
    _validate_roi_inputs(tuition_fees, living_cost, visa_cost, expected_salary)

    # ── Step 1: Total Education Cost ──────────────────────────────────────────
    total_cost = tuition_fees + living_cost + visa_cost

    # ── Step 2: ROI Percentage ────────────────────────────────────────────────
    #   ROI = ((expected_salary - total_cost) / total_cost) × 100
    roi_percentage = ((expected_salary - total_cost) / total_cost) * 100
    roi_percentage = round(roi_percentage, 2)

    # ── Step 3: Break-even Years ──────────────────────────────────────────────
    #   break_even = total_cost / expected_salary
    break_even_years = round(total_cost / expected_salary, 2)

    # ── Step 4: ROI Category ──────────────────────────────────────────────────
    roi_category = _get_roi_category(roi_percentage)

    # ── Step 5: 10-Year Salary Projection (3% annual raise) ──────────────────
    salary_projection = []
    for yr in range(1, 11):
        projected = round(expected_salary * (1.03 ** yr))
        salary_projection.append({
            "year":   f"Year {yr}",
            "value":  projected,
            "label":  _fmt(projected),
        })

    # ── Step 6: Cost Breakdown for Pie Chart ─────────────────────────────────
    cost_breakdown = [
        {
            "name":       "Tuition Fees",
            "value":      round(tuition_fees),
            "percentage": round((tuition_fees / total_cost) * 100, 1),
            "label":      _fmt(tuition_fees),
            "color":      "#6366f1",
        },
        {
            "name":       "Living Cost",
            "value":      round(living_cost),
            "percentage": round((living_cost / total_cost) * 100, 1),
            "label":      _fmt(living_cost),
            "color":      "#8b5cf6",
        },
        {
            "name":       "Visa & Travel",
            "value":      round(visa_cost),
            "percentage": round((visa_cost / total_cost) * 100, 1),
            "label":      _fmt(visa_cost),
            "color":      "#a78bfa",
        },
    ]

    # ── Step 7: Summary Cards data for Dashboard ──────────────────────────────
    net_gain_10yr  = round((expected_salary * 10) - total_cost)
    monthly_salary = round(expected_salary / 12)

    return {
        # ── Core Results ──────────────────────────────────────────────────────
        "total_cost":       round(total_cost),
        "roi_percentage":   roi_percentage,
        "break_even_years": break_even_years,
        "roi_category":     roi_category,

        # ── Formatted Strings (for display cards) ────────────────────────────
        "total_cost_fmt":       _fmt(total_cost),
        "expected_salary_fmt":  _fmt(expected_salary),
        "monthly_salary_fmt":   _fmt(monthly_salary),
        "net_gain_10yr_fmt":    _fmt(max(net_gain_10yr, 0)),

        # ── Cost Breakdown (for Pie Chart) ────────────────────────────────────
        "cost_breakdown": cost_breakdown,

        # ── Salary Projection (for Line Chart) ───────────────────────────────
        "salary_projection": salary_projection,

        # ── Summary object for dashboard cards ───────────────────────────────
        "summary": {
            "total_cost":       _fmt(total_cost),
            "roi_percentage":   f"{roi_percentage}%",
            "break_even_years": f"{break_even_years} yrs",
            "roi_category":     roi_category,
            "monthly_salary":   _fmt(monthly_salary),
            "net_gain_10yr":    _fmt(max(net_gain_10yr, 0)),
        },

        # ── Analytics metadata for charts ────────────────────────────────────
        "analytics": {
            "tuition_pct":    round((tuition_fees / total_cost) * 100, 1),
            "living_pct":     round((living_cost  / total_cost) * 100, 1),
            "visa_pct":       round((visa_cost    / total_cost) * 100, 1),
            "salary_vs_cost": round(expected_salary / total_cost, 2),
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Helper: ROI Category Classifier
# ─────────────────────────────────────────────────────────────────────────────

def _get_roi_category(roi_pct: float) -> str:
    """
    Converts raw ROI percentage into a human-readable category string.

    Thresholds:
        > 100%      → Excellent
        60–100%     → Good
        30–60%      → Average
        < 30%       → Low
    """
    if roi_pct > 100:
        return "Excellent"
    elif roi_pct >= 60:
        return "Good"
    elif roi_pct >= 30:
        return "Average"
    else:
        return "Low"


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Input Validation
# ─────────────────────────────────────────────────────────────────────────────

def _validate_roi_inputs(
    tuition_fees: float,
    living_cost: float,
    visa_cost: float,
    expected_salary: float,
) -> None:
    """
    Raises HTTPException 422 for any invalid or unsafe input values.
    Prevents divide-by-zero and negative-value bugs.
    """
    errors = []

    if tuition_fees <= 0:
        errors.append("tuition_fees must be a positive number.")
    if living_cost <= 0:
        errors.append("living_cost must be a positive number.")
    if visa_cost < 0:
        errors.append("visa_cost cannot be negative.")
    if expected_salary <= 0:
        errors.append("expected_salary must be a positive number.")

    # Guard against absurd salary values (sanity check)
    if expected_salary > 500_000_000:
        errors.append("expected_salary seems unrealistically high. Check your input.")

    if errors:
        raise HTTPException(
            status_code=422,
            detail={
                "error":    "Validation failed",
                "messages": errors,
            },
        )


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Format INR values
# ─────────────────────────────────────────────────────────────────────────────

def _fmt(amount: float) -> str:
    """
    Formats a large INR value as a readable string.
    Examples:
        150000   → ₹1.5L
        2500000  → ₹25L
        10000000 → ₹1Cr
    """
    if amount >= 10_000_000:
        cr = round(amount / 10_000_000, 2)
        return f"₹{cr}Cr"
    lakh = round(amount / 100_000, 2)
    return f"₹{lakh}L"
