# ─────────────────────────────────────────────────────────────────────────────
# recommendation.py — Rule-based University Recommendation Engine
#
# Scoring Breakdown (100 pts max):
#   CGPA Match    → +40 pts  (partial credit if within 0.5 grace)
#   GRE Match     → +30 pts  (partial credit if within 5 pts grace)
#   Budget Match  → +20 pts  (partial credit if within 15% of total cost)
#   Country Match → +10 pts
#
# Returns top 10 results, sorted by match_score descending.
# Also provides a human-readable "recommendation_reason" string.
# ─────────────────────────────────────────────────────────────────────────────

import os
import pandas as pd

_CSV_PATH = os.path.join(os.path.dirname(__file__), "datasets", "universities.csv")


def _load_data() -> pd.DataFrame:
    """Load the universities CSV into a Pandas DataFrame."""
    return pd.read_csv(_CSV_PATH)


def _build_reason(cgpa, gre_score, budget, preferred_country, row) -> str:
    """
    Generate a short human-readable explanation of why this university was matched.
    Makes the results feel intelligent without any ML.
    """
    reasons = []
    total_cost = row["tuition_fees"] + row["living_cost"]

    if cgpa >= row["min_cgpa"]:
        reasons.append("strong CGPA match")
    elif cgpa >= row["min_cgpa"] - 0.5:
        reasons.append("near-match CGPA")

    if gre_score >= row["min_gre"]:
        reasons.append("GRE score qualifies")
    elif gre_score >= row["min_gre"] - 5:
        reasons.append("GRE slightly below cutoff")

    if budget >= total_cost:
        reasons.append("fits within your budget")
    elif budget >= total_cost * 0.85:
        reasons.append("affordable with minor budget stretch")

    if preferred_country.strip().lower() == row["country"].strip().lower():
        reasons.append(f"located in your preferred country ({row['country']})")

    if row["roi_rating"] == "Excellent":
        reasons.append("excellent ROI potential")

    if not reasons:
        reasons.append("closest available match")

    # Capitalise first word
    sentence = ", ".join(reasons)
    return sentence[0].upper() + sentence[1:] + "."


def _score_row(cgpa, gre_score, budget, preferred_country, row) -> int:
    """
    Score a single university row against the student profile.
    Returns an integer between 0 and 100.
    """
    pts = 0
    total_cost = row["tuition_fees"] + row["living_cost"]

    # CGPA — full or partial credit
    if cgpa >= row["min_cgpa"]:
        pts += 40
    elif cgpa >= row["min_cgpa"] - 0.5:
        pts += 20

    # GRE — full or partial credit
    if gre_score >= row["min_gre"]:
        pts += 30
    elif gre_score >= row["min_gre"] - 5:
        pts += 15

    # Budget — full or partial credit
    if budget >= total_cost:
        pts += 20
    elif budget >= total_cost * 0.85:
        pts += 10

    # Country preference
    if preferred_country.strip().lower() == row["country"].strip().lower():
        pts += 10

    return min(pts, 100)


def get_recommendations(
    cgpa: float,
    gre_score: int,
    budget: int,
    preferred_country: str,
    course_interest: str,
) -> list[dict]:
    """
    Main recommendation function.

    Steps:
      1. Load university dataset
      2. Filter by course interest (keyword match)
      3. Score each university using rule-based logic
      4. Filter out poor matches (score <= 30)
      5. Sort by score descending
      6. De-duplicate by university name (keep best-scored course)
      7. Return top 10 with formatted response + reason
    """
    df = _load_data()

    # ── Step 1: Filter by course keyword ─────────────────────────────────────
    keywords = course_interest.lower().split()
    course_mask = df["course"].str.lower().apply(
        lambda c: any(kw in c for kw in keywords)
    )
    filtered = df[course_mask].copy()

    # Fallback: if no course matches, use full dataset
    if filtered.empty:
        filtered = df.copy()

    # ── Step 2: Score every row ───────────────────────────────────────────────
    filtered["match_score"] = filtered.apply(
        lambda row: _score_row(cgpa, gre_score, budget, preferred_country, row),
        axis=1
    )

    # ── Step 3: Remove poor matches ───────────────────────────────────────────
    filtered = filtered[filtered["match_score"] > 30]

    # ── Step 4: Sort best first ───────────────────────────────────────────────
    filtered = filtered.sort_values("match_score", ascending=False)

    # ── Step 5: De-duplicate university names ─────────────────────────────────
    filtered = filtered.drop_duplicates(subset="university_name", keep="first")

    # ── Step 6: Build response ────────────────────────────────────────────────
    results = []
    for _, row in filtered.head(10).iterrows():
        tuition_l = round(row["tuition_fees"] / 100000, 1)
        salary_l  = round(row["avg_salary"]   / 100000, 1)
        results.append({
            "university_name":        row["university_name"],
            "country":                row["country"],
            "course":                 row["course"],
            "match_score":            int(row["match_score"]),
            "tuition_fees":           f"₹{tuition_l}L",
            "avg_salary":             f"₹{salary_l}L",
            "roi_rating":             row["roi_rating"],
            "tuition_raw":            int(row["tuition_fees"]),
            "salary_raw":             int(row["avg_salary"]),
            "recommendation_reason":  _build_reason(
                cgpa, gre_score, budget, preferred_country, row
            ),
        })

    return results
