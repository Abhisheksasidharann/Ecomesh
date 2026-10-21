import os
import uuid
from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pymongo import MongoClient

from gamification_agent import update_profile
from impact_agent import estimate
from pipeline import graph
from auth import bearer

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"), serverSelectionTimeoutMS=5000)
db = client[os.getenv("DB_NAME", "ecomesh")]
submissions = db["submissions"]
students = db["students"]
schools = db["schools"]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Seed one demo school the first time (does nothing if it already exists)
try:
    schools.update_one(
        {"_id": "SCH001"},
        {"$setOnInsert": {"name": "Demo School", "lat": 8.5241, "lng": 76.9366, "radius_m": 300}},
        upsert=True,
    )
except Exception:
    pass

app = FastAPI(title="EcoMesh API", dependencies=[Depends(bearer)])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Photos are viewable at http://127.0.0.1:8000/uploads/<photo_file>
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

ActionType = Literal[
    "plantation",
    "waste_segregation",
    "sustainable_transport",
    "solar_adoption",
    "water_conservation",
]


class SchoolIn(BaseModel):
    school_id: str
    name: str
    lat: float
    lng: float
    radius_m: float = 300


class ReviewIn(BaseModel):
    decision: Literal["approve", "reject"]
    reviewer: str
    note: str = ""


def clean(d):
    d["id"] = str(d.pop("_id"))
    if d.get("photo_file"):
        d["photo_url"] = f"/uploads/{d['photo_file']}"
    return d


@app.get("/")
def root():
    return {"status": "EcoMesh API is running"}


@app.get("/health/db")
def health_db():
    try:
        client.admin.command("ping")
        return {"database": "connected"}
    except Exception as e:
        return {"database": "error", "detail": str(e)}


# ---------- Schools ----------
@app.post("/schools")
def upsert_school(body: SchoolIn):
    schools.update_one(
        {"_id": body.school_id},
        {"$set": {"name": body.name, "lat": body.lat, "lng": body.lng, "radius_m": body.radius_m}},
        upsert=True,
    )
    return {"school_id": body.school_id, "saved": True}


@app.get("/schools")
def list_schools():
    out = []
    for s in schools.find():
        s["school_id"] = s.pop("_id")
        out.append(s)
    return out


