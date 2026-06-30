from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: str
    sku: str
    name: str
    cat: str
    price: float
    was: float | None
    description: str
    materials: str
    rating: float
    reviews: int
    stock: int
    isNew: bool
    colors: list[str]
    img: str
    img2: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, p):
        return cls(
            id=p.id,
            sku=p.sku,
            name=p.name,
            cat=p.category_id,
            price=p.price,
            was=p.was_price,
            description=p.description,
            materials=p.materials,
            rating=p.rating,
            reviews=p.reviews_count,
            stock=p.stock,
            isNew=p.is_new,
            colors=p.colors,
            img=p.img,
            img2=p.img2,
        )


class ProductListResponse(BaseModel):
    total: int
    items: list[ProductResponse]
