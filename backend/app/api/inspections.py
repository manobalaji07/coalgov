from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Inspection, Observation, Mine, User
from app.schemas.schemas import InspectionOut, ObservationCreate, ObservationOut
from app.api.deps import get_current_user
from app.services.workflow_service import auto_create_capa_for_violation
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/inspections", tags=["Inspections & Field Observations"])

@router.get("", response_model=List[InspectionOut])
def list_inspections(mine_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Inspection)
    if mine_id:
        query = query.filter(Inspection.mine_id == mine_id)
    return query.order_by(Inspection.scheduled_date.desc()).all()

@router.post("/observations", response_model=ObservationOut)
def record_observation(
    data: ObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check duplicate client_uuid for offline idempotency
    if data.client_uuid:
        existing = db.query(Observation).filter(Observation.client_uuid == data.client_uuid).first()
        if existing:
            return existing

    mine = db.query(Mine).filter(Mine.id == data.mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")

    obs = Observation(
        inspection_id=data.inspection_id,
        mine_id=data.mine_id,
        section_id=data.section_id,
        inspector_id=current_user.id,
        category=data.category,
        description=data.description,
        severity=data.severity,
        is_violation=data.is_violation,
        latitude=data.latitude,
        longitude=data.longitude,
        photo_url=data.photo_url,
        client_uuid=data.client_uuid,
        client_timestamp=data.client_timestamp or data.client_timestamp
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)

    record_audit_log(
        db=db,
        actor_email=current_user.email,
        actor_id=current_user.id,
        action="RECORD_OBSERVATION",
        entity_type="OBSERVATION",
        entity_id=obs.id,
        payload={"category": obs.category, "severity": obs.severity, "is_violation": obs.is_violation}
    )

    # Auto-trigger CAPA if violation
    if obs.is_violation:
        auto_create_capa_for_violation(db=db, observation=obs, actor_email=current_user.email)

    return obs

@router.post("/observations/sync")
def sync_offline_observations(
    items: List[ObservationCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    synced_count = 0
    duplicate_count = 0

    for item in items:
        if item.client_uuid:
            existing = db.query(Observation).filter(Observation.client_uuid == item.client_uuid).first()
            if existing:
                duplicate_count += 1
                continue

        obs = Observation(
            inspection_id=item.inspection_id,
            mine_id=item.mine_id,
            section_id=item.section_id,
            inspector_id=current_user.id,
            category=item.category,
            description=item.description,
            severity=item.severity,
            is_violation=item.is_violation,
            latitude=item.latitude,
            longitude=item.longitude,
            photo_url=item.photo_url,
            client_uuid=item.client_uuid,
            client_timestamp=item.client_timestamp
        )
        db.add(obs)
        db.commit()
        db.refresh(obs)

        record_audit_log(
            db=db,
            actor_email=current_user.email,
            actor_id=current_user.id,
            action="PWA_OFFLINE_SYNC_OBSERVATION",
            entity_type="OBSERVATION",
            entity_id=obs.id,
            payload={"client_uuid": obs.client_uuid, "severity": obs.severity, "is_violation": obs.is_violation}
        )

        if obs.is_violation:
            auto_create_capa_for_violation(db=db, observation=obs, actor_email=current_user.email)

        synced_count += 1

    return {
        "status": "success",
        "synced_count": synced_count,
        "duplicate_count": duplicate_count,
        "message": f"Successfully processed {synced_count} offline observations ({duplicate_count} duplicates skipped)."
    }
