from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ComplianceObligation, Mine, User
from app.schemas.schemas import ComplianceCreate, ComplianceOut
from app.api.deps import get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/compliance", tags=["Compliance Registry"])

@router.get("/obligations", response_model=List[ComplianceOut])
def list_obligations(
    mine_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ComplianceObligation)
    if mine_id:
        query = query.filter(ComplianceObligation.mine_id == mine_id)
    if category:
        query = query.filter(ComplianceObligation.category == category.upper())
    if status:
        query = query.filter(ComplianceObligation.status == status.upper())
    return query.order_by(ComplianceObligation.due_date.asc()).all()

@router.post("/obligations", response_model=ComplianceOut)
def create_obligation(
    data: ComplianceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mine = db.query(Mine).filter(Mine.id == data.mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")

    obligation = ComplianceObligation(
        mine_id=data.mine_id,
        section_id=data.section_id,
        title=data.title,
        statutory_ref=data.statutory_ref,
        category=data.category.upper(),
        frequency=data.frequency.upper(),
        due_date=data.due_date,
        assigned_owner=data.assigned_owner,
        status="PENDING"
    )
    db.add(obligation)
    db.commit()
    db.refresh(obligation)

    record_audit_log(
        db=db,
        actor_email=current_user.email,
        actor_id=current_user.id,
        action="CREATE_COMPLIANCE_OBLIGATION",
        entity_type="COMPLIANCE_OBLIGATION",
        entity_id=obligation.id,
        payload={"title": obligation.title, "category": obligation.category, "mine_id": obligation.mine_id}
    )
    return obligation
