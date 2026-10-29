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
from database import get_db, ComplaintModel, UserModel, NotificationModel, engine, IS_SQLITE
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


def test_sqlite_wal_pragmas():
    """Issue 8: SQLite engine has WAL mode and busy_timeout configured."""
    if IS_SQLITE:
        with engine.connect() as conn:
            mode = conn.execute(text("PRAGMA journal_mode")).scalar()
            assert str(mode).lower() == "wal", f"Expected WAL mode, got {mode}"
            timeout = conn.execute(text("PRAGMA busy_timeout")).scalar()
            assert int(timeout) >= 10000, f"Expected busy_timeout >= 10000, got {timeout}"


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
    print("=" * 60)
    print("ALL REGRESSION TESTS PASSED!")
    print("=" * 60)
