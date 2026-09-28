import sys
import os
import pytest
from fastapi.testclient import TestClient

# Put backend folder on sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from scripts.seed_demo import seed

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Seed database prior to running tests
    seed()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "CoalGov AI"

def test_login_success():
    response = client.post("/api/auth/login", json={"email": "manager@coalgov.in", "password": "manager123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "MINE_MANAGER"

def test_list_mines():
    response = client.get("/api/mines")
    assert response.status_code == 200
    mines = response.json()
    assert len(mines) == 8

def test_audit_ledger_verification():
    response = client.get("/api/audit/verify")
    assert response.status_code == 200
    result = response.json()
    assert result["is_valid"] is True
    assert result["tampered_records_count"] == 0

def test_offline_pwa_sync_idempotency():
    login_res = client.post("/api/auth/login", json={"email": "inspector@coalgov.in", "password": "inspector123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    mines = client.get("/api/mines").json()
    target_mine_id = mines[0]["id"]

    client_uuid = "pwa-test-idempotency-9999"
    payload = [{
        "mine_id": target_mine_id,
        "category": "SAFETY",
        "description": "Test offline observation for idempotency check.",
        "severity": "HIGH",
        "is_violation": True,
        "latitude": 22.33,
        "longitude": 82.59,
        "client_uuid": client_uuid
    }]

    # First Sync
    sync1 = client.post("/api/inspections/observations/sync", json=payload, headers=headers)
    assert sync1.status_code == 200
    assert sync1.json()["synced_count"] == 1

    # Second Sync with same client_uuid (must skip duplicate!)
    sync2 = client.post("/api/inspections/observations/sync", json=payload, headers=headers)
    assert sync2.status_code == 200
    assert sync2.json()["duplicate_count"] == 1
    assert sync2.json()["synced_count"] == 0
