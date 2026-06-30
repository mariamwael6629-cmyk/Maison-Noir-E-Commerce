from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=1, max_length=2000)


class ReviewResponse(BaseModel):
    id: int
    name: str
    rating: int
    text: str
    verified: bool
    date: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, r):
        return cls(
            id=r.id,
            name=r.user.full_name,
            rating=r.rating,
            text=r.text,
            verified=r.verified,
            date=r.created_at.strftime("%B %Y"),
        )
