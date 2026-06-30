from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import admin, auth, categories, orders, products, promo, reviews, wishlist
from app.core.config import settings
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API powering the Maison Noir storefront: products, auth, orders, wishlist, reviews and admin operations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(reviews.router)
app.include_router(orders.router)
app.include_router(wishlist.router)
app.include_router(admin.router)
app.include_router(promo.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}
