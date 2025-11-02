# Convoy Backend API

Backend REST API powering Convoy signups, team applications, and admin insights. The server is built with Express and persists data in a local SQLite database (`data/convoy.sqlite`) so it can be deployed without any external services.

## Base URL

- Local development: `http://localhost:4000`
- Production: replace with your deployed host. All paths below are relative to the base URL.

## Authentication

- Public endpoints: `GET /api/health`, `POST /api/newsletter`, `POST /api/applications`, and `GET /api/stats/summary`.
- Admin endpoints require an `x-admin-key` header whose value must match `ADMIN_API_KEY`.

## Environment Variables

| Name            | Description                                      | Default            |
|-----------------|--------------------------------------------------|--------------------|
| `PORT`          | Port the Express server listens on               | `4000`             |
| `ADMIN_API_KEY` | Shared secret for protected endpoints            | `dev-admin-key`    |
| `DATABASE_FILE` | Absolute or relative path to the SQLite database | `./data/convoy.sqlite` |

Copy `.env.example` into `.env` and customize for production.

## Database Schema

### `subscribers`

| Column         | Type    | Notes                                    |
|----------------|---------|------------------------------------------|
| `id`           | TEXT PK | UUID                                     |
| `email`        | TEXT    | Unique, lower-cased                      |
| `name`         | TEXT    | Optional                                 |
| `source`       | TEXT    | Signup attribution                       |
| `is_confirmed` | INTEGER | `0` or `1`; reserved for double opt-in   |
| `created_at`   | TEXT    | ISO timestamp                            |
| `confirmed_at` | TEXT    | ISO timestamp when confirmed             |

### `applications`

| Column          | Type    | Notes                                                    |
|-----------------|---------|----------------------------------------------------------|
| `id`            | TEXT PK | UUID                                                     |
| `name`          | TEXT    | Applicant name                                           |
| `email`         | TEXT    | Applicant email                                          |
| `role_interest` | TEXT    | Focus area (design, infra, etc.)                         |
| `experience`    | TEXT    | Optional experience summary                              |
| `portfolio_url` | TEXT    | Optional URL                                             |
| `message`       | TEXT    | Motivation statement                                     |
| `status`        | TEXT    | `new`, `reviewing`, `accepted`, or `rejected`            |
| `created_at`    | TEXT    | ISO timestamp                                            |

## Endpoints

### `GET /api/health`

Health check used by uptime monitors.

**Response 200**

```json
{
  "data": {
    "status": "ok",
    "environment": "development",
    "timestamp": "2025-11-02T22:05:19.108Z"
  }
}
```

### `POST /api/newsletter`

Create a new mailing list subscription. Rate limited to 5 requests per minute per IP.

**Request Body**

```json
{
  "email": "driver@example.com",
  "name": "Avery Lane",
  "source": "homepage-hero"
}
```

`name` and `source` are optional; `source` defaults to `website`.

**Response 201**

```json
{
  "data": {
    "subscriber": {
      "id": "5c531bf0-8efe-4c16-9d40-93b7b64ac115",
      "email": "driver@example.com",
      "name": "Avery Lane",
      "source": "homepage-hero",
      "isConfirmed": 0,
      "createdAt": "2025-11-02T22:05:19.108Z",
      "confirmedAt": null
    },
    "message": "Thanks for subscribing. You are on the list!"
  }
}
```

**Errors**

- `400 invalid_payload` – validation failed.
- `409 duplicate_subscriber` – email already exists.
- `429 too_many_requests` – rate limit exceeded.

### `GET /api/newsletter/stats` (admin)

Returns aggregate mailing list metrics. Requires `x-admin-key`.

**Response 200**

```json
{
  "data": {
    "total": 128,
    "confirmed": 64,
    "last24Hours": 7
  }
}
```

### `GET /api/newsletter` (admin)

Paginated subscriber list (default `page=1`, `limit=25`). Requires `x-admin-key`.

**Query Parameters**

- `page` – optional, minimum 1
- `limit` – optional, 1–100

**Response 200**

