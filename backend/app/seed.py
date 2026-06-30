"""Populates the database with the original mock-data catalog, demo users, reviews and promo codes.

Run with: python -m app.seed (from the backend/ directory, with the venv active).
Safe to re-run — it skips seeding if categories already exist.
"""

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.models.promo import PromoCode

IMG = {
    "bag1": "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=700&q=80",
    "bag1b": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80",
    "bag2": "https://images.unsplash.com/photo-1559563458-527698bf5295?w=700&q=80",
    "bag2b": "https://images.unsplash.com/photo-1548863227-3af567fc3b27?w=700&q=80",
    "wallet": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&q=80",
    "walletb": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=700&q=80",
    "watch1": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&q=80",
    "watch1b": "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=700&q=80",
    "watch2": "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=700&q=80",
    "watch2b": "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=700&q=80",
    "perfume1": "https://images.unsplash.com/photo-1592945403407-9caf930b2c8e?w=700&q=80",
    "perfume1b": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700&q=80",
    "perfume2": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&q=80",
    "ring": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&q=80",
    "ringb": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=80",
    "cuff": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=80",
    "candle": "https://images.unsplash.com/photo-1602874801006-e26c4c5b5b25?w=700&q=80",
    "tray": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80",
    "beltimg": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=700&q=80",
    "travel": "https://images.unsplash.com/photo-1565026057757-bf8a519d3a3f?w=700&q=80",
}

CATEGORIES = [
    {"id": "leather", "name": "Leather Goods", "icon": "briefcase"},
    {"id": "timepiece", "name": "Timepieces", "icon": "watch"},
    {"id": "fragrance", "name": "Fragrance", "icon": "flask-conical"},
    {"id": "jewelry", "name": "Jewelry", "icon": "gem"},
    {"id": "home", "name": "Objets", "icon": "lamp"},
]

