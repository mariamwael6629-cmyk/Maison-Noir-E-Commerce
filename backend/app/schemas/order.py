from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: str
    color: str
    qty: int = Field(ge=1, le=99)


class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    address: str
    city: str
    postal_code: str
    country: str
    phone: str


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_address: ShippingAddress
    payment_method: str = "card"
    promo_code: str | None = None


class OrderItemResponse(BaseModel):
    product_id: str
    name: str
    img: str
    price: float
    color: str
    qty: int

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, item):
        return cls(
            product_id=item.product_id,
            name=item.name_snapshot,
            img=item.img_snapshot,
            price=item.price_snapshot,
            color=item.color,
            qty=item.qty,
        )


class OrderResponse(BaseModel):
    id: str
    date: str
    status: str
    subtotal: float
    shipping_cost: float
    tax: float
    discount: float
    total: float
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, order):
        return cls(
            id=order.order_number,
            date=order.created_at.strftime("%b %-d, %Y") if hasattr(order.created_at, "strftime") else str(order.created_at),
            status=order.status,
            subtotal=order.subtotal,
            shipping_cost=order.shipping_cost,
            tax=order.tax,
            discount=order.discount,
            total=order.total,
            items=[OrderItemResponse.from_orm_model(i) for i in order.items],
        )
