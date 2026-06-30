from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.product import Product
from app.schemas.product import ProductListResponse, ProductResponse
from app.services.product_service import filter_products

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    category: str | None = None,
    max_price: float | None = None,
    in_stock_only: bool = False,
    on_sale_only: bool = False,
    search: str | None = None,
    sort: str = "featured",
    db: Session = Depends(get_db),
):
    query = filter_products(
        db,
        category=category,
        max_price=max_price,
        in_stock_only=in_stock_only,
        on_sale_only=on_sale_only,
        search=search,
        sort=sort,
    )
    products = query.all()
    return ProductListResponse(
        total=len(products),
        items=[ProductResponse.from_orm_model(p) for p in products],
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductResponse.from_orm_model(product)
