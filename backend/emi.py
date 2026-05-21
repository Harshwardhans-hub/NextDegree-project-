# ─────────────────────────────────────────────────────────────────────────────
# emi.py — Education Loan EMI Calculator Engine
#
# Formula (Standard Reducing Balance / Compound Interest):
#   EMI = [P × R × (1+R)^N] / [(1+R)^N − 1]
#
# Where:
#   P = Principal (loan amount)
#   R = Monthly interest rate = annual_rate / 12 / 100
#   N = Total months = duration_years × 12
#
# Outputs analytics-ready JSON for charts + dashboard cards.
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import HTTPException


def calculate_emi(
    loan_amount: float,
    interest_rate: float,
    duration_years: int,
) -> dict:
    """
    Calculates the monthly EMI and complete loan repayment breakdown.

    Args:
        loan_amount    : Principal loan amount in INR
        interest_rate  : Annual interest rate in % (e.g., 10.5)
        duration_years : Loan repayment tenure in years

    Returns:
        dict: Analytics-ready JSON with EMI, totals, amortization, banks
    """

    # ── Input Validation ──────────────────────────────────────────────────────
    _validate_emi_inputs(loan_amount, interest_rate, duration_years)

    # ── Core EMI Formula ──────────────────────────────────────────────────────
    R = interest_rate / 100 / 12    # Monthly interest rate
    N = duration_years * 12          # Total number of monthly payments

    if R == 0:
        # Edge case: 0% interest loan (rare but valid)
        monthly_emi = loan_amount / N
    else:
        # Standard EMI formula: P × R × (1+R)^N / ((1+R)^N − 1)
        monthly_emi = (loan_amount * R * (1 + R) ** N) / ((1 + R) ** N - 1)

    monthly_emi       = round(monthly_emi, 2)
    total_repayment   = round(monthly_emi * N, 2)
    total_interest    = round(total_repayment - loan_amount, 2)
    interest_pct      = round((total_interest / loan_amount) * 100, 1)

    # ── Amortization Schedule (year-wise for BarChart) ────────────────────────
    amortization = _build_amortization(loan_amount, R, monthly_emi, N)

    # ── Bank Suggestions Table ────────────────────────────────────────────────
    bank_suggestions = _bank_suggestions(interest_rate)

    # ── Repayment Timeline Data (for Line Chart) ──────────────────────────────
    repayment_timeline = []
    balance = loan_amount
    for yr in range(1, duration_years + 1):
        for _ in range(12):
            interest_paid    = balance * R
            principal_paid   = monthly_emi - interest_paid
            balance          = max(balance - principal_paid, 0)
        repayment_timeline.append({
            "year":    f"Yr {yr}",
            "balance": round(balance),
            "paid":    round(loan_amount - balance),
            "label":   _fmt(max(balance, 0)),
        })

    return {
        # ── Core EMI Results ──────────────────────────────────────────────────
        "monthly_emi":      monthly_emi,
        "total_repayment":  total_repayment,
        "total_interest":   total_interest,

        # ── Formatted Strings (for UI cards) ─────────────────────────────────
        "monthly_emi_fmt":      _fmt(monthly_emi),
        "total_repayment_fmt":  _fmt(total_repayment),
        "total_interest_fmt":   _fmt(total_interest),
        "loan_amount_fmt":      _fmt(loan_amount),

        # ── Loan Summary ──────────────────────────────────────────────────────
        "loan_summary": {
            "principal":        round(loan_amount),
            "interest_rate":    f"{interest_rate}%",
            "duration":         f"{duration_years} Years",
            "monthly_emi":      _fmt(monthly_emi),
            "total_repayment":  _fmt(total_repayment),
            "total_interest":   _fmt(total_interest),
            "interest_pct":     f"{interest_pct}% of loan",
        },

        # ── Pie Chart Breakdown: Principal vs Interest ────────────────────────
        "repayment_breakdown": [
            {
                "name":       "Principal",
                "value":      round(loan_amount),
                "percentage": round(100 - interest_pct, 1),
                "label":      _fmt(loan_amount),
                "color":      "#6366f1",
            },
            {
                "name":       "Total Interest",
                "value":      round(total_interest),
                "percentage": interest_pct,
                "label":      _fmt(total_interest),
                "color":      "#f59e0b",
            },
        ],

        # ── Year-wise Amortization (for BarChart) ─────────────────────────────
        "amortization": amortization,

        # ── Remaining Balance Timeline (for Line Chart) ───────────────────────
        "repayment_timeline": repayment_timeline,

        # ── Bank Suggestions (for Table) ─────────────────────────────────────
        "bank_suggestions": bank_suggestions,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Year-wise Amortization Builder
# ─────────────────────────────────────────────────────────────────────────────

def _build_amortization(
    principal: float,
    monthly_rate: float,
    emi: float,
    total_months: int,
) -> list:
    """
    Builds a year-wise amortization breakdown.
    Each record shows how much Principal and Interest was paid that year.
    Perfect for Recharts BarChart with stacked bars.
    """
    balance              = principal
    schedule             = []
    year_num             = 0
    yr_principal_paid    = 0.0
    yr_interest_paid     = 0.0

    for month in range(1, total_months + 1):
        interest_portion   = round(balance * monthly_rate, 2)
        principal_portion  = round(emi - interest_portion, 2)
        balance            = round(max(balance - principal_portion, 0), 2)

        yr_interest_paid   += interest_portion
        yr_principal_paid  += principal_portion

        # Every 12 months → append a yearly summary row
        if month % 12 == 0:
            year_num += 1
            schedule.append({
                "year":      f"Year {year_num}",
                "Principal": round(yr_principal_paid),
                "Interest":  round(yr_interest_paid),
                "Balance":   round(balance),
            })
            yr_principal_paid = 0.0
            yr_interest_paid  = 0.0

    return schedule


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Bank Suggestions
# ─────────────────────────────────────────────────────────────────────────────

def _bank_suggestions(requested_rate: float) -> list:
    """
    Returns a curated list of Indian banks offering education loans.
    Marks banks whose rate is within ±1.5% of the requested rate as recommended.
    """
    banks = [
        {
            "bank":     "State Bank of India",
            "rate":     "10.05%",
            "max_loan": "₹1.5Cr",
            "note":     "Govt. backed — lowest rates, Scholar scheme",
        },
        {
            "bank":     "Punjab National Bank",
            "rate":     "10.65%",
            "max_loan": "₹1Cr",
            "note":     "No collateral up to ₹40L",
        },
        {
            "bank":     "Bank of Baroda",
            "rate":     "10.85%",
            "max_loan": "₹1.5Cr",
            "note":     "Baroda Scholar — fast disbursement",
        },
        {
            "bank":     "Axis Bank",
            "rate":     "11.15%",
            "max_loan": "₹75L",
            "note":     "Fully digital process, quick approval",
        },
        {
            "bank":     "HDFC Credila",
            "rate":     "11.75%",
            "max_loan": "₹2Cr",
            "note":     "Specialised education loan arm",
        },
        {
            "bank":     "Avanse Financial",
            "rate":     "12.00%",
            "max_loan": "₹1Cr",
            "note":     "Flexible repayment, moratorium period",
        },
    ]

    for b in banks:
        b_rate = float(b["rate"].replace("%", ""))
        b["recommended"] = abs(b_rate - requested_rate) <= 1.5

    return banks


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Input Validation
# ─────────────────────────────────────────────────────────────────────────────

def _validate_emi_inputs(
    loan_amount: float,
    interest_rate: float,
    duration_years: int,
) -> None:
    """
    Validates all EMI inputs and raises a clean HTTPException if any fail.
    Prevents divide-by-zero and nonsense calculations.
    """
    errors = []

    if loan_amount <= 0:
        errors.append("loan_amount must be greater than 0.")
    if loan_amount > 100_000_000:
        errors.append("loan_amount exceeds maximum limit of ₹10Cr.")

    if interest_rate < 0:
        errors.append("interest_rate cannot be negative.")
    if interest_rate > 50:
        errors.append("interest_rate seems unrealistic. Maximum allowed is 50%.")

    if duration_years < 1:
        errors.append("duration_years must be at least 1 year.")
    if duration_years > 30:
        errors.append("duration_years cannot exceed 30 years.")

    if errors:
        raise HTTPException(
            status_code=422,
            detail={
                "error":    "Validation failed",
                "messages": errors,
            },
        )


# ─────────────────────────────────────────────────────────────────────────────
# Helper: INR Formatter
# ─────────────────────────────────────────────────────────────────────────────

def _fmt(amount: float) -> str:
    """
    Formats an INR value into a readable string.
        Example: 2500000 → ₹25L, 15000000 → ₹1.5Cr
    """
    if amount >= 10_000_000:
        cr = round(amount / 10_000_000, 2)
        return f"₹{cr}Cr"
    lakh = round(amount / 100_000, 2)
    return f"₹{lakh}L"
