import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import AuditLog

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def compute_hash(prev_hash: str, timestamp_str: str, actor_email: str, action: str, entity_type: str, entity_id: str, payload_json: str) -> str:
    raw_data = f"{prev_hash}|{timestamp_str}|{actor_email}|{action}|{entity_type}|{entity_id}|{payload_json}"
    return hashlib.sha256(raw_data.encode("utf-8")).hexdigest()

def record_audit_log(
    db: Session,
    actor_email: str,
    action: str,
    entity_type: str,
    entity_id: str,
    payload: dict,
    actor_id: str = None
) -> AuditLog:
    # Fetch latest audit log
    last_log = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).first()
    prev_hash = last_log.current_hash if last_log else GENESIS_HASH

    now = datetime.utcnow()
    timestamp_str = now.isoformat()
    payload_json = json.dumps(payload, sort_keys=True)

    current_hash = compute_hash(
        prev_hash=prev_hash,
        timestamp_str=timestamp_str,
        actor_email=actor_email,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        payload_json=payload_json
    )

    audit_entry = AuditLog(
        timestamp=now,
        actor_id=actor_id,
        actor_email=actor_email,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        payload_json=payload_json,
        prev_hash=prev_hash,
        current_hash=current_hash
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry

def verify_audit_chain(db: Session) -> dict:
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.asc()).all()
    if not logs:
        return {
            "is_valid": True,
            "total_records": 0,
            "tampered_records_count": 0,
            "tampered_log_ids": [],
            "message": "Audit ledger is empty."
        }

    expected_prev = GENESIS_HASH
    tampered_ids = []

    for log in logs:
        # Check linkage
        if log.prev_hash != expected_prev:
            tampered_ids.append(log.id)
            expected_prev = log.current_hash
            continue

        # Recompute hash
        recalculated = compute_hash(
            prev_hash=log.prev_hash,
            timestamp_str=log.timestamp.isoformat(),
            actor_email=log.actor_email,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            payload_json=log.payload_json
        )

        if recalculated != log.current_hash:
            tampered_ids.append(log.id)

        expected_prev = log.current_hash

    is_valid = len(tampered_ids) == 0
    return {
        "is_valid": is_valid,
        "total_records": len(logs),
        "tampered_records_count": len(tampered_ids),
        "tampered_log_ids": tampered_ids,
        "message": "Audit chain integrity verified successfully. All block hashes match." if is_valid else f"TAMPERING DETECTED! {len(tampered_ids)} record(s) fail cryptographic hash verification."
    }
