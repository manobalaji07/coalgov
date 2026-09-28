from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Mine, RiskScore
from app.schemas.schemas import RiskScoreOut
from app.services.ai_service import compute_mine_risk_score, detect_anomalies, cluster_recurring_violations

router = APIRouter(prefix="/ai", tags=["AI & Predictive Analytics"])

@router.get("/risk-scores", response_model=List[RiskScoreOut])
def get_risk_scores(mine_id: Optional[str] = None, db: Session = Depends(get_db)):
    if mine_id:
        score_rec = db.query(RiskScore).filter(RiskScore.entity_id == mine_id).first()
        if not score_rec:
            res = compute_mine_risk_score(db, mine_id)
            score_rec = db.query(RiskScore).filter(RiskScore.entity_id == mine_id).first()
        return [score_rec] if score_rec else []

    # Ensure all mines have scores computed
    mines = db.query(Mine).all()
    for m in mines:
        compute_mine_risk_score(db, m.id)
        
    return db.query(RiskScore).order_by(RiskScore.score.desc()).all()

@router.post("/recompute/{mine_id}")
def recompute_risk(mine_id: str, db: Session = Depends(get_db)):
    return compute_mine_risk_score(db, mine_id)

@router.get("/anomalies")
def get_operational_anomalies(db: Session = Depends(get_db)):
    return detect_anomalies(db)

@router.get("/recurring-violations")
def get_recurring_failures(db: Session = Depends(get_db)):
    return cluster_recurring_violations(db)
