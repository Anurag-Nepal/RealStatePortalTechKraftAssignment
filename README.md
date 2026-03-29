# RealStatePortal – Real Estate Buyer Portal

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Example User Flows](#example-user-flows)
- [Authentication & OTP Flow](#authentication--otp-flow)
- [Backend API Overview](#backend-api-overview)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

RealStatePortal is a full-stack real estate buyer portal where:

- **Buyers** can register, verify their email with OTP, browse and favourite properties, and schedule property viewings.
- **Admins** can manage all properties (CRUD) and handle all viewing requests, including confirming them and sending confirmation emails.

**Tech stack:**

- **Backend**: Django 4.2, Django REST Framework, PostgreSQL, Redis
- **Frontend**: React 18, Vite, Material UI
- **Auth**: JWT in HTTP-only cookies + email OTP verification
- **Dev Orchestration**: Docker + docker compose

---

## Architecture

### Development

```text
Browser (localhost)
   │
   │  http://localhost:5173
   ▼
┌─────────────────────────┐        ┌─────────────────────────┐
│  Vite Dev Server        │ /api → │  Django runserver       │
│  (frontend, HMR) :5173  │        │  (backend API) :8000    │
└─────────────┬───────────┘        └─────────┬───────────────┘
              │                               │
              │                       ┌───────▼─────────────┐
              │                       │  PostgreSQL :5432   │
              │                       └─────────────────────┘
              │                       ┌─────────────────────┐
              │                       │  Redis :6379        │
              │                       └─────────────────────┘
```

- React/Vite on **5173** with HMR.
- Django on **8000**.
- Vite dev proxy forwards `/api/*` → Django, no Nginx in dev.

### Production (recommended)

Conceptually (not included in dev compose, but easy to add):

```text
Internet
   │  HTTPS :443
   ▼
┌─────────────────────────┐
│        Nginx            │
│  /        → React build │
│  /api/    → Gunicorn    │
└───────────┬─────────────┘
            │
   ┌────────▼────────┐
   │  Gunicorn+DRF   │
   └────────┬────────┘
            │
   ┌────────▼────────┐     ┌──────────────┐
   │  PostgreSQL     │     │   Redis      │
   └─────────────────┘     └──────────────┘
```

---

## Features

### Buyer

- Register, verify email via OTP, login/logout.
- Dashboard with saved/seen property stats.
- Browse/filter properties with pagination.
- Favourite/unfavourite properties.
- Schedule viewings and see own requests.

### Admin

- Admin-only login and routes.
- `/admin/properties`: list, create, edit, delete properties.
- `/admin/viewings`: list all viewing requests, filter by status.
- Confirm pending requests; confirmation email is sent to buyer.

---

## Prerequisites

- Docker Desktop 4.20+ / Docker Engine 24+
- Docker Compose V2 (`docker compose`)
- Git
- 4 GB RAM minimum (6 GB recommended)

Optional (for running without Docker): Python 3.11, Node 20+, PostgreSQL, Redis.

---

## Quick Start

From the project root:

1. Copy env files and configure:

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   # edit both to set DB, Redis, and SMTP values
   ```

2. Start dev stack:

   ```bash
   docker compose up --build
   ```

3. Seed data (if not auto-seeded):

   ```bash
   docker compose exec backend python manage.py seed_data --skip-if-exists
   ```

4. Open the app:

   - Frontend: http://localhost:5173
   - Backend:  http://localhost:8000/api/

5. Test logins:

   - Admin: `admin@portal.com` / `Admin1234!`
   - Buyer: `buyer@portal.com` / `Buyer1234!`

---

## Environment Variables

Defined in `.env` (root) and `backend/.env`.

Key variables:

| Variable                     | Description                                     | Default                     |
|------------------------------|-------------------------------------------------|-----------------------------|
| `DJANGO_SETTINGS_MODULE`     | Django settings module                         | `config.settings.development` |
| `SECRET_KEY`                 | Django secret key                              | dev placeholder             |
| `DEBUG`                      | Django debug flag                              | `1`                         |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Postgres credentials             | `realestate` / `realestate` / `realestatepassword` |
| `DB_HOST` / `DB_PORT`        | DB host/port                                   | `db` / `5432`               |
| `REDIS_HOST` / `REDIS_PORT`  | Redis host/port                                | `redis` / `6379`            |
| `JWT_SECRET_KEY`             | JWT signing key                                | placeholder                 |
| `FRONTEND_URL`               | Frontend URL                                   | `http://localhost:5173`     |
| `RATE_LIMIT_ANON` / `RATE_LIMIT_AUTH` | Rate limits per minute           | `100` / `300`               |
| `EMAIL_BACKEND`              | Django email backend                           | SMTP backend                |
| `EMAIL_HOST` / `EMAIL_PORT`  | SMTP host/port                                 | `smtp.gmail.com` / `587`    |
| `EMAIL_USE_TLS`              | Use TLS (1/0)                                  | `1`                         |
| `EMAIL_HOST_USER`            | SMTP username                                  |                             |
| `EMAIL_HOST_PASSWORD`        | SMTP / app password                            |                             |
| `DEFAULT_FROM_EMAIL`         | From address                                   |                             |
| `VIEWING_REQUEST_ADMIN_EMAIL`| Admin notification email for viewings          |                             |

For Gmail, use a 2FA **App Password** for `EMAIL_HOST_PASSWORD`.

---

## Development Workflow

Run everything (dev, hot reload):

```bash
docker compose up --build
```

Backend commands:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data --skip-if-exists
docker compose exec backend python manage.py test
```

Frontend (outside Docker, optional):

```bash
cd frontend
npm install
npm run dev
```

---

## Example User Flows

### Buyer registration + OTP

1. Go to `/register`.
2. Submit form → OTP emailed.
3. Enter OTP on verify screen → user activated and logged in.

### Buyer favourites & viewings

1. Login as buyer → `/dashboard`.
2. Browse `/properties`, favourite some listings.
3. Visit `/favourites` to see saved items.
4. Schedule viewing requests from property flows; view them in `My Viewings`.

### Admin property + viewing management

1. Login as admin → redirected to `/admin/properties`.
2. Add/edit/delete properties.
3. Go to `/admin/viewings`:
   - Filter by `Pending`.
   - Click **Confirm** for a request.
   - Status becomes `confirmed`, buyer receives confirmation email.

---

## Authentication & OTP Flow

- `POST /api/auth/register/` → creates inactive user + OTP, sends email.
- `POST /api/auth/verify-otp/` → verifies OTP, activates user, issues JWT cookies.
- `POST /api/auth/login/` → sets `access_token` & `refresh_token` cookies.
- `POST /api/auth/refresh/` → rotates tokens.
- `POST /api/auth/logout/` → blacklists refresh JTI and clears cookies.

---

## Backend API Overview (high-level)

All endpoints live under `/api/`.

- **Auth**: `/auth/register/`, `/auth/verify-otp/`, `/auth/login/`, `/auth/logout/`, `/auth/refresh/`, `/auth/me/`.
- **Properties**: `/properties/` (list/create), `/properties/{id}/` (retrieve/update/delete).
- **Favourites**: `/favourites/` (list/create), `/favourites/{id}/` (delete).
- **Viewing Requests**:
  - `GET /viewings/` – buyer: own; admin: all (supports `status` & `property_id`).
  - `POST /viewings/` – create viewing request.
  - `POST /viewings/{id}/confirm/` – admin-only confirm + send email.

---

## Project Structure

```text
RealStatePortal/
  docker-compose.yml
  .env.example
  .env

  backend/
    manage.py
    Dockerfile
    .env.example
    .env
    config/
      settings/base.py, development.py
      urls.py, wsgi.py
    accounts/
      models.py, serializers.py, views.py, urls.py,
      authentication.py, utils.py, permissions.py
    properties/
      models.py, serializers.py, views.py, urls.py,
      filters.py, permissions.py,
      management/commands/seed_data.py
    middleware/rate_limit.py
    utils/email_backend.py, redis_client.py, responses.py

  frontend/
    Dockerfile
    package.json
    vite.config.js
    index.html
    src/
      main.jsx, App.jsx
      context/AuthContext.jsx
      components/layout/Navbar.jsx, PrivateRoute.jsx, AdminRoute.jsx
      components/common/Loader.jsx, ErrorBoundary.jsx, EmptyState.jsx, Pagination.jsx
      components/properties/*, components/favourites/*
      pages/* including admin/AdminProperties.jsx, admin/AdminViewings.jsx
      services/api.js, authService.js, propertyService.js, favouriteService.js, viewingService.js
      utils/formatters.js, viewingFormatters.js
      styles/theme.js
```

---

## Troubleshooting

- **DB errors** (`relation ... does not exist`): run `docker compose exec realstateportal-backend-1 python manage.py migrate`.
- **Admin cannot access `/admin/...`**: ensure user has `role='admin'` and is created by seed or `createsuperuser`.

---

## License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for full license text.
