# ─────────────────────────────────────────────────────────────────────────────
# recommendation.py — Rule-based University Recommendation Engine
#
# Scoring Breakdown (100 pts max):
#   CGPA Match        → up to 35 pts  (proportional, bonus for excellence)
#   GRE Match         → up to 30 pts  (proportional, bonus for excellence)
#   Budget Match      → up to 25 pts  (tiered: comfortable / tight / stretch)
#   Country Match     → 10 pts        (full or 0)
#
# Scores are intentionally spread across the 0–100 range so different
# students get meaningfully different percentages.
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


def _build_reason(cgpa: float, gre_score: int, budget: int,
                  preferred_country: str, row) -> str:
    """
    Generate a short human-readable explanation of why this university was matched.
    Makes the results feel intelligent without any ML.
    """
    reasons = []
    total_cost = row["tuition_fees"] + row["living_cost"]

    # CGPA reasons
    if cgpa >= row["min_cgpa"] + 1.0:
        reasons.append("your CGPA significantly exceeds the requirement")
    elif cgpa >= row["min_cgpa"]:
        reasons.append("strong CGPA match")
    elif cgpa >= row["min_cgpa"] - 0.5:
        reasons.append("CGPA is close to the requirement")

    # GRE reasons
    if gre_score >= row["min_gre"] + 15:
        reasons.append("GRE score well above cutoff")
    elif gre_score >= row["min_gre"]:
        reasons.append("GRE score qualifies")
    elif gre_score >= row["min_gre"] - 5:
        reasons.append("GRE slightly below cutoff — conditional acceptance possible")

    # Budget reasons
    if budget >= total_cost * 1.3:
        reasons.append("comfortably within budget")
    elif budget >= total_cost:
        reasons.append("fits within your budget")
    elif budget >= total_cost * 0.85:
        reasons.append("affordable with minor budget stretch")

    # Country match
    if preferred_country.strip().lower() == row["country"].strip().lower():
        reasons.append(f"located in your preferred destination ({row['country']})")

    # ROI bonus
    if row["roi_rating"] == "Excellent":
        reasons.append("excellent post-graduation ROI")

    if not reasons:
        reasons.append("closest available match based on your profile")

    sentence = ", ".join(reasons)
    return sentence[0].upper() + sentence[1:] + "."


def _score_row(cgpa: float, gre_score: int, budget: int,
               preferred_country: str, row) -> float:
    """
    Score a single university row against the student profile.
    Returns a float between 0 and 100 with fine-grained differentiation.
    """
    pts = 0.0
    total_cost = row["tuition_fees"] + row["living_cost"]

    # ── CGPA (up to 35 pts) ───────────────────────────────────────────────────
    cgpa_gap = cgpa - row["min_cgpa"]
    if cgpa_gap >= 0:
        # Full score + proportional bonus (max 10 bonus pts)
        pts += 25 + min(cgpa_gap * 5, 10)
    elif cgpa_gap >= -0.5:
        # Partial credit for near-miss
        pts += 25 + (cgpa_gap * 30)   # e.g. -0.3 gap → 25-9 = 16 pts
    # else: 0 pts — too far below requirement

    # ── GRE (up to 30 pts) ───────────────────────────────────────────────────
    gre_gap = gre_score - row["min_gre"]
    if gre_gap >= 0:
        # Full score + proportional bonus (max 5 bonus pts)
        pts += 25 + min(gre_gap * 0.25, 5)
    elif gre_gap >= -5:
        # Partial credit
        pts += 25 + (gre_gap * 3)     # e.g. -3 gap → 25-9 = 16 pts
    # else: 0 pts

    # ── Budget (up to 25 pts, tiered) ────────────────────────────────────────
    budget_ratio = budget / total_cost if total_cost > 0 else 0
    if budget_ratio >= 1.3:
        pts += 25                     # Comfortably within budget
    elif budget_ratio >= 1.0:
        pts += 20                     # Fits
    elif budget_ratio >= 0.85:
        pts += 10                     # Tight stretch
    elif budget_ratio >= 0.70:
        pts += 3                      # Very tight — still shows but low score
    # else: 0 pts

    # ── Country preference (10 pts) ───────────────────────────────────────────
    if preferred_country.strip().lower() == row["country"].strip().lower():
        pts += 10

    return round(min(pts, 100), 1)


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
      2. Filter by course interest (keyword match, with fallback)
      3. Score each university using rule-based proportional logic
      4. Filter out poor matches (score < 30)
      5. Sort by score descending
      6. De-duplicate by university name (keep best-scored course)
      7. Return top 10 with formatted response + reason
    """
    df = _load_data()

    print(f"\n[RECOMMEND] Profile -> CGPA={cgpa}, GRE={gre_score}, "
          f"Budget=Rs.{budget/100000:.0f}L, Country={preferred_country}, "
          f"Course={course_interest}")
    print(f"[RECOMMEND] Dataset rows loaded: {len(df)}")

    # ── Step 1: Filter by course keyword ─────────────────────────────────────
    keywords = [kw for kw in course_interest.lower().split() if len(kw) > 2]
    course_mask = df["course"].str.lower().apply(
        lambda c: any(kw in c for kw in keywords)
    )
    filtered = df[course_mask].copy()

    # Fallback: if no course matches, use full dataset
    if filtered.empty:
        print(f"[RECOMMEND] No course match for '{course_interest}', using full dataset")
        filtered = df.copy()
    else:
        print(f"[RECOMMEND] Course filter matched {len(filtered)} rows")

    # ── Step 2: Score every row ───────────────────────────────────────────────
    filtered["match_score"] = filtered.apply(
        lambda row: _score_row(cgpa, gre_score, budget, preferred_country, row),
        axis=1
    )

    # ── Step 3: Remove poor matches ───────────────────────────────────────────
    filtered = filtered[filtered["match_score"] > 30]
    print(f"[RECOMMEND] After quality filter (>30): {len(filtered)} universities")

    if filtered.empty:
        # Relax threshold if nothing passes
        filtered = df.copy()
        filtered["match_score"] = filtered.apply(
            lambda row: _score_row(cgpa, gre_score, budget, preferred_country, row),
            axis=1
        )
        filtered = filtered.sort_values("match_score", ascending=False)
        print("[RECOMMEND] Relaxed threshold — returning top matches regardless")

    # ── Step 4: Sort best first ───────────────────────────────────────────────
    filtered = filtered.sort_values("match_score", ascending=False)

    # ── Step 5: De-duplicate university names (keep highest score) ────────────
    filtered = filtered.drop_duplicates(subset="university_name", keep="first")

    # ── Step 6: Build response ────────────────────────────────────────────────
    results = []
    for _, row in filtered.head(11).iterrows():
        tuition_l = round(row["tuition_fees"] / 100000, 1)
        salary_l  = round(row["avg_salary"]   / 100000, 1)
        score     = int(row["match_score"])

        results.append({
            "university_name":       row["university_name"],
            "country":               row["country"],
            "course":                row["course"],
            "match_score":           score,
            "tuition_fees":          f"₹{tuition_l}L / yr",
            "avg_salary":            f"₹{salary_l}L / yr",
            "roi_rating":            row["roi_rating"],
            "tuition_raw":           int(row["tuition_fees"]),
            "salary_raw":            int(row["avg_salary"]),
            "recommendation_reason": _build_reason(
                cgpa, gre_score, budget, preferred_country, row
            ),
        })
        print(f"  [{score}%] {row['university_name']} ({row['country']})")

    print(f"[RECOMMEND] Returning {len(results)} recommendations\n")
    return results
