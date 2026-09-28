import sys
import os
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import (
    Organization, Subsidiary, Mine, Section, User, Contractor, Worker,
    ComplianceObligation, Inspection, Observation, CAPA, Attendance, Grievance,
    RiskScore, Notification, AuditLog
)
from app.services.audit_service import record_audit_log
from app.services.ai_service import compute_mine_risk_score

def seed():
    print("[SEED] Seeding CoalGov AI Demo Database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 1. Organization
    org = Organization(name="Coal India Limited (CIL)", code="CIL-HQ")
    db.add(org)
    db.commit()

    # 2. Subsidiaries
    s1 = Subsidiary(organization_id=org.id, name="Eastern Coalfields Limited (ECL)", code="ECL", state="Jharkhand & West Bengal")
    s2 = Subsidiary(organization_id=org.id, name="Bharat Coking Coal Limited (BCCL)", code="BCCL", state="Jharkhand")
    s3 = Subsidiary(organization_id=org.id, name="South Eastern Coalfields Limited (SECL)", code="SECL", state="Chhattisgarh")
    db.add_all([s1, s2, s3])
    db.commit()

    # 3. Mines (8 mines in coal belts)
    mines_data = [
        {"sub": s1, "name": "Rajmahal Opencast Mine", "code": "ECL-RJM", "type": "Opencast", "lat": 25.0489, "lon": 87.3524, "district": "Godda, Jharkhand"},
        {"sub": s1, "name": "Sonalpur Bazari Mine", "code": "ECL-SBZ", "type": "Opencast", "lat": 23.6891, "lon": 87.2145, "district": "Raniganj, West Bengal"},
        {"sub": s2, "name": "Jharia Underground Mine", "code": "BCCL-JHR", "type": "Underground", "lat": 23.7420, "lon": 86.4160, "district": "Dhanbad, Jharkhand"},
        {"sub": s2, "name": "Kusunda Opencast Mine", "code": "BCCL-KSD", "type": "Opencast", "lat": 23.7712, "lon": 86.3980, "district": "Dhanbad, Jharkhand"},
        {"sub": s3, "name": "Gevra Mega Opencast Mine", "code": "SECL-GVR", "type": "Opencast", "lat": 22.3364, "lon": 82.5932, "district": "Korba, Chhattisgarh"},
        {"sub": s3, "name": "Dipka Opencast Mine", "code": "SECL-DPK", "type": "Opencast", "lat": 22.3145, "lon": 82.5489, "district": "Korba, Chhattisgarh"},
        {"sub": s3, "name": "Kusmunda Opencast Mine", "code": "SECL-KSM", "type": "Opencast", "lat": 22.3489, "lon": 82.6812, "district": "Korba, Chhattisgarh"},
        {"sub": s1, "name": "Piparwar Coal Mine", "code": "ECL-PPW", "type": "Opencast", "lat": 23.7214, "lon": 85.0489, "district": "Chatra, Jharkhand"},
    ]

    mine_objects = []
    for m in mines_data:
        mine_obj = Mine(
            subsidiary_id=m["sub"].id,
            name=m["name"],
            code=m["code"],
            mine_type=m["type"],
            latitude=m["lat"],
            longitude=m["lon"],
            district=m["district"],
            production_capacity_mt=12.5 if "Gevra" in m["name"] else 5.0
        )
        db.add(mine_obj)
        mine_objects.append(mine_obj)
    db.commit()

    # 4. Sections per mine
    section_types = ["Haul Road A", "Excavation Pit B", "CHPV Processing Unit", "3.3kV Substation", "Overburden Dump C"]
    sections_list = []
    for m in mine_objects:
        for st in section_types:
            sec = Section(mine_id=m.id, name=f"{m.name} - {st}", code=f"{m.code}-{st[:3].upper()}", section_type=st)
            db.add(sec)
            sections_list.append(sec)
    db.commit()

    # 5. Demo Users
    users_data = [
        {"email": "inspector@coalgov.in", "pass": "inspector123", "name": "Rajeswar Sharma", "role": "INSPECTOR", "mine": mine_objects[4]},
        {"email": "manager@coalgov.in", "pass": "manager123", "name": "Aman Verma", "role": "MINE_MANAGER", "mine": mine_objects[4]},
        {"email": "corporate@coalgov.in", "pass": "corporate123", "name": "Sunita Rao", "role": "CORPORATE", "sub": s3},
        {"email": "regulator@coalgov.in", "pass": "regulator123", "name": "DGMS Inspector Team", "role": "REGULATOR"},
        {"email": "admin@coalgov.in", "pass": "admin123", "name": "System Administrator", "role": "ADMIN"},
    ]

    user_objects = []
    for u in users_data:
        user_obj = User(
            email=u["email"],
            hashed_password=get_password_hash(u["pass"]),
            full_name=u["name"],
            role=u["role"],
            organization_id=org.id,
            subsidiary_id=u.get("sub").id if u.get("sub") else None,
            mine_id=u.get("mine").id if u.get("mine") else None,
            phone="+91-9876543210"
        )
        db.add(user_obj)
        user_objects.append(user_obj)
    db.commit()

    # 6. Contractors & Workers
    c1 = Contractor(company_name="L&T Mining Infra Services", license_no="CON-LT-2024-09", contact_email="contact@ltmining.in", contact_phone="+91-9988776655", compliance_rating=92.4)
    c2 = Contractor(company_name="Simplex Earthmovers Ltd", license_no="CON-SPLX-2023-11", contact_email="info@simplexearth.com", contact_phone="+91-9811223344", compliance_rating=78.1)
    db.add_all([c1, c2])
    db.commit()

    w1 = Worker(contractor_id=c1.id, mine_id=mine_objects[4].id, full_name="Ramesh Kumar", worker_card_id="WRK-CIL-8801", trade="Dumper Driver")
    w2 = Worker(contractor_id=c1.id, mine_id=mine_objects[4].id, full_name="Suresh Mahto", worker_card_id="WRK-CIL-8802", trade="Shovel Operator")
    w3 = Worker(contractor_id=c2.id, mine_id=mine_objects[4].id, full_name="Dinesh Yadav", worker_card_id="WRK-CIL-8803", trade="Electrician")
    db.add_all([w1, w2, w3])
    db.commit()

    # 7. Compliance Obligations
    categories = ["SAFETY", "ENVIRONMENT", "PRODUCTION", "LABOUR"]
    statutory_refs = [
        ("DGMS Circular 4 of 2021", "Haul road slope and dust suppression compliance mandatory."),
        ("Mines Act 1952 Section 28", "Weekly safety inspection of electrical trailing cables and grounding."),
        ("CPCB Air Quality Norms 2024", "Continuous PM10/PM2.5 ambient monitoring telemetry active."),
        ("DGMS Safety Circular 2/2020", "Dumper operator fatigue monitoring & proximity warning radar check."),
        ("Contract Labour Act 1970", "Full compliance for contractor minimum wages and provident fund.")
    ]

    now = datetime.utcnow()

    for m in mine_objects:
        for idx, (sref, title) in enumerate(statutory_refs):
            ob = ComplianceObligation(
                mine_id=m.id,
                title=f"{m.name}: {title}",
                statutory_ref=sref,
                category=categories[idx % len(categories)],
                frequency="MONTHLY",
                due_date=now + timedelta(days=(idx * 7) - 10),
                assigned_owner="Safety Manager",
                status="COMPLIANT" if idx % 2 == 0 else "PENDING"
            )
            db.add(ob)
    db.commit()

    # 8. Historical Inspections, Observations & CAPAs (6 months of data)
    inspector_user = user_objects[0]
    manager_user = user_objects[1]

    obs_sample_data = [
        {"cat": "SAFETY", "sev": "CRITICAL", "viol": True, "desc": "Trailing cable outer sheath severely frayed on 10 cu.m hydraulic shovel #3 in Seam B pit.", "lat_off": 0.002, "lon_off": -0.001},
        {"cat": "ENVIRONMENT", "sev": "HIGH", "viol": True, "desc": "Water tanker dust suppression skipped on Haul Road B causing PM10 spikes near pit gate.", "lat_off": -0.001, "lon_off": 0.003},
        {"cat": "EQUIPMENT", "sev": "MEDIUM", "viol": True, "desc": "Dumper #D-402 steering brake fluid pressure dropping below safe limit during haul climb.", "lat_off": 0.001, "lon_off": 0.002},
        {"cat": "SAFETY", "sev": "HIGH", "viol": True, "desc": "Overburden dump bench height exceeded 12 meters without benching step as per DGMS plan.", "lat_off": -0.003, "lon_off": -0.002},
        {"cat": "LABOUR", "sev": "LOW", "viol": False, "desc": "Contractor workers provided new reflective safety vests and hardhats at check post.", "lat_off": 0.000, "lon_off": 0.000},
    ]

    for m in mine_objects:
        insp = Inspection(
            mine_id=m.id,
            inspector_id=inspector_user.id,
            title=f"Monthly Comprehensive Safety Walk - {m.name}",
            checklist_type="DGMS Statutory Safety Audit",
            scheduled_date=now - timedelta(days=15),
            completed_at=now - timedelta(days=15),
            status="COMPLETED"
        )
        db.add(insp)
        db.commit()

        for obs_item in obs_sample_data:
            obs = Observation(
                inspection_id=insp.id,
                mine_id=m.id,
                inspector_id=inspector_user.id,
                category=obs_item["cat"],
                description=obs_item["desc"],
                severity=obs_item["sev"],
                is_violation=obs_item["viol"],
                latitude=m.latitude + obs_item["lat_off"],
                longitude=m.longitude + obs_item["lon_off"],
                client_uuid=f"uuid-{m.code}-{obs_item['cat']}-{hash(obs_item['desc'])}",
                client_timestamp=now - timedelta(days=14),
                server_timestamp=now - timedelta(days=14)
            )
            db.add(obs)
            db.commit()

            # Record audit log for observation
            record_audit_log(
                db=db,
                actor_email=inspector_user.email,
                actor_id=inspector_user.id,
                action="RECORD_OBSERVATION",
                entity_type="OBSERVATION",
                entity_id=obs.id,
                payload={"category": obs.category, "severity": obs.severity, "is_violation": obs.is_violation}
            )

            if obs.is_violation:
                # Create CAPAs with varied statuses (OPEN, ESCALATED, RESOLVED)
                is_escalated = obs.severity in ["CRITICAL", "HIGH"] and "Gevra" in m.name
                capa_status = "ESCALATED" if is_escalated else ("RESOLVED" if obs.severity == "MEDIUM" else "OPEN")
                esc_level = 2 if is_escalated else 0

                capa = CAPA(
                    observation_id=obs.id,
                    mine_id=m.id,
                    title=f"CAPA: Fix {obs.category} [{obs.severity}]",
                    description=f"Remediate violation observed at {m.name}. {obs.description}",
                    severity=obs.severity,
                    assigned_to_id=manager_user.id,
                    assigned_to_name=manager_user.full_name,
                    sla_due_date=now - timedelta(days=2) if is_escalated else now + timedelta(days=5),
                    status=capa_status,
                    escalation_level=esc_level,
                    proof_description="Replacement cable installed and dielectric breakdown tested clean." if capa_status == "RESOLVED" else None,
                    resolved_at=now - timedelta(days=1) if capa_status == "RESOLVED" else None
                )
                db.add(capa)
                db.commit()

                record_audit_log(
                    db=db,
                    actor_email="system.workflow@coalgov.in",
                    action="AUTO_CREATE_CAPA",
                    entity_type="CAPA",
                    entity_id=capa.id,
                    payload={"status": capa.status, "severity": capa.severity, "escalation_level": capa.escalation_level}
                )

    # 9. Compute AI Risk Scores for all mines
    print("[AI] Computing AI Risk Scores for all mines...")
    for m in mine_objects:
        compute_mine_risk_score(db, m.id)

    db.close()
    print("[SUCCESS] CoalGov AI Demo Database Seeded Successfully!")

if __name__ == "__main__":
    seed()
