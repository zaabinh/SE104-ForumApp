# UITConnect - Student Forum System

## Project Summary

UITConnect is a full-stack student forum application for UIT communities. The current codebase contains a Next.js frontend, a FastAPI backend, Microsoft SQL Server persistence through `pyodbc`, moderation workflows, recommendation features, and deployment configuration for Vercel + Render.

Last synchronized with source code: 2026-06-04.

## Current Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15.5.19, React 19.0.4, TypeScript, Tailwind CSS |
| Backend | FastAPI 0.116, SQLAlchemy 2.0, Uvicorn |
| Database | Microsoft SQL Server via `pyodbc` and ODBC Driver 18 |
| Auth | JWT access/refresh tokens, optional Google OAuth |
| Deployment | Vercel for frontend, Render Docker service for backend, Azure SQL or external SQL Server |
| Local orchestration | Docker Compose with SQL Server, backend, frontend |

## Repository Layout

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
  dependencies/
  utils/
  db/init/

frontend/
  app/
  components/
  lib/
  public/
  package.json
  next.config.ts
  vercel.json

docs/
  deploy.md
  report/

docker-compose.yml
render.yaml
README.md
README-vi.md
PROJECT_SUMMARY.md
PROJECT_SUMMARY_vi.md
```

## Backend Overview

The backend is a FastAPI app mounted from `backend/main.py`.

### Runtime Requirements

- Python 3.12 in the Docker image
- SQL Server reachable through `DATABASE_URL`
- ODBC Driver 18 for SQL Server
- Required environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET_KEY`
  - `CORS_ALLOWED_ORIGINS`
  - `FRONTEND_URL`

### Database Connection

The backend uses SQLAlchemy with `mssql+pyodbc`. `backend/database.py` normalizes `DATABASE_URL`, defaults the driver to `ODBC Driver 18 for SQL Server`, and validates that the driver is installed before creating the SQLAlchemy engine.

Recommended Azure SQL / Render format:

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER.database.windows.net:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
```

### Backend Routers

| Router | Prefix | Purpose |
| --- | --- | --- |
| `auth.py` | `/auth` | Register, login, refresh, logout, Google OAuth, profile completion, password reset |
| `user.py` | `/users` | Current profile, public profile, posts, comments, bookmarks, notifications |
| `post.py` | `/api/posts` | Feed, post CRUD, like, bookmark, share, report, discovery, recommendations |
| `comment.py` | `/api/posts/{post_id}/comments` | Nested comments and comment reports |
| `follow.py` | `/follow` | Follow and unfollow users |
| `admin.py` | `/api/admin` | Users, reports, pending posts, moderation, analytics, tags |
| `upload.py` | `/upload` | Image upload endpoint; uploaded files are served from `/uploads` |

### Authentication Status

Email verification is currently disabled. New local and Google users are treated as verified so they can log in without email verification. The legacy `/auth/verify-email` and `/auth/resend-verification` endpoints still exist but return a disabled message.

### Moderation

Student-created posts start as `pending`; admin-created posts are `active`.

Admin moderation supports:

- pending post list
- approve post
- reject post
- report list
- report moderation
- hide reported post
- hide reported comment
- ban reported author
- analytics overview
- tag CRUD
- admin audit logging

### Notifications

Notifications are stored in the `notifications` table and exposed through:

- `GET /users/me/notifications`
- `POST /users/me/notifications/{notification_id}/read`

Implemented events:

- post approved
- post rejected
- post liked
- new comment on post
- reply to comment
- post removed by admin
- post hidden after report review
- comment hidden after report review
- post reported
- comment reported
- report reviewed
- follow
- account banned/restored

Notifications are currently pull-based. There is no WebSocket/SSE realtime channel yet.

## Main Backend Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google/login`
- `GET /auth/google/callback`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/complete-profile`
- `GET /auth/me`

### Forum

- `POST /api/posts/`
- `GET /api/posts/feed`
- `GET /api/posts/tags`
- `GET /api/posts/{post_id}`
- `PUT /api/posts/{post_id}`
- `DELETE /api/posts/{post_id}`
- `POST /api/posts/{post_id}/like`
- `POST /api/posts/{post_id}/bookmark`
- `POST /api/posts/{post_id}/share`
- `POST /api/posts/{post_id}/report`
- `POST /api/posts/{post_id}/comments/`
- `GET /api/posts/{post_id}/comments/`
- `POST /api/posts/{post_id}/comments/{comment_id}/report`

### Discovery and Recommendations

- `GET /api/posts/trending/suggestions`
- `GET /api/posts/trending/tags`
- `GET /api/posts/{post_id}/similar`
- `GET /api/posts/recommendations/collaborative`
- `GET /api/posts/recommendations/profile`
- `GET /api/posts/profile/summary`
- `GET /api/posts/profile/analysis`

### User and Social

- `GET /users/me`
- `PUT /users/me`
- `GET /users/{username}`
- `GET /users/{username}/posts`
- `GET /users/{username}/comments`
- `GET /users/{username}/bookmarks`
- `GET /users/me/notifications`
- `POST /users/me/notifications/{notification_id}/read`
- `POST /follow/{user_id}`
- `DELETE /follow/{user_id}`

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users/{user_id}/ban`
- `POST /api/admin/users/{user_id}/unban`
- `GET /api/admin/reports`
- `POST /api/admin/reports/{report_id}/moderate`
- `GET /api/admin/posts/pending`
- `POST /api/admin/posts/{post_id}/approve`
- `POST /api/admin/posts/{post_id}/reject`
- `GET /api/admin/analytics/overview`
- `GET /api/admin/tags`
- `POST /api/admin/tags`
- `PUT /api/admin/tags/{tag_id}`
- `DELETE /api/admin/tags/{tag_id}`

