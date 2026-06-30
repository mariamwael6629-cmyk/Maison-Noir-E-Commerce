import random

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.promo import PromoCode

SHIPPING_THRESHOLD = 500
SHIPPING_COST = 24
TAX_RATE = 0.0775


def generate_order_number(db: Session) -> str:
    while True:
        candidate = f"MN-{random.randint(80000, 99999)}"
        if not db.query(Order).filter(Order.order_number == candidate).first():
            return candidate


def calculate_totals(subtotal: float, promo: PromoCode | None) -> dict:
    shipping_cost = 0.0 if subtotal == 0 or subtotal > SHIPPING_THRESHOLD else float(SHIPPING_COST)
    tax = round(subtotal * TAX_RATE)
    discount = round(subtotal * promo.discount_percent / 100) if promo else 0.0
    total = subtotal + shipping_cost + tax - discount
    return {"shipping_cost": shipping_cost, "tax": tax, "discount": discount, "total": total}


def create_order(db: Session, user_id: int, payload) -> Order:
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_([i.product_id for i in payload.items])).all()}

    subtotal = 0.0
    order_items = []
    for item in payload.items:
        product = products.get(item.product_id)
        if not product:
            continue
        subtotal += product.price * item.qty
        order_items.append(
            OrderItem(
                product_id=product.id,
                name_snapshot=product.name,
                img_snapshot=product.img,
                price_snapshot=product.price,
                color=item.color,
                qty=item.qty,
            )
        )

    promo = None
    if payload.promo_code:
        promo = (
            db.query(PromoCode)
            .filter(PromoCode.code == payload.promo_code.upper(), PromoCode.status == "active")
            .first()
        )

    totals = calculate_totals(subtotal, promo)

    order = Order(
        order_number=generate_order_number(db),
        user_id=user_id,
        subtotal=subtotal,
        shipping_cost=totals["shipping_cost"],
        tax=totals["tax"],
        discount=totals["discount"],
        total=totals["total"],
        promo_code=promo.code if promo else None,
        shipping_first_name=payload.shipping_address.first_name,
        shipping_last_name=payload.shipping_address.last_name,
        shipping_address=payload.shipping_address.address,
        shipping_city=payload.shipping_address.city,
        shipping_postal_code=payload.shipping_address.postal_code,
        shipping_country=payload.shipping_address.country,
        shipping_phone=payload.shipping_address.phone,
        payment_method=payload.payment_method,
        items=order_items,
    )

    if promo:
        promo.uses += 1

    for item in payload.items:
        product = products.get(item.product_id)
        if product:
            product.stock = max(0, product.stock - item.qty)

    db.add(order)
    db.commit()
    db.refresh(order)
    return order
