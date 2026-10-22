from datetime import date, timedelta

LEVELS = [(0, "Seedling"), (50, "Sapling"), (150, "Tree"), (400, "Grove"), (1000, "Forest")]
ALL_TYPES = {"plantation", "waste_segregation", "sustainable_transport", "solar_adoption", "water_conservation"}
DAILY_CAP_PER_TYPE = 3   # point-earning actions per action type per day
BASE_POINTS = 10
MAX_CARBON_BONUS = 20    # quantity is self-reported, so the bonus is capped

BADGES = [
    ("first_action", "First Step", lambda p: p["total_actions"] >= 1),
    ("five_actions", "Getting Going", lambda p: p["total_actions"] >= 5),
    ("twenty_actions", "Committed", lambda p: p["total_actions"] >= 20),
    ("all_rounder", "All-Rounder", lambda p: ALL_TYPES.issubset(set(p["types_done"]))),
    ("streak_4_weeks", "4-Week Streak", lambda p: p["streak_weeks"] >= 4),
    ("carbon_10", "10 kg Saved", lambda p: p["total_kg_co2e"] >= 10),
    ("carbon_50", "50 kg Club", lambda p: p["total_kg_co2e"] >= 50),
    ("carbon_100", "100 kg Hero", lambda p: p["total_kg_co2e"] >= 100),
]


def level_for(points):
    name = LEVELS[0][1]
    for threshold, label in LEVELS:
        if points >= threshold:
            name = label
    return name


def next_level(points):
    for threshold, label in LEVELS:
        if points < threshold:
            return {"name": label, "points_needed": threshold - points}
    return None


def week_start(d):
    return d - timedelta(days=d.weekday())


def update_profile(profile, kg_co2e, action_date, action_type):
    """Returns (updated_profile, points_awarded, new_badge_ids).
    action_date is an ISO string like '2026-10-17'."""
    p = {
        "points": 0,
        "total_actions": 0,
        "total_kg_co2e": 0.0,
        "streak_weeks": 0,
        "last_week_start": None,
        "badges": [],
        "types_done": [],
        "today": {"date": None, "counts": {}},
    }
    p.update(profile or {})
    p.pop("_id", None)
    p["badges"] = list(p["badges"])
    p["types_done"] = list(p.get("types_done") or [])
    today = date.fromisoformat(action_date)

    # Daily cap per action type (anti-gaming)
    if (p.get("today") or {}).get("date") != action_date:
        p["today"] = {"date": action_date, "counts": {}}
    counts = dict(p["today"]["counts"])
    capped = counts.get(action_type, 0) >= DAILY_CAP_PER_TYPE
    counts[action_type] = counts.get(action_type, 0) + 1
    p["today"] = {"date": action_date, "counts": counts}

    # Points
    points = 0 if capped else BASE_POINTS + min(int(kg_co2e // 5), MAX_CARBON_BONUS)
    p["points"] += points
    p["total_actions"] += 1
    p["total_kg_co2e"] = round(p["total_kg_co2e"] + kg_co2e, 3)
    if action_type not in p["types_done"]:
        p["types_done"].append(action_type)

    # Weekly streak
    this_week = week_start(today)
    last = p.get("last_week_start")
    if last is None and p.get("last_action_date"):
        last = week_start(date.fromisoformat(p["last_action_date"])).isoformat()
    if last is None:
        p["streak_weeks"] = 1
        p["last_week_start"] = this_week.isoformat()
    else:
        gap = (this_week - date.fromisoformat(last)).days // 7
        if gap == 1:
            p["streak_weeks"] += 1
        elif gap > 1:
            p["streak_weeks"] = 1
        elif gap == 0 and p["streak_weeks"] == 0:
            p["streak_weeks"] = 1
        if gap >= 0:
            p["last_week_start"] = this_week.isoformat()
    p["last_action_date"] = action_date
    p["level"] = level_for(p["points"])

    # Badges
    new_badges = []
    for badge_id, _label, cond in BADGES:
        if badge_id not in p["badges"] and cond(p):
            p["badges"].append(badge_id)
            new_badges.append(badge_id)

    return p, points, new_badges