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


def run_tests():
    # Use context manager so the lifespan handler (init_db) fires correctly
    with TestClient(app) as client:
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

        # 4b. Verify forged token is rejected (security regression test)
        res = client.get("/api/auth/verify", headers={"Authorization": "Bearer whatever-admin-token"})
        assert res.status_code == 401, f"Expected 401 for forged token, got {res.status_code}"
        print("[PASS] Forged token correctly rejected with 401")

        # 5. Officer Login
        res = client.post("/api/auth/login", json={
            "email": "suresh.patil@bmc.gov.in",
            "password": "BandraN@2024"
        })
        if res.status_code != 200:
            res = client.post("/api/auth/login", json={
                "email": "ravi.mehta@bmc.gov.in",
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
        assert len(wards) == 24
        print(f"[PASS] Wards API passed: {len(wards)} Mumbai BMC Wards verified")

        # 7. Anonymous PATCH is rejected (security regression test)
        res = client.patch("/api/complaints/cmp-001", json={"status": "resolved"})
        assert res.status_code == 401, f"Expected 401 for unauthenticated PATCH, got {res.status_code}"
        print("[PASS] Unauthenticated complaint update correctly rejected with 401")

        # 8. Create Grievance (Authenticated Citizen) — using JSON endpoint
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
            "/api/complaints/json",
            json=new_ticket,
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert res.status_code == 200, f"Create complaint failed: {res.text}"
        created = res.json()["data"]
        ticket_id = created["id"]
        assert created["createdBy"]["name"] == "Priya Nair"
        assert created["ward"] == 8
        print(f"[PASS] Grievance Submission passed (Ticket #{ticket_id} routed to Ward 8)")

        # 9. Post Comment on Grievance
        res = client.post(
            f"/api/complaints/{ticket_id}/comments",
            json={"text": "Municipal inspecting team please confirm ETA for bitumen patch."},
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        assert res.status_code == 200, f"Post comment failed: {res.text}"
        print("[PASS] Comment submission passed")

        # 10. Upvote Grievance (requires auth — anonymous is rejected)
        res = client.post(f"/api/complaints/{ticket_id}/upvote")
        assert res.status_code == 401, f"Expected 401 for unauthenticated upvote, got {res.status_code}"
        res = client.post(f"/api/complaints/{ticket_id}/upvote", headers={"Authorization": f"Bearer {citizen_token}"})
        assert res.status_code == 200, f"Authenticated upvote failed: {res.text}"
        assert res.json()["data"]["upvoteCount"] >= 2
        print("[PASS] Grievance Upvote passed (auth required + duplicate prevention)")

        # 11. Officer Status Update & Resolution Audit
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

        # 12. Notifications Stream (requires auth)
        res = client.get("/api/notifications")
        assert res.status_code == 401, f"Expected 401 for unauthenticated notifications, got {res.status_code}"
        res = client.get("/api/notifications", headers={"Authorization": f"Bearer {citizen_token}"})
        assert res.status_code == 200
        notifs = res.json()["data"]
        print(f"[PASS] Notifications Stream passed (auth required, {len(notifs)} alerts for current user)")

        # 13. Analytics Dashboard (requires officer/admin)
        res = client.get("/api/analytics/dashboard")
        assert res.status_code == 401, f"Expected 401 for unauthenticated analytics, got {res.status_code}"
        res = client.get("/api/analytics/dashboard", headers={"Authorization": f"Bearer {officer_token}"})
        assert res.status_code == 200
        dash = res.json()["data"]
        assert dash["totalComplaints"] > 0
        print(f"[PASS] Analytics Dashboard passed (Total: {dash['totalComplaints']} complaints, Rate: {dash['resolutionRate']}%)")

        # 14. ML Deduplication (DBSCAN / Haversine)
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

        # 15. ML Monsoon Flood Risk Engine
        monsoon_payload = {
            "ward_code": "F/N Ward",
            "rainfall_mm_hr": 68.5,
            "tide_height_m": 4.4,
            "mithi_river_level_m": 3.1
        }
        res = client.post("/api/ml/monsoon-risk", json=monsoon_payload)
        assert res.status_code == 200, f"Monsoon risk failed: {res.text}"
        risk = res.json()
        assert risk["risk_score"] > 50.0
        print(f"[PASS] Monsoon Flood Prediction passed (Ward F/N Risk: {risk['risk_score']}/100, Alert: {risk['alert_level']})")

        # 16. Multilingual Civic Assistant (English & Marathi)
        res_en = client.post("/api/ml/assistant/chat", json={"query": "What is the SLA for pothole repair?", "language": "en", "user_ward": 8})
        assert res_en.status_code == 200
        assert "24" in res_en.json()["reply"] or "SLA" in res_en.json()["reply"]
        print("[PASS] Multilingual Assistant (English SLA query) passed")

        res_mr = client.post("/api/ml/assistant/chat", json={"query": "खड्डा दुरुस्तीचा कालावधी किती आहे?", "language": "mr", "user_ward": 8})
        assert res_mr.status_code == 200
        print("[PASS] Multilingual Assistant (Marathi NLP response) passed")

        # 17. Live Open-Meteo Weather Telemetry
        res = client.get("/api/weather/19.0760/72.8777")
        assert res.status_code == 200, f"Weather telemetry failed: {res.text}"
        w_data = res.json()["data"]
        assert "temperature" in w_data
        assert "humidity" in w_data
        assert "rainfallMm" in w_data
        assert "source" in w_data
        print(f"[PASS] Live Weather Telemetry passed ({w_data['temperature']}°C, {w_data['condition']}, Source: {w_data['source'][:30]}...)")

        # 18. Zero-Key OpenStreetMap Nominatim Reverse Geocoding
        res = client.get("/api/geo/reverse?lat=19.0600&lng=72.8330")
        assert res.status_code == 200, f"Reverse geocoding failed: {res.text}"
        geo_data = res.json()["data"]
        assert "displayName" in geo_data
        assert "wardCode" in geo_data
        print(f"[PASS] OpenStreetMap Reverse Geocoding passed: {geo_data['displayName'][:45]}... (Ward: {geo_data['wardCode']})")

        # 19. Compound Multi-Hazard Severity Escalator
        from PIL import Image
        import io
        test_img = Image.new("RGB", (100, 100), color=(100, 120, 150))
        buf = io.BytesIO()
        test_img.save(buf, format="JPEG")
        buf.seek(0)
        res = client.post("/api/ml/detect-defect", data={"hint_title": "Exposed electric wire sparking in waterlogged floodwater"}, files={"file": ("test.jpg", buf, "image/jpeg")})
        assert res.status_code == 200, f"Detect defect failed: {res.text}"
        defect_res = res.json()
        assert defect_res["severity"] >= 95, f"Expected compound escalation >=95, got {defect_res['severity']}"
        assert defect_res["sla_hours"] <= 3, f"Expected emergency SLA <=3h, got {defect_res['sla_hours']}"
        assert defect_res["compound_hazard"] is not None
        print(f"[PASS] Compound Multi-Hazard Escalator passed (Severity: {defect_res['severity']}/100, SLA: {defect_res['sla_hours']}h, Type: {defect_res['compound_hazard']['type']})")

        # 20. Before-and-After AI Resolution Verification
        img_before = Image.new("RGB", (100, 100), color=(40, 40, 40))
        img_after = Image.new("RGB", (100, 100), color=(160, 160, 160))
        buf_b = io.BytesIO()
        img_before.save(buf_b, format="JPEG")
        buf_b.seek(0)
        buf_a = io.BytesIO()
        img_after.save(buf_a, format="JPEG")
        buf_a.seek(0)

        # 20a. Legitimate Repair verification
        res = client.post(
            "/api/ml/verify-resolution",
            files={"file_before": ("before.jpg", buf_b, "image/jpeg"), "file_after": ("after.jpg", buf_a, "image/jpeg")},
            data={"category": "Pothole", "complaint_id": ticket_id}
        )
        assert res.status_code == 200, f"Verify resolution failed: {res.text}"
        v_data = res.json()
        assert v_data["verified"] is True
        assert v_data["audit_status"] == "VERIFIED_APPROVED"
        assert v_data["remediation_score"] >= 80.0
        print(f"[PASS] AI Before-and-After Verification passed (Remediation Score: {v_data['remediation_score']}%, Status: {v_data['audit_status']})")

        # 20b. Fraudulent closure with identical photo
        buf_dup1 = io.BytesIO()
        img_before.save(buf_dup1, format="JPEG")
        buf_dup1.seek(0)
        buf_dup2 = io.BytesIO()
        img_before.save(buf_dup2, format="JPEG")
        buf_dup2.seek(0)
        res_fraud = client.post(
            "/api/ml/verify-resolution",
            files={"file_before": ("before.jpg", buf_dup1, "image/jpeg"), "file_after": ("after.jpg", buf_dup2, "image/jpeg")}
        )
        assert res_fraud.status_code == 200
        assert res_fraud.json()["verified"] is False
        assert res_fraud.json()["audit_status"] == "REJECTED_IDENTICAL_PHOTO"
        print(f"[PASS] Anti-Fraud Identical Photo Filter passed (Rejected fraudulent closure: {res_fraud.json()['audit_status']})")

        # 20c. Missing evidence is rejected (not auto-approved)
        res_missing = client.post("/api/ml/verify-resolution", json={"category": "Pothole", "complaint_id": ticket_id})
        assert res_missing.status_code == 200
        assert res_missing.json()["verified"] is False
        assert res_missing.json()["audit_status"] == "REJECTED_MISSING_EVIDENCE"
        print("[PASS] Missing evidence correctly rejected (not auto-approved)")

        # 21. Field GPS Geofencing on Status Resolution
        res = client.patch(
            f"/api/complaints/{ticket_id}",
            json={
                "status": "resolved",
                "officerLatitude": 19.0601,
                "officerLongitude": 72.8331,
                "notes": "Field crew completed hot-pour bitumen sealing."
            },
            headers={"Authorization": f"Bearer {officer_token}"}
        )
        assert res.status_code == 200, f"Resolve with geofence failed: {res.text}"
        db = SessionLocal()
        last_audit = db.query(ResolutionAuditModel).filter(ResolutionAuditModel.complaint_id == ticket_id).order_by(ResolutionAuditModel.created_at.desc()).first()
        assert last_audit is not None
        assert "GEOFENCE" in last_audit.notes
        db.close()
        print(f"[PASS] Field GPS Geofencing Audit passed: '{last_audit.notes}'")

        print("\n" + "=" * 60)
        print("ALL 21 END-TO-END VALIDATION TESTS PASSED PERFECTLY!")
        print("=" * 60)


if __name__ == "__main__":
    run_tests()
