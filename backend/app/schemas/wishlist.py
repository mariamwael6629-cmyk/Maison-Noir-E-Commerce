from pydantic import BaseModel

from app.schemas.product import ProductResponse


class WishlistResponse(BaseModel):
    product_ids: list[str]
    products: list[ProductResponse]