```json
{
  "data": {
    "page": 1,
    "limit": 25,
    "count": 25,
    "subscribers": [
      {
        "id": "5c531bf0-8efe-4c16-9d40-93b7b64ac115",
        "email": "driver@example.com",
        "name": "Avery Lane",
        "source": "homepage-hero",
        "isConfirmed": 0,
        "createdAt": "2025-11-02T22:05:19.108Z",
        "confirmedAt": null
      }
    ]
  }
}
```

### `POST /api/applications`

Submit a team application. Rate limited to 5 requests per minute per IP.

**Request Body**

```json
{
  "name": "Kai Harper",
  "email": "kai@convoy.app",
  "roleInterest": "Frontend Engineer",
  "experience": "5 years building mobility apps.",
  "portfolioUrl": "https://kai.dev",
  "message": "I want to lead the in-car experience."
}
```

**Response 201**

```json
{
  "data": {
    "application": {
      "id": "6dcdfb44-7163-4d20-9770-5d58e57dc85f",
      "name": "Kai Harper",
      "email": "kai@convoy.app",
      "role_interest": "Frontend Engineer",
      "experience": "5 years building mobility apps.",
      "portfolio_url": "https://kai.dev",
      "message": "I want to lead the in-car experience.",
      "status": "new",
      "created_at": "2025-11-02T22:05:19.108Z"
    },
    "message": "Application received. We will be in touch soon."
  }
}
```

**Errors**

- `400 invalid_payload` – validation failed.
- `429 too_many_requests` – rate limit exceeded.

### `GET /api/applications/stats` (admin)

Aggregated application metrics. Requires `x-admin-key`.

**Response 200**

```json
{
  "data": {
    "total": 18,
    "byStatus": [
      { "status": "new", "count": 12 },
      { "status": "reviewing", "count": 4 },
      { "status": "accepted", "count": 2 }
    ],
    "byRoleInterest": [
      { "roleInterest": "Backend Engineer", "count": 6 },
      { "roleInterest": "Product Design", "count": 5 }
    ],
    "last24Hours": 3
  }
}
```

### `GET /api/applications` (admin)

Paginated application list with optional `status` filter. Requires `x-admin-key`.

**Query Parameters**

- `page` – optional, minimum 1
- `limit` – optional, 1–100
- `status` – optional, one of `new`, `reviewing`, `accepted`, `rejected`

**Response 200**

```json
{
  "data": {
    "page": 1,
    "limit": 25,
    "count": 10,
    "applications": [
      {
        "id": "6dcdfb44-7163-4d20-9770-5d58e57dc85f",
        "name": "Kai Harper",
        "email": "kai@convoy.app",
        "roleInterest": "Frontend Engineer",
        "experience": "5 years building mobility apps.",
        "portfolioUrl": "https://kai.dev",
        "message": "I want to lead the in-car experience.",
        "status": "new",
        "createdAt": "2025-11-02T22:05:19.108Z"
      }
    ]
  }
}
```

### `GET /api/stats/summary`

Public aggregate counts used by the marketing site.

**Response 200**

```json
{
  "data": {
    "newsletter": {
      "total": 128,
      "last24Hours": 7
    },
    "applications": {
      "total": 18,
      "last24Hours": 3
    },
    "generatedAt": "2025-11-02T22:05:19.108Z"
  }
}
```

## Local Development

1. `cd backend`
2. `npm install`
3. `cp .env.example .env` and adjust secrets if needed.
4. `npm start`

The server automatically creates and migrates `data/convoy.sqlite` on startup.

## Deployment Notes

- The SQLite file lives in `backend/data`. Persist this directory (e.g., mount volume or use platform-provided persistent storage).
- Provide production values for `ADMIN_API_KEY` and `DATABASE_FILE`.
- Make sure the hosting provider allows long-lived files (for Netlify Functions or Vercel, use a hosted VM/container option such as Netlify Background Functions or Render).
- Back up `data/convoy.sqlite` regularly.

## Smoke Testing

Run the following from the repository root (with the server running):

```bash
curl -X POST http://localhost:4000/api/newsletter ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"driver@example.com\",\"name\":\"Avery\"}"

curl -X GET http://localhost:4000/api/stats/summary

curl -X GET http://localhost:4000/api/newsletter/stats ^
  -H "x-admin-key: <ADMIN_API_KEY>"
```

These requests cover the happy path for subscriptions, public stats, and protected admin metrics.
