# backend/test_e2e.py
"""
End-to-End Automated Integration Test Suite for Kaiser AI Unified Platform.
Tests Database, Authentication, JWT Token Lifecycle, Grievance Routing,
Resolution Audits, and Machine Learning Endpoints.
"""

import sys
import os
import json

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app import app
from database import init_db, SessionLocal, UserModel, ComplaintModel, ResolutionAuditModel

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING KAISER AI END-TO-END VALIDATION SUITE")
    print("=" * 60)

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health Check passed:", res.json()["service"])

    # 2. ML Engine Health
    res = client.get("/api/ml/health")
    assert res.status_code == 200, f"ML Health failed: {res.text}"
    print("[PASS] ML Engine Health passed:", res.json()["service"])

    # 3. Citizen Login
    login_payload = {
        "email": "priya.nair@example.com",
        "password": "Citizen@123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Citizen login failed: {res.text}"
    citizen_data = res.json()["data"]
    citizen_token = citizen_data["token"]
    assert citizen_data["user"]["name"] == "Priya Nair"
    print(f"[PASS] Citizen Login passed for {citizen_data['user']['name']} (JWT generated)")

    # 4. Token Verification (Citizen)
    res = client.get("/api/auth/verify", headers={"Authorization": f"Bearer {citizen_token}"})
    assert res.status_code == 200, f"Citizen verify failed: {res.text}"
    assert res.json()["data"]["user"]["email"] == "priya.nair@example.com"
    print("[PASS] Citizen Token Verification passed")

    # 5. Officer Login
    res = client.post("/api/auth/login", json={
        "email": "suresh.patil@bmc.gov.in",
        "password": "BandraN@2024"
    })
    if res.status_code != 200:
        res = client.post("/api/auth/login", json={
            "email": "suresh.patil@bmc.gov.in",
            "password": "AndheriE@2024"
        })
    assert res.status_code == 200, f"Officer login failed: {res.text}"
    officer_data = res.json()["data"]
    officer_token = officer_data["token"]
    assert officer_data["user"]["role"] == "officer"
    print(f"[PASS] Officer Login passed for {officer_data['user']['name']} (Ward #{officer_data['user']['ward']})")

    # 6. Wards API
    res = client.get("/api/wards")
    assert res.status_code == 200
    wards = res.json()["data"]
    assert len(wards) == 26
    print(f"[PASS] Wards API passed: {len(wards)} Mumbai BMC Wards verified")

    # 7. Create Grievance (Authenticated Citizen)
    new_ticket = {
        "title": "Severe road cavity on Linking Road Bandra",
        "description": "Deep asphalt depression causing two-wheelers to slip near KFC junction.",
        "category": "Pothole",
        "severity": 85,
        "latitude": 19.0600,
        "longitude": 72.8330,
        "ward": 8,
        "landmark": "Near Linking Road Junction",
        "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
    }
    res = client.post(
        "/api/complaints",
        json=new_ticket,
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert res.status_code == 200, f"Create complaint failed: {res.text}"
    created = res.json()["data"]
    ticket_id = created["id"]
    assert created["createdBy"]["name"] == "Priya Nair"
    assert created["ward"] == 8
    print(f"[PASS] Grievance Submission passed (Ticket #{ticket_id} routed to Ward 8)")

    # 8. Post Comment on Grievance
    res = client.post(
        f"/api/complaints/{ticket_id}/comments",
        json={"text": "Municipal inspecting team please confirm ETA for bitumen patch."},
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert res.status_code == 200, f"Post comment failed: {res.text}"
    print("[PASS] Comment submission passed")

    # 9. Upvote Grievance
    res = client.post(f"/api/complaints/{ticket_id}/upvote")
    assert res.status_code == 200
    assert res.json()["data"]["upvoteCount"] >= 2
    print("[PASS] Grievance Upvote passed")

    # 10. Officer Status Update & Resolution Audit
    res = client.patch(
        f"/api/complaints/{ticket_id}",
        json={
            "status": "in_progress",
            "notes": "Ward 8 Junior Engineer assigned cold-mix asphalt crew to location."
        },
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert res.status_code == 200, f"Officer status update failed: {res.text}"
    updated = res.json()["data"]
    assert updated["status"] == "in_progress"
    print(f"[PASS] Officer Status Update passed (State transitioned to 'in_progress')")

    # Verify Audit Record in Database
    db = SessionLocal()
    audits = db.query(ResolutionAuditModel).filter(ResolutionAuditModel.complaint_id == ticket_id).all()
    assert len(audits) >= 2, f"Expected at least 2 audit entries, found {len(audits)}"
    db.close()
    print(f"[PASS] Resolution Audit Trail verified ({len(audits)} immutable log entries recorded)")

    # 11. Notifications Stream
    res = client.get("/api/notifications")
    assert res.status_code == 200
    notifs = res.json()["data"]
    assert len(notifs) > 0
    print(f"[PASS] Notifications Stream passed ({len(notifs)} alerts active)")

    # 12. Analytics Dashboard
    res = client.get("/api/analytics/dashboard")
    assert res.status_code == 200
    dash = res.json()["data"]
    assert dash["totalComplaints"] > 0
    print(f"[PASS] Analytics Dashboard passed (Total: {dash['totalComplaints']} complaints, Rate: {dash['resolutionRate']}%)")

    # 13. ML Deduplication (DBSCAN / Haversine)
    dedup_payload = {
        "candidate": {
            "latitude": 19.0601,
            "longitude": 72.8331,
            "category": "Pothole",
            "title": "Road hole Linking Road"
        },
        "existing_complaints": [
            {
                "id": ticket_id,
                "latitude": 19.0600,
                "longitude": 72.8330,
                "category": "Pothole",
                "title": "Severe road cavity on Linking Road",
                "status": "in_progress"
            }
        ],
        "radius_meters": 25.0
    }
    res = client.post("/api/ml/cluster-duplicates", json=dedup_payload)
    assert res.status_code == 200, f"DBSCAN deduplication failed: {res.text}"
    dedup = res.json()
    assert dedup["is_duplicate"] is True
    assert dedup["parent_complaint_id"] == ticket_id
    print(f"[PASS] DBSCAN Spatial Deduplication passed (Distance: {dedup['distance_meters']}m -> {dedup['action']})")

    # 14. ML Monsoon Flood Risk Engine
    monsoon_payload = {
        "ward_code": "F/N",
        "rainfall_mm_hr": 68.5,
        "tide_height_m": 4.4,
        "mithi_river_level_m": 3.1
    }
    res = client.post("/api/ml/monsoon-risk", json=monsoon_payload)
    assert res.status_code == 200, f"Monsoon risk failed: {res.text}"
    risk = res.json()
    assert risk["risk_score"] > 50.0
    print(f"[PASS] Monsoon Flood Prediction passed (Ward F/N Risk: {risk['risk_score']}/100, Alert: {risk['alert_level']})")

    # 15. Multilingual Civic Assistant (English & Marathi)
    res_en = client.post("/api/ml/assistant/chat", json={"query": "What is the SLA for pothole repair?", "language": "en", "user_ward": 8})
    assert res_en.status_code == 200
    assert "24" in res_en.json()["reply"] or "SLA" in res_en.json()["reply"]
    print("[PASS] Multilingual Assistant (English SLA query) passed")

    res_mr = client.post("/api/ml/assistant/chat", json={"query": "खड्डा दुरुस्तीचा कालावधी किती आहे?", "language": "mr", "user_ward": 8})
    assert res_mr.status_code == 200
    print("[PASS] Multilingual Assistant (Marathi NLP response) passed")

    print("\n" + "=" * 60)
    print("ALL 15 END-TO-END VALIDATION TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
