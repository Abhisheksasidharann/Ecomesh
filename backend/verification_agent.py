import hashlib
import math
import os
from datetime import datetime, timezone

import imagehash
from PIL import Image

MAX_AGE_HOURS = 24
BASE_TRUST = {"school": 0.6, "home": 0.4}
VERIFY_THRESHOLD = 0.7
REJECT_THRESHOLD = 0.3
PHASH_THRESHOLD = 6  # max differing bits (of 64) to count as the same picture


def haversine_m(lat1, lng1, lat2, lng2):
    """Distance in metres between two GPS points."""
    r = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def file_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def image_phash(path):
    """Perceptual hash: similar-looking images get similar hashes."""
    try:
        with Image.open(path) as img:
            return str(imagehash.phash(img))
    except Exception:
        return None


def is_near_duplicate(phash, existing_phashes):
    h = imagehash.hex_to_hash(phash)
    for other in existing_phashes:
        try:
            if h - imagehash.hex_to_hash(other) <= PHASH_THRESHOLD:
                return True
        except ValueError:
            continue
    return False


def verify(submission, upload_dir, existing_hashes, school=None, existing_phashes=()):
    """Returns (status, trust_score, reasons, photo_hash, photo_phash)."""
    reasons = []
    trust = BASE_TRUST.get(submission["context"], 0.4)

    # Photo check
    path = os.path.join(upload_dir, submission["photo_file"])
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return "rejected", 0.0, ["Photo missing or empty"], None, None
    photo_hash = file_hash(path)
    photo_phash = image_phash(path)

    # Exact duplicate
    if photo_hash in existing_hashes:
        return "rejected", 0.0, ["Duplicate photo already submitted"], photo_hash, photo_phash

    # Near duplicate (resized, recompressed or lightly edited copy)
    if photo_phash and is_near_duplicate(photo_phash, existing_phashes):
        return "rejected", 0.0, ["Near-duplicate: an edited or resized copy of an earlier photo"], photo_hash, photo_phash

    # Timestamp check
    captured = submission["captured_at"]
    if captured.tzinfo is None:
        captured = captured.replace(tzinfo=timezone.utc)
    age_h = (datetime.now(timezone.utc) - captured).total_seconds() / 3600
    if age_h < -0.1:
        return "rejected", 0.0, ["Timestamp is in the future"], photo_hash, photo_phash
    if age_h > MAX_AGE_HOURS:
        reasons.append(f"Photo older than {MAX_AGE_HOURS}h")
        trust -= 0.3
    else:
        reasons.append("Timestamp is recent")
        trust += 0.1

    # GPS check
    lat, lng = submission["location"]["lat"], submission["location"]["lng"]
    if submission["context"] == "school":
        if school is None:
            reasons.append("Unknown school")
            trust -= 0.3
        else:
            d = haversine_m(lat, lng, school["lat"], school["lng"])
            if d <= school["radius_m"]:
                reasons.append(f"Inside school radius ({int(d)} m)")
                trust += 0.2
            else:
                reasons.append(f"Outside school radius ({int(d)} m)")
                trust -= 0.4
    else:
        if lat == 0 and lng == 0:
            reasons.append("Invalid GPS (0,0)")
            trust -= 0.3
        else:
            reasons.append("Home GPS provided")
            trust += 0.1

    trust = round(max(0.0, min(1.0, trust)), 2)
    if trust >= VERIFY_THRESHOLD:
        status = "verified"
    elif trust < REJECT_THRESHOLD:
        status = "rejected"
    else:
        status = "needs_review"
    return status, trust, reasons, photo_hash, photo_phash