from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.pdf_service import generate_mine_compliance_pdf

router = APIRouter(prefix="/reports", tags=["Reporting Service"])

@router.get("/compliance/pdf/{mine_id}")
def download_mine_compliance_pdf(mine_id: str, db: Session = Depends(get_db)):
    try:
        pdf_bytes = generate_mine_compliance_pdf(db, mine_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=coalgov_statutory_compliance_{mine_id[:8]}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
