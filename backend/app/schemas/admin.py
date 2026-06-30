from pydantic import BaseModel

from app.schemas.order import OrderItemResponse


class AdminOrderResponse(BaseModel):
    id: str
    customer: str
    date: str
    total: float
    status: str
    items: int

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, order):
        return cls(
            id=order.order_number,
            customer=order.user.full_name,
            date=order.created_at.strftime("%b %-d") if hasattr(order.created_at, "strftime") else str(order.created_at),
            total=order.total,
            status=order.status,
            items=sum(i.qty for i in order.items),
        )


class AdminStatsResponse(BaseModel):
    revenue_30d: float
    orders_count: int
    avg_order_value: float
    products_count: int
    customers_count: int


class AdminCustomerResponse(BaseModel):
    name: str
    email: str
    orders: int
    spent: float
