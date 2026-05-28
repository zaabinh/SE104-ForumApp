# Deploy Guide (Staging/Production)

## 1) Environment Variables

Backend:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `CORS_ALLOWED_ORIGINS`
- `FRONTEND_URL`

Frontend:

- `NEXT_PUBLIC_API_URL`

## 2) Docker Compose

Use root `docker-compose.yml`:

```bash
docker compose up -d --build
```

Services:

- `db` (SQL Server 2022)
- `backend` (FastAPI, port `8000`)
- `frontend` (Next.js, port `3000`)

## 3) Health Checks

- Backend health endpoint: `GET /health`
- Compose service healthchecks are configured for DB and backend.

## 4) Existing Database Upgrade

If you already have data, run:

- `backend/db/init/02_upgrade_moderation_and_profile.sql`

This adds:

- User personalization fields
- Post moderation status hardening
- Admin audit log table

## 5) CI/CD

GitHub Actions workflow:

- `.github/workflows/ci.yml`

Pipelines:

- Backend: install deps + run `pytest`
- Frontend: `npm ci` + `npm run lint` + `npm run build`
