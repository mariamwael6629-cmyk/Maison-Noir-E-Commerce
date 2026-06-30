from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.schemas.product import ProductResponse
from app.schemas.wishlist import WishlistResponse

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=WishlistResponse)
def get_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()
    products = [item.product for item in items]
    return WishlistResponse(
        product_ids=[p.id for p in products],
        products=[ProductResponse.from_orm_model(p) for p in products],
    )


@router.post("/{product_id}", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not existing:
        db.add(WishlistItem(user_id=current_user.id, product_id=product_id))
        db.commit()

    return get_wishlist(db, current_user)


@router.delete("/{product_id}", response_model=WishlistResponse)
def remove_from_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id
    ).delete()
    db.commit()
    return get_wishlist(db, current_user)
