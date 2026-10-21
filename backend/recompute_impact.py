from main import submissions
from impact_agent import estimate

count = 0
for s in submissions.find({"impact_kg_co2e": {"$exists": True}}):
    kg, note = estimate(s["action_type"], s.get("quantity", 1.0))
    submissions.update_one({"_id": s["_id"]}, {"$set": {"impact_kg_co2e": kg, "impact_method": note}})
    count += 1
print(count, "submissions recomputed")