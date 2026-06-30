from sqlalchemy.orm import Query, Session

from app.models.product import Product


def filter_products(
    db: Session,
    category: str | None = None,
    max_price: float | None = None,
    in_stock_only: bool = False,
    on_sale_only: bool = False,
    search: str | None = None,
    sort: str = "featured",
) -> Query:
    query = db.query(Product)

    if category and category != "all":
        query = query.filter(Product.category_id == category)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock_only:
        query = query.filter(Product.stock > 0)
    if on_sale_only:
        query = query.filter(Product.was_price.isnot(None))
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(Product.name.ilike(like))

    if sort == "price-asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price-desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort == "new":
        query = query.order_by(Product.is_new.desc())

    return query
