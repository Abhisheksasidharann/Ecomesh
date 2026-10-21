import glob
import os
import random
import shutil
from datetime import datetime, timedelta, timezone

from main import UPLOAD_DIR, db, schools, students, submissions
from gamification_agent import update_profile
from impact_agent import estimate

random.seed(42)  # same data every run
SCHOOL = "SCH001"
LAT, LNG = 8.5241, 76.9366
funds = db["funds"]
projects = db["projects"]

# 1. Remove previous demo data (real test data is untouched)
for col in (submissions, students, funds, projects):
    col.delete_many({"demo": True})

# 2. One shared demo photo
demo_photo = "demo_photo.jpg"
if not os.path.exists(os.path.join(UPLOAD_DIR, demo_photo)):
    jpgs = glob.glob(os.path.join(UPLOAD_DIR, "*.jpg"))
    if jpgs:
        shutil.copy(jpgs[0], os.path.join(UPLOAD_DIR, demo_photo))

STUDENTS = [
    ("Arjun Nair", "10A", "Green"), ("Diya Thomas", "10A", "Blue"),
    ("Rahul Menon", "10A", "Red"), ("Sneha Pillai", "10B", "Green"),
    ("Aditya Kumar", "10B", "Blue"), ("Meera Joseph", "10B", "Red"),
    ("Nikhil Varghese", "9A", "Green"), ("Fathima Rasheed", "9A", "Blue"),
    ("Karthik Das", "9A", "Red"), ("Ananya George", "9B", "Green"),
    ("Vishnu Prasad", "9B", "Blue"), ("Lakshmi Suresh", "9B", "Red"),
]
QUANTITY = {
    "plantation": (1, 4),
    "waste_segregation": (2, 8),
    "sustainable_transport": (3, 12),
    "solar_adoption": (2, 10),
    "water_conservation": (50, 300),
}

now = datetime.now(timezone.utc)
records = []
for i, (name, cls, house) in enumerate(STUDENTS, start=1):
    sid = f"DEMO{i:02d}"
    for _ in range(random.randint(2, 7)):
        at = now - timedelta(days=random.randint(1, 27), hours=random.randint(0, 8))
        action = random.choice(list(QUANTITY))
        qty = random.randint(*QUANTITY[action])
        records.append((at, sid, name, cls, house, action, qty))
records.sort()  # oldest first, so streaks build correctly

def base_doc(at, sid, action, qty):
    return {
        "student_id": sid, "school_id": SCHOOL, "action_type": action,
        "context": "school", "location": {"lat": LAT, "lng": LNG},
        "captured_at": at, "quantity": qty, "photo_file": demo_photo,
        "created_at": at, "demo": True,
    }

# 3. Verified actions + student profiles (replayed through the real agents)
profiles = {}
info = {}
for at, sid, name, cls, house, action, qty in records:
    kg, method = estimate(action, qty)
    profile, points, _ = update_profile(profiles.get(sid), kg, at.date().isoformat(), action)
    profiles[sid] = profile
    info[sid] = (name, cls, house)
    doc = base_doc(at, sid, action, qty)
    doc.update({
        "status": "verified", "trust_score": 0.9,
        "verification_reasons": ["Demo seed data"],
        "impact_kg_co2e": kg, "impact_method": method, "points_awarded": points,
    })
    submissions.insert_one(doc)

for sid, profile in profiles.items():
    name, cls, house = info[sid]
    profile.update({"name": name, "school_id": SCHOOL, "class_name": cls, "house": house, "demo": True})
    students.update_one({"_id": sid}, {"$set": profile}, upsert=True)

# 4. A few items for the review queue
for sid, action, reason in [
    ("DEMO03", "plantation", "AI: photo does not match action - stock image"),
    ("DEMO08", "solar_adoption", "Outside school radius (850 m)"),
]:
    doc = base_doc(now - timedelta(hours=3), sid, action, 2)
    doc.update({"status": "needs_review", "trust_score": 0.5, "verification_reasons": [reason]})
    submissions.insert_one(doc)

# 5. Funds, projects and the school goal
funds.insert_one({"school_id": SCHOOL, "sponsor": "Demo CSR Sponsor", "amount": 100000,
                  "note": "Demo grant", "received_at": now, "demo": True})
for name, cat, cost, need, impact in [
    ("Solar panel for lab", "solar", 60000, 4, 5),
    ("Scholarship pool", "scholarship", 30000, 5, 3),
    ("Composting unit", "sustainability", 25000, 3, 4),
    ("Rainwater harvesting", "sustainability", 40000, 4, 4),
]:
    projects.insert_one({"school_id": SCHOOL, "name": name, "category": cat, "cost": cost,
                         "need": need, "impact": impact, "status": "open",
                         "created_at": now, "demo": True})
schools.update_one({"_id": SCHOOL},
                   {"$set": {"goal": {"target_kg": 500, "reward": "Solar panel proposal unlocked"}}})

print(f"Seeded {len(records)} verified actions, {len(profiles)} students, 2 review items, funds, 4 projects, goal")