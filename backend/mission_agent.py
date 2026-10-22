from datetime import date

from gamification_agent import ALL_TYPES, level_for, week_start

TARGET_BY_LEVEL = {"Seedling": 2, "Sapling": 3, "Tree": 4, "Grove": 5, "Forest": 6}
LABELS = {
    "plantation": "plantation",
    "waste_segregation": "waste segregation",
    "sustainable_transport": "sustainable transport",
    "solar_adoption": "solar",
    "water_conservation": "water conservation",
}
MAX_MISSIONS = 3


def plan_missions(profile, history_counts, today):
    """Rule-based adaptive planner.
    profile: student document or None
    history_counts: {action_type: number of verified actions, all time}
    Returns a list of mission dicts for the current week."""
    week = week_start(today).isoformat()
    p = profile or {}
    missions = []

    # 1. Re-engagement for inactive students
    last = p.get("last_action_date")
    inactive = last is None or (today - date.fromisoformat(last)).days >= 14
    if inactive:
        missions.append({
            "id": f"{week}-comeback", "kind": "comeback", "action_type": None,
            "target": 1, "bonus": 15,
            "title": "Log any 1 verified climate action this week",
            "reason": "No activity in the last 14 days",
        })

    # 2. Diversity nudge: action types never tried
    untried = sorted(ALL_TYPES - set(p.get("types_done") or []))
    for t in untried[: (1 if inactive else 2)]:
        missions.append({
            "id": f"{week}-try-{t}", "kind": "diversity", "action_type": t,
            "target": 1, "bonus": 20,
            "title": f"Try something new: 1 {LABELS[t]} action",
            "reason": "You have not tried this action type yet",
        })

    # 3. Level-scaled challenge on the student's strongest type
    if history_counts and len(missions) < MAX_MISSIONS:
        fav = max(history_counts, key=history_counts.get)
        level = level_for(p.get("points", 0))
        n = TARGET_BY_LEVEL[level]
        missions.append({
            "id": f"{week}-challenge-{fav}", "kind": "challenge", "action_type": fav,
            "target": n, "bonus": 5 * n,
            "title": f"Level challenge: {n} {LABELS[fav]} actions this week",
            "reason": f"Your strongest area; target scales with your level ({level})",
        })

    return missions[:MAX_MISSIONS]
