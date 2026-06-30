from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/api/products", tags=["reviews"])


@router.get("/{product_id}/reviews", response_model=list[ReviewResponse])
def list_reviews(product_id: str, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [ReviewResponse.from_orm_model(r) for r in reviews]


@router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: str,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=payload.rating,
        text=payload.text,
    )
    db.add(review)

    all_ratings = [r.rating for r in product.reviews] + [payload.rating]
    product.rating = round(sum(all_ratings) / len(all_ratings), 1)
    product.reviews_count = len(all_ratings)

    db.commit()
    db.refresh(review)
    return ReviewResponse.from_orm_model(review)
