import os

from main import UPLOAD_DIR, store_photo

copied = 0
for name in os.listdir(UPLOAD_DIR):
    path = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(path):
        continue
    content_type = "image/png" if name.endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        if store_photo(name, f.read(), content_type):
            copied += 1
print(copied, "photos copied to Supabase")