PRODUCTS = [
    {"id": "p01", "cat": "leather", "name": "The Almeida Tote", "price": 1480, "was": None, "rating": 4.8, "reviews": 142, "stock": 6, "isNew": True,
     "colors": ["#3D1011", "#0F0D0E", "#8A6240"], "img": IMG["bag1"], "img2": IMG["bag1b"],
     "desc": "Cut from a single hide of vegetable-tanned calfskin and finished by hand in our Florence atelier, the Almeida carries its shape from the first day you take it out — no break-in, no compromise.",
     "materials": "Full-grain vegetable-tanned calfskin, solid brass hardware, suede lining", "sku": "MN-LTH-0142"},
    {"id": "p02", "cat": "leather", "name": "Corsia Weekender", "price": 2150, "was": 2450, "rating": 4.9, "reviews": 88, "stock": 3, "isNew": False,
     "colors": ["#0F0D0E", "#3D1011"], "img": IMG["bag2"], "img2": IMG["bag2b"],
     "desc": "Built for the overnight flight and the decade after it. The Corsia takes a change of clothes, a folio, and whatever the trip demands, with a frame stiff enough to stand on its own.",
     "materials": "Bridle leather, cotton canvas interior, brushed brass fittings", "sku": "MN-LTH-0098"},
    {"id": "p03", "cat": "leather", "name": "Tessitore Cardholder", "price": 240, "was": None, "rating": 4.7, "reviews": 212, "stock": 24, "isNew": False,
     "colors": ["#0F0D0E", "#8A6240", "#E8DCC8"], "img": IMG["wallet"], "img2": IMG["walletb"],
     "desc": "Six pockets pared to the millimeter, edge-painted by hand. It disappears into a pocket the way a good wallet should.",
     "materials": "Saffiano calfskin, cotton thread", "sku": "MN-LTH-0211"},
    {"id": "p04", "cat": "leather", "name": "Marchetti Belt, 30mm", "price": 320, "was": None, "rating": 4.6, "reviews": 64, "stock": 14, "isNew": False,
     "colors": ["#0F0D0E", "#3D1011"], "img": IMG["beltimg"], "img2": IMG["beltimg"],
     "desc": "A reversible buckle in brushed copper sits atop a strap built to outlast three of its successors.",
     "materials": "Full-grain leather, copper-plated buckle", "sku": "MN-LTH-0337"},
    {"id": "p05", "cat": "leather", "name": "Voss Travel Case", "price": 980, "was": None, "rating": 4.8, "reviews": 31, "stock": 8, "isNew": True,
     "colors": ["#3D1011"], "img": IMG["travel"], "img2": IMG["travel"],
     "desc": "A hard-sided case in pebbled leather, lined in raw silk, built to keep four watches still on a moving train.",
     "materials": "Pebbled leather, cedar frame, silk lining", "sku": "MN-LTH-0410"},
    {"id": "p06", "cat": "timepiece", "name": "Solane Chronograph", "price": 4200, "was": None, "rating": 4.9, "reviews": 56, "stock": 4, "isNew": True,
     "colors": ["#A8754A", "#0F0D0E"], "img": IMG["watch1"], "img2": IMG["watch1b"],
     "desc": "A 40mm case in brushed copper-tone steel, built around a column-wheel chronograph movement decorated by hand and visible through a sapphire caseback.",
     "materials": "316L steel, sapphire crystal, calfskin strap, 42-hr power reserve", "sku": "MN-WCH-0552"},
    {"id": "p07", "cat": "timepiece", "name": "Meridian Dress Watch", "price": 3650, "was": 4100, "rating": 4.7, "reviews": 39, "stock": 5, "isNew": False,
     "colors": ["#0F0D0E", "#E8DCC8"], "img": IMG["watch2"], "img2": IMG["watch2b"],
     "desc": "Two hands, a date you have to look for, and a case that disappears under a cuff. Built for the room, not the wrist.",
     "materials": "Steel case, sunburst dial, alligator strap", "sku": "MN-WCH-0488"},
    {"id": "p08", "cat": "fragrance", "name": "Noir de Cuir EDP", "price": 285, "was": None, "rating": 4.9, "reviews": 301, "stock": 40, "isNew": True,
     "colors": ["#3D1011"], "img": IMG["perfume1"], "img2": IMG["perfume1b"],
     "desc": "Leather accord built around saffron and smoked vetiver, aged in the bottle for six weeks before release. Opens sharp, settles into skin like worn calfskin.",
     "materials": "Eau de Parfum, 100ml, vegan formulation", "sku": "MN-FRG-0019"},
    {"id": "p09", "cat": "fragrance", "name": "Ambre Fumé", "price": 265, "was": None, "rating": 4.6, "reviews": 118, "stock": 22, "isNew": False,
     "colors": ["#A8754A"], "img": IMG["perfume2"], "img2": IMG["perfume2"],
     "desc": "Amber resin, dry tobacco leaf, and a thread of clove. A scent for rooms with low light and good conversation.",
     "materials": "Eau de Parfum, 100ml", "sku": "MN-FRG-0044"},
    {"id": "p10", "cat": "jewelry", "name": "Ferro Signet Ring", "price": 890, "was": None, "rating": 4.8, "reviews": 47, "stock": 9, "isNew": False,
     "colors": ["#A8754A", "#0F0D0E"], "img": IMG["ring"], "img2": IMG["ringb"],
     "desc": "Solid bronze, hand-engraved, weighted to feel like it belongs on your hand rather than borrowed for the evening.",
     "materials": "Solid bronze, hand-finished", "sku": "MN-JWL-0072"},
    {"id": "p11", "cat": "jewelry", "name": "Corda Cuff", "price": 540, "was": 620, "rating": 4.5, "reviews": 29, "stock": 11, "isNew": False,
     "colors": ["#0F0D0E"], "img": IMG["cuff"], "img2": IMG["cuff"],
     "desc": "A single piece of forged brass, twisted once and left unpolished at the seam — proof it was made by hand, not stamped.",
     "materials": "Forged brass", "sku": "MN-JWL-0091"},
    {"id": "p12", "cat": "home", "name": "Ember Candle, No.3", "price": 95, "was": None, "rating": 4.7, "reviews": 163, "stock": 50, "isNew": False,
     "colors": ["#5C1A1B"], "img": IMG["candle"], "img2": IMG["candle"],
     "desc": "Fig leaf and dark rum in a hand-poured wax that burns honest — no tunneling, sixty hours, a vessel worth keeping after.",
     "materials": "Coconut-soy wax, cotton wick, ceramic vessel", "sku": "MN-HOM-0033"},
    {"id": "p13", "cat": "home", "name": "Lacca Valet Tray", "price": 175, "was": None, "rating": 4.6, "reviews": 52, "stock": 18, "isNew": False,
     "colors": ["#3D1011", "#0F0D0E"], "img": IMG["tray"], "img2": IMG["tray"],
     "desc": "Lacquered walnut with a felt-lined recess for the things you empty from your pockets at the end of the day.",
     "materials": "Lacquered walnut, wool felt", "sku": "MN-HOM-0055"},
]

