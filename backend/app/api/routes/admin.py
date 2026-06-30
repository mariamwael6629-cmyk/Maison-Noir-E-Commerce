from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.models.order import Order
from app.models.product import Product
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.admin import AdminCustomerResponse, AdminOrderResponse, AdminStatsResponse
from app.schemas.promo import PromoCodeResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/orders", response_model=list[AdminOrderResponse], dependencies=[Depends(get_current_admin)])
def list_admin_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [AdminOrderResponse.from_orm_model(o) for o in orders]


@router.get("/stats", response_model=AdminStatsResponse, dependencies=[Depends(get_current_admin)])
def admin_stats(db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=30)
    recent_orders = db.query(Order).filter(Order.created_at >= since).all()
    revenue_30d = sum(o.total for o in recent_orders)
    orders_count = db.query(func.count(Order.id)).scalar() or 0
    avg_order_value = (sum(o.total for o in db.query(Order).all()) / orders_count) if orders_count else 0.0
    products_count = db.query(func.count(Product.id)).scalar() or 0
    customers_count = db.query(func.count(User.id)).filter(User.is_admin.is_(False)).scalar() or 0

    return AdminStatsResponse(
        revenue_30d=revenue_30d,
        orders_count=orders_count,
        avg_order_value=round(avg_order_value, 2),
        products_count=products_count,
        customers_count=customers_count,
    )


@router.get("/customers", response_model=list[AdminCustomerResponse], dependencies=[Depends(get_current_admin)])
def list_admin_customers(db: Session = Depends(get_db)):
    customers = db.query(User).filter(User.is_admin.is_(False)).all()
    return [
        AdminCustomerResponse(
            name=c.full_name,
            email=c.email,
            orders=len(c.orders),
            spent=sum(o.total for o in c.orders),
        )
        for c in customers
    ]


@router.get("/promos", response_model=list[PromoCodeResponse], dependencies=[Depends(get_current_admin)])
def list_admin_promos(db: Session = Depends(get_db)):
    return db.query(PromoCode).order_by(PromoCode.id).all()
