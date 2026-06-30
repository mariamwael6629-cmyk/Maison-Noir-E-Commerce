# Maison Noir

A luxury e-commerce storefront featuring a vanilla JS single-page application (SPA) frontend backed by a robust FastAPI and SQLAlchemy REST API.

---

## 🏗️ Project Structure

```text
├── backend/    # FastAPI app (Auth, Products, Orders, Reviews, Wishlist, Promo Codes, Admin)
└── frontend/   # Static SPA (HTML/CSS/Vanilla JS) that consumes the backend API

```

---

## ⚡ Backend Setup

Follow these steps to get the REST API up and running:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Adjust environment variables if needed
python -m app.seed              # Creates the SQLite DB and seeds demo data
uvicorn app.main:app --reload   # Runs server at [http://127.0.0.1:8000](http://127.0.0.1:8000)

```

> 💡 **API Documentation:** Interactive Swagger UI docs are automatically available at `http://127.0.0.1:8000/docs` once the server is running.

### 👥 Demo Accounts

| Email | Password | Role |
| --- | --- | --- |
| `sofia.marin@example.com` | `atelier2026` | Customer |
| `admin@maisonnoir.com` | `admin123` | Admin |

### 🏷️ Demo Promo Codes

* `ATELIER10` — 10% off (Active)
* `WELCOME15` — 15% off (Active)
* `SUMMER25` — Expired

---

## 🎨 Frontend Setup

The frontend is fully static and simply needs to be served. It communicates with the API using the URL configured in `frontend/js/config.js`.

```bash
cd frontend
python -m http.server 5500      # Runs server at [http://127.0.0.1:5500](http://127.0.0.1:5500)

```

> ⚠️ **Important:** Ensure that the backend's `CORS_ORIGINS` variable in `backend/.env` includes the exact origin/URL you are serving the frontend from (e.g., `http://127.0.0.1:5500`).

---

## 📌 Notes & Known Limitations

* **Shopping Cart:** Client-side only, managed entirely via `localStorage` (no dedicated backend cart endpoints).
* **Admin Actions:** Product/promo creation and order-status updates are read-only in the API. The admin UI will display a "not available" message for these actions.
* **User Profile:** Address-book management and profile updates are not currently persisted by the backend.
* **Analytics Panel:** The admin analytics dashboard is illustrative and utilizes mock data; engagement metrics are not tracked server-side.

```

```