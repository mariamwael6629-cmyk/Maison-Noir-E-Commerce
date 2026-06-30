from pydantic import BaseModel


class PromoValidateRequest(BaseModel):
    code: str


class PromoValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_percent: float = 0.0
    message: str


class PromoCodeResponse(BaseModel):
    code: str
    description: str
    discount_percent: float
    status: str
    uses: int

    model_config = {"from_attributes": True}
