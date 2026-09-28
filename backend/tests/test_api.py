import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "WELLTWIN API"
    assert "DEMO" in data["data_mode"]

def test_wells_list():
    response = client.get("/api/wells")
    assert response.status_code == 200
    wells = response.json()
    assert len(wells) >= 3
    assert any(w["well_id"] == "BGH-01" for w in wells)

def test_well_state():
    response = client.get("/api/wells/BGH-01/state")
    assert response.status_code == 200
    state = response.json()
    assert state["well_id"] == "BGH-01"
    assert "oil_rate_bpd" in state
    assert state["data_mode_label"] == "DEMO MODE • SYNTHETIC DATA"

def test_digital_twin_state():
    response = client.get("/api/digital-twin/BGH-01")
    assert response.status_code == 200
    twin = response.json()
    assert "reservoir" in twin
    assert "wellbore" in twin
    assert "srp" in twin
    assert "surface" in twin

def test_srp_optimize():
    response = client.post("/api/srp/optimize", json={"well_id": "BGH-01", "current_spm": 5.0, "current_stroke_in": 120.0})
    assert response.status_code == 200
    data = response.json()
    assert "safe_spm_window" in data
    assert "curve_data" in data

def test_css_optimize():
    response = client.post("/api/css/optimize", json={"well_id": "BGH-01", "weight_production": 0.35})
    assert response.status_code == 200
    data = response.json()
    assert "recommended_steam_volume_range" in data

def test_joint_optimizer():
    response = client.post("/api/optimizer/joint", json={
        "well_id": "BGH-01",
        "target_production_weight": 0.30,
        "thermal_utilization_weight": 0.25,
        "sor_reduction_weight": 0.20,
        "energy_minimization_weight": 0.15,
        "mechanical_risk_weight": 0.10
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommended_solution" in data
    assert "constraint_report" in data
    assert data["constraint_report"]["overall_status"] == "PASSED"
    # Verify core message
    assert "We do not optimize CSS and SRP independently" in data["message"]

def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["components"]["api_server"]["status"] == "ONLINE"
