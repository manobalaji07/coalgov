from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import CAPA, User
from app.schemas.schemas import CAPAOut, CAPAResolve
from app.api.deps import get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/capas", tags=["CAPA Workflow Management"])

@router.get("", response_model=List[CAPAOut])
def list_capas(
    mine_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CAPA)
    if mine_id:
        query = query.filter(CAPA.mine_id == mine_id)
    if status:
        query = query.filter(CAPA.status == status.upper())
    if severity:
        query = query.filter(CAPA.severity == severity.upper())
    return query.order_by(CAPA.created_at.desc()).all()

@router.post("/{capa_id}/resolve", response_model=CAPAOut)
def resolve_capa(
    capa_id: str,
    data: CAPAResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")

    capa.status = "RESOLVED"
    capa.proof_description = data.proof_description
    capa.proof_photo_url = data.proof_photo_url
    capa.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(capa)

    record_audit_log(
        db=db,
        actor_email=current_user.email,
        actor_id=current_user.id,
        action="RESOLVE_CAPA",
        entity_type="CAPA",
        entity_id=capa.id,
        payload={"proof_notes": data.proof_description}
    )
    return capa

@router.post("/{capa_id}/verify", response_model=CAPAOut)
def verify_and_close_capa(
    capa_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")

    capa.status = "VERIFIED"
    capa.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(capa)

    record_audit_log(
        db=db,
        actor_email=current_user.email,
        actor_id=current_user.id,
        action="VERIFY_AND_CLOSE_CAPA",
        entity_type="CAPA",
        entity_id=capa.id,
        payload={"verified_by": current_user.email}
    )
    return capa
