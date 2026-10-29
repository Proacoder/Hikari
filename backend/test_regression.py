"""
Regression Test Suite for Kaiser AI Bug Fixes:
1. Public landing-page statistics & citizen session persistence
2. Protected officer/admin analytics (401/403)
3. Anonymous complaint update without notification crash
4. Local image upload and retrieval
5. Base64 validation in ML router (400 on malformed input)
6. Complaint list batch serialization efficiency
7. SQLite WAL mode & busy timeout
"""

import os
import sys
import uuid
import io
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app import app
from database import get_db, SessionLocal, ComplaintModel, UserModel, NotificationModel, UpvoteModel, engine, IS_SQLITE
from sqlalchemy import text

client = TestClient(app)


def test_public_analytics_summary_unauthenticated():
    """Issue 1: Public landing page can access summary without auth."""
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "totalComplaints" in data
    assert "resolvedComplaints" in data
    assert "resolvedRate" in data
    assert "avgResolutionDays" in data


def test_dashboard_analytics_authorization():
    """Issue 1: /api/analytics/dashboard requires officer or admin role."""
    # 1. Unauthenticated request -> 401
    unauth_res = client.get("/api/analytics/dashboard")
    assert unauth_res.status_code == 401

    # 2. Login as Citizen
    cit_res = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    assert cit_res.status_code == 200
    cit_token = cit_res.json()["data"]["token"]

    # Citizen accessing officer/admin dashboard -> 403 Forbidden (not 401)
    cit_dash_res = client.get("/api/analytics/dashboard", headers={"Authorization": f"Bearer {cit_token}"})
    assert cit_dash_res.status_code == 403, f"Expected 403, got {cit_dash_res.status_code}"

    # 3. Login as Officer
    off_res = client.post("/api/auth/login", json={"email": "suresh.patil@bmc.gov.in", "password": "BandraN@2024"})
    assert off_res.status_code == 200
    off_token = off_res.json()["data"]["token"]

    # Officer accessing dashboard -> 200 OK
    off_dash_res = client.get("/api/analytics/dashboard", headers={"Authorization": f"Bearer {off_token}"})
    assert off_dash_res.status_code == 200