REVIEWS = {
    "p01": [
        {"name": "Daniela R.", "rating": 5, "text": "The leather has already softened beautifully after six weeks of daily carry, and the brass hardware hasn't dulled at all. Worth every bit of the wait list."},
        {"name": "Marcus T.", "rating": 5, "text": "Bigger than it looks in photos — fits a 15-inch laptop with room left for a folio. The strap drop is perfect for shoulder carry."},
        {"name": "Yuki S.", "rating": 4, "text": "Gorgeous bag. Only note is the interior pocket zipper feels slightly stiff out of the box; it's loosened with use."},
    ],
    "p06": [
        {"name": "Owen P.", "rating": 5, "text": "The chronograph pushers have a satisfying mechanical click you don't get on most watches at this price. Wears thinner than the 40mm spec suggests."},
        {"name": "Felicity A.", "rating": 5, "text": "Bought this for my husband's fortieth. The box and presentation alone made it feel like a much larger purchase than it was."},
    ],
}

PROMO_CODES = [
    {"code": "ATELIER10", "description": "10% off", "discount_percent": 10, "status": "active", "uses": 284},
    {"code": "WELCOME15", "description": "15% off first order", "discount_percent": 15, "status": "active", "uses": 1042},
    {"code": "SUMMER25", "description": "$25 off $200+", "discount_percent": 12.5, "status": "expired", "uses": 96},
]


def _review_user(db, name: str) -> User:
    first, last = (name.replace(".", "").split(" ", 1) + [""])[:2]
    email = f"{first.lower()}.{last.lower() or 'reviewer'}@example.com".replace(" ", "")
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(email=email, hashed_password=hash_password("placeholder123"), first_name=first, last_name=last or "Reviewer")
    db.add(user)
    db.flush()
    return user


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Category).first():
            print("Database already seeded — skipping.")
            return

        for cat in CATEGORIES:
            db.add(Category(**cat))

        for p in PRODUCTS:
            db.add(
                Product(
                    id=p["id"],
                    sku=p["sku"],
                    name=p["name"],
                    category_id=p["cat"],
                    price=p["price"],
                    was_price=p["was"],
                    description=p["desc"],
                    materials=p["materials"],
                    rating=p["rating"],
                    reviews_count=p["reviews"],
                    stock=p["stock"],
                    is_new=p["isNew"],
                    colors=p["colors"],
                    img=p["img"],
                    img2=p["img2"],
                )
            )

        db.flush()

        for product_id, reviews in REVIEWS.items():
            for r in reviews:
                reviewer = _review_user(db, r["name"])
                db.add(Review(product_id=product_id, user_id=reviewer.id, rating=r["rating"], text=r["text"]))

        for promo in PROMO_CODES:
            db.add(PromoCode(**promo))

        if not db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first():
            db.add(
                User(
                    email=settings.ADMIN_EMAIL.lower(),
                    hashed_password=hash_password(settings.ADMIN_PASSWORD),
                    first_name="Admin",
                    last_name="User",
                    is_admin=True,
                )
            )

        if not db.query(User).filter(User.email == "sofia.marin@example.com").first():
            db.add(
                User(
                    email="sofia.marin@example.com",
                    hashed_password=hash_password("atelier2026"),
                    first_name="Sofia",
                    last_name="Marin",
                )
            )

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
