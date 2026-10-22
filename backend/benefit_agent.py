import math

# Weights for combining the admin's scores into one benefit value.
# Explainable and easy to tune; v2 can learn these from outcomes.
WEIGHTS = {"need": 0.5, "impact": 0.5}
UNIT = 1000  # budget is optimized in steps of Rs 1000


def project_value(p):
    return round(WEIGHTS["need"] * p["need"] + WEIGHTS["impact"] * p["impact"], 2)


def optimize(projects, budget):
    """0/1 knapsack: choose projects maximizing total benefit value
    without exceeding the budget. Returns a result dict."""
    units = int(budget // UNIT)
    items = []
    too_costly = []
    for p in projects:
        if p["cost"] > budget:
            too_costly.append(p)
        else:
            items.append((p, math.ceil(p["cost"] / UNIT), project_value(p)))

    n = len(items)
    dp = [0.0] * (units + 1)
    keep = [[False] * (units + 1) for _ in range(n)]
    for i, (_p, c, v) in enumerate(items):
        for b in range(units, c - 1, -1):
            if dp[b - c] + v > dp[b]:
                dp[b] = dp[b - c] + v
                keep[i][b] = True

    chosen = []
    b = units
    for i in range(n - 1, -1, -1):
        if keep[i][b]:
            chosen.append(items[i][0])
            b -= items[i][1]
    chosen.reverse()

    chosen_ids = {p["id"] for p in chosen}
    total_cost = sum(p["cost"] for p in chosen)
    rationale = []
    for p, _c, v in items:
        if p["id"] in chosen_ids:
            rationale.append(f"Selected: {p['name']} (value {v}, cost Rs {p['cost']:.0f})")
        else:
            rationale.append(
                f"Not selected: {p['name']} (value {v}) - a different combination gives more total benefit within budget"
            )
    for p in too_costly:
        rationale.append(f"Not selected: {p['name']} - cost Rs {p['cost']:.0f} exceeds available budget")

    return {
        "selected": [
            {"id": p["id"], "name": p["name"], "category": p["category"],
             "cost": p["cost"], "value": project_value(p)}
            for p in chosen
        ],
        "total_cost": total_cost,
        "total_value": round(sum(project_value(p) for p in chosen), 2),
        "leftover": round(budget - total_cost, 2),
        "rationale": rationale,
    }