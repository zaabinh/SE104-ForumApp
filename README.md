# SE104 Forum App

Last progress update: 2026-04-05

## Overview

SE104 Forum App is a full-stack student forum system for UIT with:

- A Next.js 15 frontend
- A FastAPI backend
- SQL Server via SQLAlchemy + `pyodbc`
- JWT-based authentication with access and refresh tokens
- Forum features for posts, comments, bookmarks, profiles, and follows

The repository now contains both the frontend and backend in active development.

## Current Progress

As of 2026-04-05, the project includes:

- Backend API with:
  - User registration
  - User login
  - Refresh token flow
  - Logout
  - Current user endpoint
  - Profile, bookmarks, comments, and follow APIs
- Frontend with:
  - Split landing page with built-in sign in / register panel
  - Login and register flows connected to backend authentication
  - Protected authenticated pages
  - Main feed with search, filter, sort, infinite scroll UI, and smoother sidebar/rightbar behavior
  - Create post, edit post, post detail, profile, settings, and dashboard pages
  - UIT logo integrated in the topbar and browser tab metadata
- Performance improvements:
  - Deferred local storage persistence in the mock forum state
  - Memoized tag rendering and layout surfaces
  - Rightbar-specific scrollbar and smoother scrolling behavior

## Repository Structure

```text
backend/
  database.py
  init_db.py
  main.py
  requirements.txt
  routes/
  models/
  schemas/
  dependencies/
  utils/

frontend/
  app/
  components/
  lib/
  public/
  package.json
  next.config.ts
```

## System Requirements

### Backend

- Python 3.12+ recommended
- Microsoft SQL Server
- ODBC Driver 17 for SQL Server or compatible installed on Windows

### Frontend

- Node.js 18+ recommended
- npm 9+ recommended

## Environment Configuration

### Backend environment

Copy `backend/.env.example` to `backend/.env` and update values if needed:

```env
DATABASE_URL=mssql+pyodbc://@localhost\\SQLEXPRESS/StudentForum?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&Encrypt=no&TrustServerCertificate=yes
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend environment

Copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## How To Run The System

### 1. Start the backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Initialize database tables:

```powershell
python init_db.py
```

Optional database connectivity check:

```powershell
python test_db.py
```

Run the API server:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend base URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

### 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:3000
```

## Startup Order

Use this order when running locally:

1. Start SQL Server
2. Start the FastAPI backend on port `8000`
3. Start the Next.js frontend on port `3000`
4. Open the landing page and authenticate from there

## Core Routes

### Frontend routes

- `/` - landing page with login/register panel
- `/login` - login page
- `/register` - register page
- `/feed` - main feed
- `/create` - create post
- `/post/[id]` - post detail
- `/profile/[id]` - user profile
- `/profile/current-user` - current user redirect
- `/settings` - settings
- `/dashboard` - dashboard

### Backend auth routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/users/{user_id}`

## Authentication Summary

The backend uses JWT authentication with two token types:

- Access token:
  - short-lived
  - sent as `Authorization: Bearer <token>`
  - used for protected API access
- Refresh token:
  - stored in the `auth_sessions` table
  - used to obtain a new access token
  - invalidated on logout

The frontend stores:

- `access_token`
- `refresh_token`
- `auth_user`

in browser local storage and automatically refreshes expired access tokens through the Axios interceptor in [axios.ts](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/frontend/lib/axios.ts).

For the full authentication document, see [AUTHENTICATION.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/AUTHENTICATION.md).

## Notes

- The backend currently targets SQL Server, not SQLite.
- The frontend still contains some mock forum state for post/feed interactions, while authentication is already connected to the real backend.
- If Next.js cache issues appear, delete `frontend/.next` and restart the frontend dev server.

## Common Commands

### Backend

```powershell
cd backend
.venv\Scripts\activate
uvicorn main:app --reload
```

### Frontend

```powershell
cd frontend
npm run dev
```

## Troubleshooting

### Backend

- If database connection fails:
  - verify SQL Server is running
  - verify `DATABASE_URL`
  - verify ODBC Driver 17 is installed
- If JWT errors occur:
  - verify `JWT_SECRET_KEY`
  - verify frontend and backend are using the same backend instance

### Frontend

- If authentication requests fail:
  - verify `NEXT_PUBLIC_API_URL`
  - verify backend CORS allows `http://127.0.0.1:3000` and `http://localhost:3000`
- If the dev server serves stale output:
  - remove `frontend/.next`
  - restart `npm run dev`

## Author

Software Engineering Project - SE104