## Frontend Overview

The frontend is a Next.js App Router application in `frontend/`.

### Frontend Runtime

- Node.js 20 recommended
- `npm ci`
- `npm run build`
- `NEXT_PUBLIC_API_URL` must point to the deployed backend origin

### Frontend Pages

- `/`
- `/login`
- `/register`
- `/auth/callback`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/complete-profile`
- `/feed`
- `/create`
- `/post/create`
- `/edit/[id]`
- `/post/[id]`
- `/post/[id]/share`
- `/profile/current-user`
- `/profile/[id]`
- `/profile/edit`
- `/dashboard`
- `/settings`

### Frontend API Client

`frontend/lib/axios.ts` creates the Axios client from `NEXT_PUBLIC_API_URL`, normalizes the base URL, attaches JWT access tokens, and attempts token refresh on `401` responses.

## Deployment

### Vercel Frontend

Use `frontend` as the Vercel Root Directory.

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

`frontend/vercel.json` sets:

- framework: `nextjs`
- install command: `npm ci`
- build command: `npm run build`

### Render Backend

Use the root `render.yaml` as a Render Blueprint, or create a Docker web service manually:

- Dockerfile Path: `backend/Dockerfile`
- Docker Context: `backend`
- Health Check Path: `/health`

Required environment variables:

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

If the Azure SQL database is new, temporarily set `RUN_DB_SETUP_ON_START=true` for the first deploy, then switch it back to `false`.

### Local Docker Compose

```bash
docker compose up -d --build
```

Services:

- SQL Server 2022 on `1433`
- FastAPI backend on `8000`
- Next.js frontend on `3000`

## Known Limitations

- Email sending still prints to backend console instead of using a real mail provider.
- Email verification is intentionally disabled for now.
- Notifications are stored and listed but are not realtime.
- Render filesystem is ephemeral; uploaded files should move to Cloudinary/S3/Azure Blob for production.
- `/settings` is still placeholder-level UI.

## Validation Commands

Backend:

```bash
python -m py_compile backend/main.py backend/database.py backend/render_start.py
```

Frontend:

```bash
cd frontend
npm audit
npm run build
```

Docker Compose config:

```bash
docker compose -f docker-compose.yml config
```

