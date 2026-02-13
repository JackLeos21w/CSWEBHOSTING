"""
TechHelpSeniors - Python backend proxy for form submissions
Sends form data to the TechHelpSeniors API (api_key kept server-side)
"""
import json
import os
from pathlib import Path
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
import requests

API_BASE = "https://techhelpseniors-api-endpoint.onrender.com"

# Secret file containing the API key (not committed; add via Render Secret Files or locally)
API_KEY_FILE = Path(__file__).parent / "apikey.txt"
REVIEWS_FILE = Path(__file__).parent / "data" / "reviews.json"

app = Flask(__name__, static_folder=".", static_url_path="")


def get_api_key():
    """Load API key from secret file apikey.txt."""
    if not API_KEY_FILE.exists():
        raise ValueError(
            "API key not found. Create apikey.txt in the project root with your API key. "
            "On Render: use Dashboard → Secret Files to add apikey.txt."
        )
    return API_KEY_FILE.read_text().strip()


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


def _is_valid_email(email):
    """Return True if email looks valid (has @ and a dot, reasonable length)."""
    if not email or not isinstance(email, str):
        return False
    e = email.strip()
    return "@" in e and "." in e and len(e) > 5


def _is_valid_phone(phone):
    """Return True if phone has 10–15 digits (allows spaces, dashes, parens)."""
    digits = "".join(c for c in (phone or "") if c.isdigit())
    return 10 <= len(digits) <= 15


@app.route("/api/submit", methods=["POST"])
def submit():
    if request.method != "POST":
        return jsonify({"error": "Method not allowed"}), 405
    try:
        email = (request.form.get("email") or "").strip()
        phone = (request.form.get("phone") or "").strip()
        if not _is_valid_email(email):
            return jsonify({"error": "Please enter a valid email address."}), 400
        if not _is_valid_phone(phone):
            return jsonify({"error": "Please enter a valid phone number (at least 10 digits)."}), 400

        api_key = get_api_key()
        headers = {"X-API-Key": api_key}

        # Check if we have file uploads
        files = request.files.getlist("additionalMaterials")
        has_files = any(f and f.filename for f in files)

        body = {
            "formPurpose": request.form.get("requestType", "Tech support"),
            "firstName": request.form.get("firstName", ""),
            "lastName": request.form.get("lastName", ""),
            "email": request.form.get("email", ""),
            "phone": request.form.get("phone", ""),
            "helpNeededOffered": request.form.get("message", ""),
        }

        if has_files:
            file_list = [(f.filename, f.stream.read()) for f in files if f and f.filename]
            if not file_list:
                has_files = False

        if has_files:
            # Multipart form-data with files
            files_to_send = [
                ("additionalMaterials", (name, content)) for name, content in file_list
            ]
            resp = requests.post(
                f"{API_BASE}/api/submit",
                data=body,
                files=files_to_send,
                headers=headers,
                timeout=30,
            )
        else:
            # JSON, no files
            resp = requests.post(
                f"{API_BASE}/api/submit",
                json=body,
                headers=headers,
                timeout=30,
            )

        try:
            data = resp.json()
        except Exception:
            data = {"error": "Invalid response from API"}

        return jsonify(data), resp.status_code

    except ValueError as e:
        return jsonify({"error": str(e)}), 500
    except requests.RequestException as e:
        return jsonify({"error": "Failed to submit form", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Failed to submit form", "message": str(e)}), 500


def _load_reviews():
    """Load stored reviews from JSON file."""
    if not REVIEWS_FILE.exists():
        return []
    try:
        with open(REVIEWS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def _save_review(name, rating, text):
    """Append a review to the stored reviews file."""
    REVIEWS_FILE.parent.mkdir(parents=True, exist_ok=True)
    reviews = _load_reviews()
    reviews.append({
        "name": name,
        "rating": int(rating),
        "text": text,
        "date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    })
    with open(REVIEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2)


@app.route("/api/review", methods=["POST"])
def submit_review():
    """Accept a review submission and store it (same server as help forms)."""
    if request.method != "POST":
        return jsonify({"error": "Method not allowed"}), 405
    try:
        name = (request.form.get("name") or request.form.get("reviewerName") or "").strip()
        rating = (request.form.get("rating") or "5").strip()
        text = (request.form.get("text") or request.form.get("reviewText") or "").strip()
        if not name:
            return jsonify({"error": "Please enter your name."}), 400
        if not text:
            return jsonify({"error": "Please enter your review."}), 400
        try:
            r = int(rating)
            if r < 1 or r > 5:
                r = 5
        except ValueError:
            r = 5
        _save_review(name, r, text)
        return jsonify({"success": True, "message": "Thank you for your review!"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to save review", "message": str(e)}), 500


@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    """Return stored reviews (for optional future use)."""
    try:
        return jsonify(_load_reviews()), 200
    except Exception as e:
        return jsonify({"error": "Failed to load reviews"}), 500


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)
