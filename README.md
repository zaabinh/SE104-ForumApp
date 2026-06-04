# UITConnect - SE104 Forum App

UITConnect is a full-stack student forum for UIT communities. It includes authentication, forum posts, nested comments, reports, moderation, notifications, recommendations, profile pages, and deploy configuration for Vercel + Render.

Last synchronized with source code: 2026-06-04.

## Stack

- Frontend: Next.js 15.5.19, React 19.0.4, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy 2.0, Uvicorn
- Database: Microsoft SQL Server through `pyodbc`
- SQL driver: ODBC Driver 18 for SQL Server
- Auth: JWT access/refresh tokens, optional Google OAuth
- Deployment: Vercel frontend, Render Docker backend, Azure SQL or external SQL Server

## Repository Structure

```text
backend/
  main.py
  database.py
  render_start.py
  Dockerfile
  requirements.txt
  models/
  routers/
  schemas/
  services/

frontend/
  app/
  components/
  lib/
  public/
  package.json
  next.config.ts
  vercel.json

docs/
docker-compose.yml
render.yaml
PROJECT_SUMMARY.md
PROJECT_SUMMARY_vi.md
```

## Current Feature Status

Implemented:

- Local registration and login
- JWT refresh/logout flow
- Optional Google OAuth callback flow
- Complete profile flow
- Feed, search, tags, sorting and pagination
- Create, edit, delete, like, bookmark, share and report posts
- Nested comments and comment reports
- Public/current user profiles
- Follow/unfollow users
- Notifications for moderation, likes, comments, replies, reports, follows and account status
- Admin user management, report moderation, pending post approval/rejection, tags and analytics
- Recommendation endpoints for trending, similar, collaborative and profile-based posts

Known limitations:

- Email verification is temporarily disabled.
- Email sending currently prints to backend logs instead of using a mail provider.
- Notifications are pull-based, not realtime.
- Uploads on Render use ephemeral filesystem unless moved to external storage.
- `/settings` is still placeholder-level UI.

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=yes
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://127.0.0.1:3000
CORS_ALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000
PUBLIC_API_URL=http://127.0.0.1:8000
```

Azure SQL / Render example:

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER.database.windows.net:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
```

URL-encode special characters in database passwords, for example `!` -> `%21`, `@` -> `%40`, `#` -> `%23`.

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Run Locally Without Docker

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python setup_local_db.py --wait 90
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

### Frontend

```powershell
cd frontend
npm ci
npm run dev
```

Frontend URL: `http://127.0.0.1:3000`

## Run With Docker Compose

From the repository root:

```powershell
docker compose up -d --build
```

Services:

- SQL Server: `localhost:1433`
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## Deploy

### Frontend on Vercel

Set Vercel Project Settings:

- Root Directory: `frontend`
- Framework Preset: Next.js
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: leave empty

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Backend on Render

Use the root `render.yaml` Blueprint, or create a Docker Web Service manually:

- Dockerfile Path: `backend/Dockerfile`
- Docker Context: `backend`
- Health Check Path: `/health`

Render environment variables:

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER.database.windows.net:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
PUBLIC_API_URL=https://your-backend.onrender.com
JWT_SECRET_KEY=generate-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
RUN_DB_SETUP_ON_START=false
```

If the database is new, set `RUN_DB_SETUP_ON_START=true` for the first deploy, then switch it back to `false`.

## Main Routes

Frontend:

- `/`
- `/login`
- `/register`
- `/feed`
- `/create`
- `/edit/[id]`
- `/post/[id]`
- `/profile/[id]`
- `/profile/edit`
- `/dashboard`
- `/settings`

Backend:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /api/posts/feed`
- `POST /api/posts/`
- `GET /api/posts/{post_id}`
- `POST /api/posts/{post_id}/comments/`
- `GET /users/me/notifications`
- `GET /api/admin/reports`
- `POST /api/admin/reports/{report_id}/moderate`
- `GET /api/admin/posts/pending`
- `POST /api/admin/posts/{post_id}/approve`

See `PROJECT_SUMMARY.md` for the full endpoint list.

## Validation

Backend:

```powershell
python -m py_compile backend\main.py backend\database.py backend\render_start.py
```

Frontend:

```powershell
cd frontend
npm audit
npm run build
```

Docker Compose:

```powershell
docker compose -f docker-compose.yml config
```

## Related Documents

- `PROJECT_SUMMARY.md`
- `PROJECT_SUMMARY_vi.md`
- `docs/deploy.md`
- `backend/BACKEND_SETUP.md`
- `backend/API_DOCUMENTATION.md`

