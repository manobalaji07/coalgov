from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Organization, Subsidiary, Mine, Section, User, CAPA, ComplianceObligation, Observation
from app.schemas.schemas import OrganizationOut, SubsidiaryOut, MineOut, SectionOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/mines", tags=["Mines & Subsidiaries"])

@router.get("/organization", response_model=OrganizationOut)
def get_organization(db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.get("", response_model=List[MineOut])
def list_mines(subsidiary_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Mine)
    if subsidiary_id:
        query = query.filter(Mine.subsidiary_id == subsidiary_id)
    return query.all()

@router.get("/{mine_id}", response_model=MineOut)
def get_mine(mine_id: str, db: Session = Depends(get_db)):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    return mine

@router.get("/{mine_id}/dashboard-stats")
def get_mine_dashboard_stats(mine_id: str, db: Session = Depends(get_db)):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")

    total_obligations = db.query(ComplianceObligation).filter(ComplianceObligation.mine_id == mine_id).count()
    compliant_obligations = db.query(ComplianceObligation).filter(
        ComplianceObligation.mine_id == mine_id, 
        ComplianceObligation.status == "COMPLIANT"
    ).count()

    total_capas = db.query(CAPA).filter(CAPA.mine_id == mine_id).count()
    open_capas = db.query(CAPA).filter(CAPA.mine_id == mine_id, CAPA.status.in_(["OPEN", "IN_PROGRESS"])).count()
    escalated_capas = db.query(CAPA).filter(CAPA.mine_id == mine_id, CAPA.status == "ESCALATED").count()
    resolved_capas = db.query(CAPA).filter(CAPA.mine_id == mine_id, CAPA.status.in_(["RESOLVED", "VERIFIED"])).count()

    total_obs = db.query(Observation).filter(Observation.mine_id == mine_id).count()
    violations_cnt = db.query(Observation).filter(Observation.mine_id == mine_id, Observation.is_violation == True).count()

    compliance_percentage = round((compliant_obligations / max(1, total_obligations)) * 100.0, 1)

    return {
        "mine_id": mine.id,
        "mine_name": mine.name,
        "mine_code": mine.code,
        "mine_type": mine.mine_type,
        "subsidiary_name": mine.subsidiary.name if mine.subsidiary else "CIL",
        "latitude": mine.latitude,
        "longitude": mine.longitude,
        "district": mine.district,
        "compliance_percentage": compliance_percentage,
        "total_obligations": total_obligations,
        "compliant_obligations": compliant_obligations,
        "total_capas": total_capas,
        "open_capas": open_capas,
        "escalated_capas": escalated_capas,
        "resolved_capas": resolved_capas,
        "total_observations": total_obs,
        "violations_count": violations_cnt
    }