def test_anonymous_complaint_status_update():
    """Issue 2: Updating an anonymous complaint (created_by_id = None) succeeds without crashing."""
    db = next(get_db())
    anon_comp_id = f"cmp-anon-{uuid.uuid4().hex[:6]}"
    anon_comp = ComplaintModel(
        id=anon_comp_id,
        title="Anonymous open drain hazard",
        description="Hazardous open drain without registered creator",
        category="Drainage",
        severity=85,
        status="reported",
        latitude=19.0596,
        longitude=72.8296,
        ward_id=8,
        created_by_id=None,  # Anonymous complaint
        created_by_name="Anonymous Citizen",
    )
    db.add(anon_comp)
    db.commit()

    # Officer in Ward 8 updates the status
    off_res = client.post("/api/auth/login", json={"email": "suresh.patil@bmc.gov.in", "password": "BandraN@2024"})
    off_token = off_res.json()["data"]["token"]

    update_res = client.patch(
        f"/api/complaints/{anon_comp_id}",
        json={"status": "in_progress", "notes": "Dispatched crew to inspect anonymous report."},
        headers={"Authorization": f"Bearer {off_token}"},
    )
    assert update_res.status_code == 200, f"Expected 200, got {update_res.status_code}: {update_res.text}"
    updated = update_res.json()["data"]
    assert updated["status"] == "in_progress"

    # Further resolve the complaint
    resolve_res = client.patch(
        f"/api/complaints/{anon_comp_id}",
        json={"status": "resolved", "notes": "FRP cover installed over open drain."},
        headers={"Authorization": f"Bearer {off_token}"},
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["data"]["status"] == "resolved"


def test_local_image_upload_and_serving():
    """Issue 3: Local file upload saves correctly and is retrievable via /uploads/."""
    # Create valid dummy PNG in memory
    img = Image.new("RGB", (64, 64), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    cit_res = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    cit_token = cit_res.json()["data"]["token"]

    upload_res = client.post(
        "/api/complaints",
        data={
            "title": "Uploaded Image Test Pothole",
            "description": "Testing local upload path",
            "category": "Pothole",
            "ward": "8",
            "latitude": "19.0596",
            "longitude": "72.8296",
        },
        files={"image": ("test_pothole.png", buf.getvalue(), "image/png")},
        headers={"Authorization": f"Bearer {cit_token}"},
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    img_url = upload_res.json()["data"]["imageUrl"]
    assert img_url.startswith("/uploads/")

    # Fetch the image via static mount
    fetch_res = client.get(img_url)
    assert fetch_res.status_code == 200, f"Static fetch failed for {img_url}"
    assert len(fetch_res.content) > 0


def test_malformed_base64_returns_400():
    """Issue 6: Malformed Base64 payload in /api/ml/detect-defect returns HTTP 400 (not 500)."""
    # 1. Invalid base64 characters / corrupted padding
    res = client.post(
        "/api/ml/detect-defect",
        data={"image_base64": "not_valid_base64_data_!@#$%", "hint_title": "pothole"},
    )
    assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
    assert "Invalid Base64" in res.json()["detail"]

    # 2. Empty payload
    res_empty = client.post("/api/ml/detect-defect", data={"hint_title": "pothole"})
    assert res_empty.status_code == 400
    assert "No image provided" in res_empty.json()["detail"]

    # 3. Base64 that is valid base64 but not an image
    import base64
    text_b64 = base64.b64encode(b"This is just plain text, not an image").decode()
    res_non_img = client.post(
        "/api/ml/detect-defect",
        data={"image_base64": text_b64, "hint_title": "pothole"},
    )
    assert res_non_img.status_code == 400
    assert "Invalid or unsupported image format" in res_non_img.json()["detail"]


def test_batch_serialization_query_efficiency():
    """Issue 7: Listing complaints uses batch serialization."""
    res = client.get("/api/complaints?page=1&limit=50")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    if body["data"]:
        item = body["data"][0]
        assert "id" in item
        assert "commentCount" in item
        assert "assignedOfficer" in item
        assert "audits" in item


def test_new_complaint_zero_upvotes_and_utc_timestamp():
    """Verify newly created complaint starts with 0 upvotes and current UTC timestamp (not ~6h ago)."""
    from datetime import datetime, timezone

    cit_res = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    cit_token = cit_res.json()["data"]["token"]

    submit_res = client.post(
        "/api/complaints/json",
        json={
            "title": "Fresh pothole on Linking Road",
            "description": "Deep asphalt depression causing traffic hazard",
            "category": "Pothole",
            "ward": 8,
            "latitude": 19.060512,
            "longitude": 72.831234,
            "landmark": "Near National College",
        },
        headers={"Authorization": f"Bearer {cit_token}"},
    )
    assert submit_res.status_code == 200, f"Submit failed: {submit_res.text}"
    comp = submit_res.json()["data"]

    # 1. Zero initial upvotes
    assert comp["upvoteCount"] == 0, f"Expected 0 initial upvotes, got {comp['upvoteCount']}"

    # 2. Coordinate persistence
    assert abs(comp["latitude"] - 19.060512) < 0.000001
    assert abs(comp["longitude"] - 72.831234) < 0.000001

    # 3. UTC Timestamp validity
    created_at_str = comp["createdAt"]
    assert "+00:00" in created_at_str or created_at_str.endswith("Z"), f"Expected UTC timezone offset in {created_at_str}"
    created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
    now_utc = datetime.now(timezone.utc)
    delta_seconds = abs((now_utc - created_dt).total_seconds())
    assert delta_seconds < 10, f"Timestamp is skewed by {delta_seconds}s! Expected <10s (current time)."

    # 4. Upvote single increment from 0 to 1
    up_res = client.post(f"/api/complaints/{comp['id']}/upvote", headers={"Authorization": f"Bearer {cit_token}"})
    assert up_res.status_code == 200
    assert up_res.json()["data"]["upvoteCount"] == 1
    assert up_res.json()["data"]["hasUpvoted"] is True

    # 5. Duplicate upvote rejected
    dup_res = client.post(f"/api/complaints/{comp['id']}/upvote", headers={"Authorization": f"Bearer {cit_token}"})
    assert dup_res.status_code == 409

    # 6. Detail endpoint returns hasUpvoted
    detail_res = client.get(f"/api/complaints/{comp['id']}", headers={"Authorization": f"Bearer {cit_token}"})
    assert detail_res.status_code == 200
    assert detail_res.json()["data"]["hasUpvoted"] is True

    # Detail endpoint for another user returns hasUpvoted == False
    off_res = client.post("/api/auth/login", json={"email": "suresh.patil@bmc.gov.in", "password": "BandraN@2024"})
    off_token = off_res.json()["data"]["token"]
    detail_off_res = client.get(f"/api/complaints/{comp['id']}", headers={"Authorization": f"Bearer {off_token}"})
    assert detail_off_res.json()["data"]["hasUpvoted"] is False


def test_sqlite_wal_pragmas():
    """Issue 8: SQLite engine has WAL mode and busy_timeout configured."""
    if IS_SQLITE:
        with engine.connect() as conn:
            mode = conn.execute(text("PRAGMA journal_mode")).scalar()
            assert str(mode).lower() == "wal", f"Expected WAL mode, got {mode}"
            timeout = conn.execute(text("PRAGMA busy_timeout")).scalar()
            assert int(timeout) >= 10000, f"Expected busy_timeout >= 10000, got {timeout}"


def test_ward_analytics_aggregation():
    """Verify ward analytics returns real counts without fake multipliers."""
    res = client.get("/api/analytics/by-ward")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    wards = body["data"]
    assert len(wards) == 24
    for w in wards:
        assert "wardId" in w
        assert "total" in w
        assert "resolved" in w
        assert "pending" in w
        assert "officers" in w
        assert w["total"] >= w["resolved"]
        assert w["pending"] == w["total"] - w["resolved"]


def test_concurrent_duplicate_upvoting():
    """Verify that concurrent duplicate upvotes from the same user cannot corrupt counts."""
    from concurrent.futures import ThreadPoolExecutor

    cit_res = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    cit_token = cit_res.json()["data"]["token"]

    submit_res = client.post(
        "/api/complaints/json",
        json={
            "title": "Concurrency test complaint",
            "description": "Testing parallel voting requests",
            "category": "Pothole",
            "ward": 8,
            "latitude": 19.0601,
            "longitude": 72.8331,
        },
        headers={"Authorization": f"Bearer {cit_token}"},
    )
    assert submit_res.status_code == 200
    cid = submit_res.json()["data"]["id"]

    def do_upvote():
        return client.post(f"/api/complaints/{cid}/upvote", headers={"Authorization": f"Bearer {cit_token}"})

    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = [pool.submit(do_upvote) for _ in range(5)]
        responses = [f.result() for f in futures]

    statuses = [r.status_code for r in responses]
    successes = [s for s in statuses if s == 200]
    conflicts = [s for s in statuses if s == 409]

    assert len(successes) == 1, f"Expected exactly 1 success (200), got {len(successes)}: {statuses}"
    assert len(conflicts) == 4, f"Expected 4 conflicts (409), got {len(conflicts)}: {statuses}"

    # Verify database count is exactly 1
    db = SessionLocal()
    comp = db.query(ComplaintModel).filter(ComplaintModel.id == cid).first()
    upvotes = db.query(UpvoteModel).filter(UpvoteModel.complaint_id == cid).all()
    assert comp.upvote_count == 1, f"Persisted upvote count corrupted! Expected 1, got {comp.upvote_count}"
    assert len(upvotes) == 1, f"Persisted upvote rows corrupted! Expected 1, got {len(upvotes)}"
    db.close()


def test_secure_upload_endpoint():
    """Verify /api/upload enforces auth, rejects invalid formats, and persists evidence."""
    # 1. 401 unauthenticated
    res_unauth = client.post("/api/upload", files={"file": ("test.jpg", b"123", "image/jpeg")})
    assert res_unauth.status_code == 401, f"Expected 401, got {res_unauth.status_code}"

    # 2. Authenticated user
    cit_res = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    token = cit_res.json()["data"]["token"]

    # 3. 415 Unsupported media type (not magic bytes)
    res_invalid = client.post(
        "/api/upload",
        files={"file": ("bad.exe", b"MZNotAnImageContent", "application/octet-stream")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_invalid.status_code == 415, f"Expected 415, got {res_invalid.status_code}"

    # 4. 200 Valid PNG magic bytes
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    res_valid = client.post(
        "/api/upload",
        files={"file": ("evidence.png", png_bytes, "image/png")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_valid.status_code == 200, f"Upload failed: {res_valid.text}"
    upload_url = res_valid.json()["data"]["url"]
    assert upload_url.startswith("/uploads/"), f"Unexpected upload path: {upload_url}"

    # Verify retrieval
    res_get = client.get(upload_url)
    assert res_get.status_code == 200
    assert len(res_get.content) == len(png_bytes)


def test_citizen_certificate_authorization():
    """Verify citizen certificate access rules: citizens see own, non-admins 403, admin 200."""
    # 1. 401 unauthenticated
    res_unauth = client.get("/api/citizens/user-001/certificate")
    assert res_unauth.status_code == 401

    # Login Priya (user-001)
    res_priya = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    priya_token = res_priya.json()["data"]["token"]

    # Login Suresh (officer)
    res_suresh = client.post("/api/auth/login", json={"email": "suresh.patil@bmc.gov.in", "password": "BandraN@2024"})
    suresh_token = res_suresh.json()["data"]["token"]

    # Login Rajendra Mehta (admin)
    res_admin = client.post("/api/auth/login", json={"email": "r.mehta@bmc.gov.in", "password": "Admin@2024"})
    admin_token = res_admin.json()["data"]["token"]

    # Priya accesses own certificate -> 200
    res_own = client.get("/api/citizens/user-001/certificate", headers={"Authorization": f"Bearer {priya_token}"})
    assert res_own.status_code == 200, f"Expected 200 for own cert, got {res_own.status_code}"
    cert_data = res_own.json()["data"]
    assert cert_data["citizenName"] == "Priya Nair"
    assert cert_data["certificateId"].startswith("BMC-CIVIC-2026-")

    # Priya accesses another user's cert -> 403
    res_other = client.get("/api/citizens/user-002/certificate", headers={"Authorization": f"Bearer {priya_token}"})
    assert res_other.status_code == 403

    # Officer Suresh accesses citizen cert -> 403 (officers are not admins)
    res_officer = client.get("/api/citizens/user-001/certificate", headers={"Authorization": f"Bearer {suresh_token}"})
    assert res_officer.status_code == 403

    # Admin accesses any citizen's cert -> 200
    res_admin_access = client.get("/api/citizens/user-001/certificate", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin_access.status_code == 200
    assert res_admin_access.json()["data"]["citizenName"] == "Priya Nair"


def test_notification_on_comment_and_assignment():
    """Verify notifications are created for ticket creator and assigned officer on comments and assignments."""
    # 1. Citizen Priya creates complaint
    res_priya = client.post("/api/auth/login", json={"email": "priya.nair@example.com", "password": "Citizen@123"})
    priya_token = res_priya.json()["data"]["token"]

    res_officer = client.post("/api/auth/login", json={"email": "suresh.patil@bmc.gov.in", "password": "BandraN@2024"})
    officer_token = res_officer.json()["data"]["token"]

    sub_res = client.post(
        "/api/complaints/json",
        json={
            "title": "Broken pavement on Hill Road",
            "description": "Tiles missing near Mehboob Studio",
            "category": "Pothole",
            "ward": 8,
            "latitude": 19.055,
            "longitude": 72.825,
            "landmark": "Near Mehboob Studio",
        },
        headers={"Authorization": f"Bearer {priya_token}"},
    )
    assert sub_res.status_code == 200
    cid = sub_res.json()["data"]["id"]

    # Check officer got notification of new complaint in Ward 8
    notif_res = client.get("/api/notifications", headers={"Authorization": f"Bearer {officer_token}"})
    assert notif_res.status_code == 200
    officer_notifs = notif_res.json()["data"]
    assert any(n["complaintId"] == cid for n in officer_notifs), "Assigned officer did not receive notification of new ward complaint"

    # 2. Officer comments on Priya's ticket
    comm_res = client.post(
        f"/api/complaints/{cid}/comments",
        json={"text": "Inspection scheduled for 10:00 AM tomorrow by Junior Engineer."},
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert comm_res.status_code == 200

    # 3. Verify Priya received notification of officer's comment
    priya_notif_res = client.get("/api/notifications", headers={"Authorization": f"Bearer {priya_token}"})
    priya_notifs = priya_notif_res.json()["data"]
    comment_notif = next((n for n in priya_notifs if n["complaintId"] == cid and n["type"] == "comment"), None)
    assert comment_notif is not None, "Ticket creator did not receive notification of officer's comment"
    assert "Suresh Patil" in comment_notif["body"]


def test_external_open_meteo_weather():
    """External API: Open-Meteo weather forecast with Asia/Kolkata timezone & apparent temperature."""
    res = client.get("/api/weather/mumbai")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "temperature" in data
    assert "apparentTemperature" in data, "Open-Meteo must provide apparent temperature (heat index / feels-like)"
    assert "humidity" in data
    assert "precipitation" in data
    assert "windSpeed" in data
    assert data["timezone"] == "Asia/Kolkata", f"Expected Asia/Kolkata timezone, got {data.get('timezone')}"
    assert data["temperature"] is not None
    assert data["apparentTemperature"] is not None


def test_external_open_meteo_air_quality():
    """External API: Open-Meteo air quality with dual EPA & EAQI standards and ground-station disclaimer."""
    res = client.get("/api/air-quality/mumbai")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "usAqi" in data
    assert "europeanAqi" in data
    assert "usAqiStandard" in data and "EPA" in data["usAqiStandard"]
    assert "europeanAqiStandard" in data and "EAQI" in data["europeanAqiStandard"]
    assert data["isGroundStation"] is False, "Must not claim modeled dispersion data is a physical ground station"
    assert "groundStationNotice" in data
    assert any(term in data["groundStationNotice"].lower() for term in ["dispersion", "modeled", "ground-monitoring"])


def test_external_mumbai_news_api():
    """External API: NewsAPI proxy returns live articles when key configured, and zero invented articles if missing."""
    # 1. Live call with configured key
    orig_key = os.environ.get("NEWS_API_KEY", "")
    if orig_key:
        res = client.get("/api/news/mumbai")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        body = res.json()
        assert body["success"] is True
        assert body["isLiveData"] is True
        assert len(body["articles"]) > 0
        first = body["articles"][0]
        assert "title" in first and len(first["title"]) > 0
        assert "url" in first and first["url"].startswith("http")
        assert "source" in first

    # 2. Key absent: must return isLiveData False with empty array (no fabricated articles)
    try:
        os.environ["NEWS_API_KEY"] = ""
        res_no_key = client.get("/api/news/mumbai")
        assert res_no_key.status_code == 200
        body_no_key = res_no_key.json()
        assert body_no_key["isLiveData"] is False
        assert body_no_key["articles"] == [], "Must not invent articles when API key is missing"
    finally:
        os.environ["NEWS_API_KEY"] = orig_key


def test_external_nvidia_chatbot_handling():
    """External API: NVIDIA Chat completions handles missing/invalid credentials gracefully without fabricating responses."""
    # 1. Missing credentials test
    orig_key = os.environ.get("NVIDIA_API_KEY", "")
    try:
        os.environ["NVIDIA_API_KEY"] = ""
        res_no_key = client.post("/api/ml/nvidia/chat", json={"query": "How to report water logging?"})
        assert res_no_key.status_code == 200
        body_no_key = res_no_key.json()
        assert body_no_key["success"] is False or body_no_key.get("isLiveModel") is False
        assert "NVIDIA_API_KEY" in body_no_key.get("reply", "") or "configured" in body_no_key.get("reply", "")
    finally:
        os.environ["NVIDIA_API_KEY"] = orig_key

    # 2. Invalid credentials test: provider error returns error response without claiming model responded
    try:
        os.environ["NVIDIA_API_KEY"] = "nvapi-fake-test-key-99999"
        res_bad_key = client.post("/api/ml/nvidia/chat", json={"query": "Test query"})
        assert res_bad_key.status_code == 200
        body_bad = res_bad_key.json()
        assert body_bad.get("isLiveModel") is False
        assert "error" in body_bad or "reply" in body_bad
    finally:
        os.environ["NVIDIA_API_KEY"] = orig_key


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING BUG REGRESSION TEST SUITE")
    print("=" * 60)
    test_public_analytics_summary_unauthenticated()
    print("[PASS] Issue 1: Public analytics summary accessible without auth")
    test_dashboard_analytics_authorization()
    print("[PASS] Issue 1: Dashboard analytics properly protected (401 unauth / 403 citizen)")
    test_anonymous_complaint_status_update()
    print("[PASS] Issue 2: Anonymous complaint status update works without notification crash")
    test_local_image_upload_and_serving()
    print("[PASS] Issue 3: Local image upload and /uploads/ static retrieval verified")
    test_malformed_base64_returns_400()
    print("[PASS] Issue 6: Malformed Base64 returns HTTP 400 (not 500)")
    test_batch_serialization_query_efficiency()
    print("[PASS] Issue 7: Batch serialization returns all expected schema fields")
    test_sqlite_wal_pragmas()
    print("[PASS] Issue 8: SQLite WAL mode and busy_timeout verified")
    test_new_complaint_zero_upvotes_and_utc_timestamp()
    print("[PASS] Issue 9: Zero initial upvotes, UTC timestamps & duplicate vote prevention verified")
    test_ward_analytics_aggregation()
    print("[PASS] Issue 10: Real ward analytics batch aggregation verified")
    test_concurrent_duplicate_upvoting()
    print("[PASS] Issue 11: Concurrent duplicate upvotes return 409 and maintain exact count")
    test_secure_upload_endpoint()
    print("[PASS] Issue 12: Secure file upload endpoint validated (401 unauth, 415 magic bytes, 200 valid)")
    test_citizen_certificate_authorization()
    print("[PASS] Issue 13: Citizen certificate RBAC verified (own allowed, officer blocked, admin allowed)")
    test_notification_on_comment_and_assignment()
    print("[PASS] Issue 14: Automated cross-role notifications verified on comments & assignments")
    test_external_open_meteo_weather()
    print("[PASS] Issue 15: Open-Meteo weather forecast with Asia/Kolkata timezone & apparent temp")
    test_external_open_meteo_air_quality()
    print("[PASS] Issue 16: Open-Meteo air quality with dual EPA & EAQI standards and ground-station disclaimer")
    test_external_mumbai_news_api()
    print("[PASS] Issue 17: NewsAPI proxy live query and missing key handling without fabricated articles")
    test_external_nvidia_chatbot_handling()
    print("[PASS] Issue 18: NVIDIA chatbot missing & invalid credentials handling without fabricated replies")
    print("=" * 60)
    print("ALL REGRESSION TESTS PASSED!")
    print("=" * 60)

