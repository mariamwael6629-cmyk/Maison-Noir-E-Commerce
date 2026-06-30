from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.promo import PromoCode
from app.schemas.promo import PromoValidateRequest, PromoValidateResponse

router = APIRouter(prefix="/api/promo", tags=["promo"])


@router.post("/validate", response_model=PromoValidateResponse)
def validate_promo(payload: PromoValidateRequest, db: Session = Depends(get_db)):
    code = payload.code.strip().upper()
    promo = db.query(PromoCode).filter(PromoCode.code == code, PromoCode.status == "active").first()

    if not promo:
        return PromoValidateResponse(valid=False, code=code, message="Invalid or expired promo code.")

    return PromoValidateResponse(
        valid=True,
        code=promo.code,
        discount_percent=promo.discount_percent,
        message=f"{promo.discount_percent:.0f}% atelier discount applied.",
    )