# ---------- Submissions ----------
@app.post("/submissions")
def create_submission(
    request: Request,
    student_id: str = Form(...),
    school_id: str = Form(...),
    action_type: ActionType = Form(...),
    context: Literal["school", "home"] = Form("school"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    captured_at: datetime = Form(...),
    quantity: float = Form(1.0),
    photo: UploadFile = File(...),
):
    if photo.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Photo must be JPEG or PNG")

    # Students can only submit as themselves, whatever the form says
    user = getattr(request.state, "user", None)
    if user and user["role"] == "student":
        student_id = user["student_id"]
        school_id = user["school_id"]

    ext = ".png" if photo.content_type == "image/png" else ".jpg"
    filename = uuid.uuid4().hex + ext
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(photo.file.read())

    doc = {
        "student_id": student_id,
        "school_id": school_id,
        "action_type": action_type,
        "context": context,
        "location": {"lat": latitude, "lng": longitude},
        "captured_at": captured_at,
        "quantity": quantity,
        "photo_file": filename,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    result = submissions.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "pending"}

# ---------- Pipeline ----------
@app.post("/pipeline/run")
def run_pipeline():
    existing = {
        d["photo_hash"]
        for d in submissions.find({"photo_hash": {"$exists": True}}, {"photo_hash": 1})
    }
    results = []
    for s in list(submissions.find({"status": "pending"})):
        out = graph.invoke({
            "submission": s,
            "school": schools.find_one({"_id": s["school_id"]}),
            "upload_dir": UPLOAD_DIR,
            "existing_hashes": existing,
            "student_profile": students.find_one({"_id": s["student_id"]}),
        })
        update = {
            "status": out["status"],
            "trust_score": out["trust_score"],
            "verification_reasons": out["reasons"],
            "photo_hash": out["photo_hash"],
            "ai_check": out.get("ai_check"),
            "verified_at": datetime.now(timezone.utc),
        }
        if "impact_kg_co2e" in out:
            update["impact_kg_co2e"] = out["impact_kg_co2e"]
            update["impact_method"] = out["impact_method"]
            update["points_awarded"] = out["points_awarded"]
        submissions.update_one({"_id": s["_id"]}, {"$set": update})
        if "updated_profile" in out:
            students.update_one(
                {"_id": s["student_id"]}, {"$set": out["updated_profile"]}, upsert=True
            )
        if out["photo_hash"] and out["status"] != "rejected":
            existing.add(out["photo_hash"])
        results.append({
            "id": str(s["_id"]),
            "status": out["status"],
            "trust_score": out["trust_score"],
            "kg_co2e": out.get("impact_kg_co2e"),
            "points_awarded": out.get("points_awarded"),
            "new_badges": out.get("new_badges"),
            "reasons": out["reasons"],
        })
    return {"processed": len(results), "results": results}


# ---------- Review queue (human in the loop) ----------
@app.get("/review/queue")
def review_queue():
    return [clean(d) for d in submissions.find({"status": "needs_review"}).sort("created_at", 1)]


@app.post("/review/{submission_id}")
def review_submission(submission_id: str, body: ReviewIn):
    try:
        oid = ObjectId(submission_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid submission id")
    s = submissions.find_one({"_id": oid})
    if s is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    if s["status"] != "needs_review":
        raise HTTPException(status_code=409, detail=f"Submission is already {s['status']}")

    update = {
        "reviewed_by": body.reviewer,
        "review_note": body.note,
        "reviewed_at": datetime.now(timezone.utc),
    }
    if body.decision == "reject":
        update["status"] = "rejected"
        submissions.update_one({"_id": oid}, {"$set": update})
        return {"id": submission_id, "status": "rejected"}

    kg, method = estimate(s["action_type"], s.get("quantity", 1.0))
    profile, points, badges = update_profile(
          students.find_one({"_id": s["student_id"]}),
          kg,
          s["captured_at"].date().isoformat(),
          s["action_type"],
    )
    update.update({
        "status": "verified",
        "impact_kg_co2e": kg,
        "impact_method": method,
        "points_awarded": points,
    })
    submissions.update_one({"_id": oid}, {"$set": update})
    students.update_one({"_id": s["student_id"]}, {"$set": profile}, upsert=True)
    return {
        "id": submission_id,
        "status": "verified",
        "kg_co2e": kg,
        "points_awarded": points,
        "new_badges": badges,
    }


# ---------- Reports ----------
@app.get("/impact/school/{school_id}")
def school_impact(school_id: str):
    pipeline = [
        {"$match": {"school_id": school_id, "impact_kg_co2e": {"$exists": True}}},
        {"$group": {
            "_id": "$action_type",
            "actions": {"$sum": 1},
            "kg_co2e": {"$sum": "$impact_kg_co2e"},
        }},
    ]
    rows = list(submissions.aggregate(pipeline))
    breakdown = {r["_id"]: {"actions": r["actions"], "kg_co2e": round(r["kg_co2e"], 3)} for r in rows}
    total = round(sum(r["kg_co2e"] for r in rows), 3)
    return {"school_id": school_id, "total_kg_co2e": total, "by_action": breakdown}


@app.get("/students/{student_id}")
def get_student(student_id: str):
    p = students.find_one({"_id": student_id})
    if p is None:
        raise HTTPException(status_code=404, detail="No activity yet for this student")
    p["student_id"] = p.pop("_id")
    return p
# ---------- Students, leaderboard, school goal ----------
from pydantic import Field
from gamification_agent import level_for, next_level


class StudentIn(BaseModel):
    student_id: str
    name: str
    school_id: str
    class_name: str
    house: str = ""


class GoalIn(BaseModel):
    target_kg: float = Field(gt=0)
    reward: str


@app.post("/students/register")
def register_student(body: StudentIn):
    if schools.find_one({"_id": body.school_id}) is None:
        raise HTTPException(status_code=404, detail="Unknown school")
    students.update_one(
        {"_id": body.student_id},
        {
            "$set": {
                "name": body.name,
                "school_id": body.school_id,
                "class_name": body.class_name,
                "house": body.house,
            },
            "$setOnInsert": {
                "points": 0,
                "total_actions": 0,
                "total_kg_co2e": 0.0,
                "streak_weeks": 0,
                "badges": [],
                "types_done": [],
                "level": "Seedling",
            },
        },
        upsert=True,
    )
    return {"student_id": body.student_id, "registered": True}


@app.get("/students/{student_id}/summary")
def student_summary(student_id: str):
    p = students.find_one({"_id": student_id})
    if p is None:
        raise HTTPException(status_code=404, detail="Student not found")
    p["student_id"] = p.pop("_id")
    pts = p.get("points", 0)
    p["level"] = level_for(pts)
    p["next_level"] = next_level(pts)
    p["pending_submissions"] = submissions.count_documents(
        {"student_id": student_id, "status": {"$in": ["pending", "needs_review"]}}
    )
    return p


@app.get("/leaderboard/{school_id}")
def leaderboard(school_id: str, group: Literal["class", "house", "student"] = "class", limit: int = 10):
    match = {"school_id": school_id}
    if group == "student":
        rows = students.find(match).sort("points", -1).limit(limit)
        return [
            {
                "rank": i + 1,
                "name": (r.get("name") or "").split(" ")[0],  # first name only (minors)
                "class_name": r.get("class_name"),
                "points": r.get("points", 0),
                "level": level_for(r.get("points", 0)),
                "kg_co2e": round(r.get("total_kg_co2e", 0), 3),
            }
            for i, r in enumerate(rows)
        ]
    field = "$class_name" if group == "class" else "$house"
    rows = students.aggregate([
        {"$match": match},
        {"$group": {
            "_id": field,
            "points": {"$sum": "$points"},
            "kg_co2e": {"$sum": "$total_kg_co2e"},
            "students": {"$sum": 1},
        }},
        {"$sort": {"points": -1}},
        {"$limit": limit},
    ])
    return [
        {
            "rank": i + 1,
            group: r["_id"],
            "points": r["points"],
            "kg_co2e": round(r["kg_co2e"], 3),
            "students": r["students"],
        }
        for i, r in enumerate(rows)
    ]


@app.post("/schools/{school_id}/goal")
def set_school_goal(school_id: str, body: GoalIn):
    result = schools.update_one(
        {"_id": school_id},
        {"$set": {"goal": {"target_kg": body.target_kg, "reward": body.reward}}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Unknown school")
    return {"school_id": school_id, "goal_set": True}


@app.get("/schools/{school_id}/goal")
def get_school_goal(school_id: str):
    s = schools.find_one({"_id": school_id})
    if s is None:
        raise HTTPException(status_code=404, detail="Unknown school")
    goal = s.get("goal") or {"target_kg": 500, "reward": "Not set"}
    achieved = school_impact(school_id)["total_kg_co2e"]
    return {
        "school_id": school_id,
        "target_kg": goal["target_kg"],
        "reward": goal["reward"],
        "achieved_kg": achieved,
        "percent": min(100, round(achieved / goal["target_kg"] * 100, 1)),
        "reached": achieved >= goal["target_kg"],
    }

# ---------- Auth & roles ----------
from fastapi import Depends
from fastapi.responses import JSONResponse
from auth import check_password, decode_token, get_current_user, hash_password, make_token

users = db["users"]

# (method, path prefix, allowed roles). First match wins. Unlisted routes are public.
ROLE_RULES = [
    ("POST", "/auth/users", {"admin"}),
    ("POST", "/submissions", {"student", "teacher", "admin"}),
    ("GET", "/submissions", {"teacher", "admin"}),
    ("GET", "/my", {"student"}),
    ("POST", "/pipeline", {"teacher", "admin"}),
    ("GET", "/review", {"teacher", "admin"}),
    ("POST", "/review", {"teacher", "admin"}),
    ("POST", "/students/register", {"teacher", "admin"}),
    ("POST", "/schools", {"admin"}),
    ("POST", "/benefit", {"admin"}),
    ("GET", "/benefit", {"teacher", "admin"}),
]


@app.middleware("http")
async def role_guard(request: Request, call_next):
    for method, prefix, roles in ROLE_RULES:
        if request.method == method and request.url.path.startswith(prefix):
            header = request.headers.get("authorization", "")
            user = decode_token(header[7:]) if header.lower().startswith("bearer ") else None
            origin = request.headers.get("origin")
            cors = {"Access-Control-Allow-Origin": origin, "Vary": "Origin"} if origin else {}
            if user is None:
                return JSONResponse({"detail": "Login required"}, status_code=401, headers=cors)
            if user["role"] not in roles:
                return JSONResponse({"detail": f"Not allowed for role {user['role']}"}, status_code=403, headers=cors)
            request.state.user = user
            break
    return await call_next(request)


class LoginIn(BaseModel):
    username: str
    password: str


class SignupIn(BaseModel):
    username: str = Field(min_length=3, max_length=60)
    password: str = Field(min_length=6, max_length=64)
    name: str
    school_id: str
    class_name: str
    house: str = ""



class UserCreateIn(BaseModel):
    username: str = Field(min_length=3, max_length=60)
    password: str = Field(min_length=6, max_length=64)
    role: Literal["teacher", "admin"]
    school_id: str


@app.post("/auth/bootstrap-admin")
def bootstrap_admin(body: LoginIn):
    """Creates the first admin. Works only while no admin exists."""
    if users.count_documents({"role": "admin"}) > 0:
        raise HTTPException(status_code=403, detail="An admin already exists")
    users.insert_one({
        "_id": body.username,
        "password_hash": hash_password(body.password),
        "role": "admin",
        "school_id": None,
        "created_at": datetime.now(timezone.utc),
    })
    return {"created": body.username, "role": "admin"}


@app.post("/auth/signup")
def signup(body: SignupIn):
    if users.find_one({"_id": body.username}):
        raise HTTPException(status_code=409, detail="Username already taken")
    student_id = body.username
    if users.find_one({"student_id": student_id}):
        raise HTTPException(status_code=409, detail="This student ID already has an account")
    register_student(StudentIn(
        student_id=student_id, name=body.name, school_id=body.school_id,
        class_name=body.class_name, house=body.house,
    ))
    users.insert_one({
        "_id": body.username,
        "password_hash": hash_password(body.password),
        "role": "student",
        "school_id": body.school_id,
        "student_id": student_id,
        "created_at": datetime.now(timezone.utc),
    })
    return {"username": body.username, "student_id": student_id, "role": "student"}


@app.post("/auth/login")
def login(body: LoginIn):
    u = users.find_one({"_id": body.username})
    if u is None or not check_password(body.password, u["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong username or password")
    return {
        "access_token": make_token(u),
        "token_type": "bearer",
        "role": u["role"],
        "school_id": u.get("school_id"),
        "student_id": u.get("student_id"),
    }


@app.get("/auth/me")
def me(user: dict = Depends(get_current_user)):
    return user


@app.post("/auth/users")
def create_user(body: UserCreateIn):
    if schools.find_one({"_id": body.school_id}) is None:
        raise HTTPException(status_code=404, detail="Unknown school")
    if users.find_one({"_id": body.username}):
        raise HTTPException(status_code=409, detail="Username already taken")
    users.insert_one({
        "_id": body.username,
        "password_hash": hash_password(body.password),
        "role": body.role,
        "school_id": body.school_id,
        "created_at": datetime.now(timezone.utc),
    })
    return {"username": body.username, "role": body.role}


@app.get("/my/submissions")
def my_submissions(request: Request, limit: int = 20):
    user = request.state.user
    cursor = submissions.find({"student_id": user["student_id"]}).sort("created_at", -1).limit(limit)
    return [clean(d) for d in cursor]

@app.get("/impact/factors")
def impact_factors():
    from impact_agent import FACTORS
    return FACTORS

# ---------- Mission Planner ----------
from gamification_agent import week_start
from mission_agent import plan_missions

missions_col = db["missions"]
ROLE_RULES.append(("POST", "/my", {"student"}))
ROLE_RULES.append(("GET", "/missions", {"teacher", "admin"}))


def week_missions(student_id):
    today = datetime.now(timezone.utc).date()
    week = week_start(today)
    key = f"{student_id}:{week.isoformat()}"
    doc = missions_col.find_one({"_id": key})
    if doc is None:
        history = {
            r["_id"]: r["n"]
            for r in submissions.aggregate([
                {"$match": {"student_id": student_id, "status": "verified"}},
                {"$group": {"_id": "$action_type", "n": {"$sum": 1}}},
            ])
        }
        doc = {
            "_id": key,
            "student_id": student_id,
            "week_start": week.isoformat(),
            "missions": plan_missions(students.find_one({"_id": student_id}), history, today),
            "claimed": [],
        }
        missions_col.insert_one(doc)

    start = datetime.combine(week, datetime.min.time())
    this_week = {
        r["_id"]: r["n"]
        for r in submissions.aggregate([
            {"$match": {"student_id": student_id, "status": "verified", "captured_at": {"$gte": start}}},
            {"$group": {"_id": "$action_type", "n": {"$sum": 1}}},
        ])
    }
    total = sum(this_week.values())
    out = []
    for m in doc["missions"]:
        progress = total if m["action_type"] is None else this_week.get(m["action_type"], 0)
        out.append({
            **m,
            "progress": min(progress, m["target"]),
            "complete": progress >= m["target"],
            "claimed": m["id"] in doc["claimed"],
        })
    return doc, out


@app.get("/my/missions")
def my_missions(request: Request):
    _, missions = week_missions(request.state.user["student_id"])
    return missions


@app.post("/my/missions/{mission_id}/claim")
def claim_mission(mission_id: str, request: Request):
    student_id = request.state.user["student_id"]
    doc, missions = week_missions(student_id)
    m = next((x for x in missions if x["id"] == mission_id), None)
    if m is None:
        raise HTTPException(status_code=404, detail="Mission not found for this week")
    if m["claimed"]:
        raise HTTPException(status_code=409, detail="Bonus already claimed")
    if not m["complete"]:
        raise HTTPException(status_code=400, detail=f"Mission not complete ({m['progress']}/{m['target']})")
    missions_col.update_one({"_id": doc["_id"]}, {"$push": {"claimed": mission_id}})
    students.update_one({"_id": student_id}, {"$inc": {"points": m["bonus"]}}, upsert=True)
    pts = students.find_one({"_id": student_id}).get("points", 0)
    students.update_one({"_id": student_id}, {"$set": {"level": level_for(pts)}})
    return {"mission_id": mission_id, "bonus_awarded": m["bonus"], "points": pts, "level": level_for(pts)}


@app.get("/missions/{student_id}")
def student_missions(student_id: str):
    _, missions = week_missions(student_id)
    return missions

# ---------- Sponsor impact report (CSV) ----------
import csv
import io

from fastapi.responses import Response
from impact_agent import FACTORS

ROLE_RULES.append(("GET", "/reports", {"teacher", "admin"}))


@app.get("/reports/school/{school_id}")
def school_report(school_id: str):
    school = schools.find_one({"_id": school_id})
    if school is None:
        raise HTTPException(status_code=404, detail="Unknown school")
    impact = school_impact(school_id)
    goal = get_school_goal(school_id)
    classes = {s["_id"]: s.get("class_name", "") for s in students.find({"school_id": school_id})}

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["EcoMesh verified impact report"])
    w.writerow(["School", school.get("name", ""), school_id])
    w.writerow(["Generated (UTC)", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")])
    w.writerow(["Note", "Estimated carbon impact of verified student actions. Not certified carbon credits."])
    w.writerow([])

    w.writerow(["SUMMARY"])
    w.writerow(["Total verified impact (kg CO2e)", impact["total_kg_co2e"]])
    w.writerow(["School goal (kg CO2e)", goal["target_kg"], "Progress %", goal["percent"], "Reward", goal["reward"]])
    w.writerow([])

    w.writerow(["BY ACTION TYPE"])
    w.writerow(["Action", "Verified actions", "kg CO2e"])
    for action, v in impact["by_action"].items():
        w.writerow([action, v["actions"], v["kg_co2e"]])
    w.writerow([])

    w.writerow(["EMISSION FACTORS USED"])
    w.writerow(["Action", "Factor (kg CO2e per unit)", "Unit", "Source"])
    for action, f in FACTORS.items():
        w.writerow([action, f["factor"], f["unit"], f["source"]])
    w.writerow([])

    w.writerow(["APPROVED FUND ALLOCATIONS"])
    w.writerow(["Decided at", "Approved by", "Total cost (Rs)", "Projects"])
    for p in proposals.find({"school_id": school_id, "status": "approved"}):
        w.writerow([
            p.get("decided_at", ""), p.get("decided_by", ""), p["total_cost"],
            "; ".join(x["name"] for x in p["selected"]),
        ])
    w.writerow([])

    w.writerow(["AUDIT TRAIL: VERIFIED ACTIONS"])
    w.writerow(["Date", "Class", "Action", "Quantity", "kg CO2e", "Trust score", "Verified by"])
    for s in submissions.find({"school_id": school_id, "status": "verified"}).sort("captured_at", 1):
        w.writerow([
            s["captured_at"].strftime("%Y-%m-%d"),
            classes.get(s["student_id"], ""),
            s["action_type"],
            s.get("quantity", ""),
            s.get("impact_kg_co2e", ""),
            s.get("trust_score", ""),
            s.get("reviewed_by") or "automatic pipeline",
        ])

    return Response(
        content="\ufeff" + buf.getvalue(),  # BOM so Excel opens it correctly
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="ecomesh_{school_id}_report.csv"'},
    )

# ---------- Community Benefit Optimization ----------
from benefit_agent import optimize

funds = db["funds"]
projects = db["projects"]
proposals = db["proposals"]


class FundIn(BaseModel):
    sponsor: str
    amount: float = Field(gt=0)
    note: str = ""


class ProjectIn(BaseModel):
    name: str
    category: Literal["solar", "scholarship", "sustainability"]
    cost: float = Field(gt=0)
    need: int = Field(ge=1, le=5)
    impact: int = Field(ge=1, le=5)


class DecisionIn(BaseModel):
    decision: Literal["approve", "reject"]
    reviewer: str
    note: str = ""


def available_budget(school_id):
    received = sum(f["amount"] for f in funds.find({"school_id": school_id}))
    committed = sum(p["total_cost"] for p in proposals.find({"school_id": school_id, "status": "approved"}))
    return round(received - committed, 2)


@app.post("/schools/{school_id}/funds")
def add_funds(school_id: str, body: FundIn):
    funds.insert_one({
        "school_id": school_id, "sponsor": body.sponsor, "amount": body.amount,
        "note": body.note, "received_at": datetime.now(timezone.utc),
    })
    return {"school_id": school_id, "available_budget": available_budget(school_id)}


@app.post("/schools/{school_id}/projects")
def add_project(school_id: str, body: ProjectIn):
    doc = body.model_dump()
    doc.update({"school_id": school_id, "status": "open", "created_at": datetime.now(timezone.utc)})
    result = projects.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "open"}


@app.get("/schools/{school_id}/projects")
def list_projects(school_id: str):
    return [clean(p) for p in projects.find({"school_id": school_id})]


@app.post("/benefit/propose/{school_id}")
def propose_allocation(school_id: str):
    budget = available_budget(school_id)
    if budget <= 0:
        raise HTTPException(status_code=400, detail="No available funds for this school")
    open_projects = [clean(p) for p in projects.find({"school_id": school_id, "status": "open"})]
    if not open_projects:
        raise HTTPException(status_code=400, detail="No open projects for this school")

    result = optimize(open_projects, budget)

    scholarship_candidates = []
    if any(p["category"] == "scholarship" for p in result["selected"]):
        top = submissions.aggregate([
            {"$match": {"school_id": school_id, "status": "verified"}},
            {"$group": {"_id": "$student_id", "points": {"$sum": "$points_awarded"},
                        "kg_co2e": {"$sum": "$impact_kg_co2e"}}},
            {"$sort": {"points": -1}},
            {"$limit": 3},
        ])
        scholarship_candidates = [
            {"student_id": t["_id"], "points": t["points"], "kg_co2e": round(t["kg_co2e"], 3)}
            for t in top
        ]

    proposals.update_many({"school_id": school_id, "status": "proposed"}, {"$set": {"status": "superseded"}})
    doc = {
        "school_id": school_id,
        "budget": budget,
        **result,
        "scholarship_candidates": scholarship_candidates,
        "school_impact_kg_co2e": school_impact(school_id)["total_kg_co2e"],
        "status": "proposed",
        "created_at": datetime.now(timezone.utc),
    }
    proposals.insert_one(doc)
    return clean(doc)


@app.post("/benefit/{proposal_id}/decision")
def decide_proposal(proposal_id: str, body: DecisionIn):
    try:
        oid = ObjectId(proposal_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid proposal id")
    p = proposals.find_one({"_id": oid})
    if p is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if p["status"] != "proposed":
        raise HTTPException(status_code=409, detail=f"Proposal is already {p['status']}")

    update = {"decided_by": body.reviewer, "decision_note": body.note,
              "decided_at": datetime.now(timezone.utc)}
    if body.decision == "reject":
        update["status"] = "rejected"
    else:
        if p["total_cost"] > available_budget(p["school_id"]):
            raise HTTPException(status_code=409, detail="Budget changed; generate a new proposal")
        update["status"] = "approved"
        for s in p["selected"]:
            projects.update_one({"_id": ObjectId(s["id"])}, {"$set": {"status": "funded"}})
    proposals.update_one({"_id": oid}, {"$set": update})
    return {"id": proposal_id, "status": update["status"],
            "available_budget": available_budget(p["school_id"])}


@app.get("/benefit/proposals/{school_id}")
def list_proposals(school_id: str):
    return [clean(p) for p in proposals.find({"school_id": school_id}).sort("created_at", -1)]