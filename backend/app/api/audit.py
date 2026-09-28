from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogOut, AuditVerificationResult
from app.services.audit_service import verify_audit_chain

router = APIRouter(prefix="/audit", tags=["Cryptographic Audit Ledger"])

@router.get("/logs", response_model=List[AuditLogOut])
def list_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/verify", response_model=AuditVerificationResult)
def verify_integrity(db: Session = Depends(get_db)):
    return verify_audit_chain(db)

@router.post("/tamper-demo")
def tamper_audit_row(db: Session = Depends(get_db)):
    log = db.query(AuditLog).order_by(AuditLog.timestamp.asc()).first()
    if not log:
        raise HTTPException(status_code=404, detail="No audit logs available to tamper")

    log.payload_json = '{"tampered": true, "unauthorized_change": "Bypassed Safety Violation"}'
    db.commit()

    return {
        "status": "tampered",
        "message": f"Audit Log ID {log.id} payload has been maliciously mutated. Run /api/audit/verify to see cryptographic detection."
    }
