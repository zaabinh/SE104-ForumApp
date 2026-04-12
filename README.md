# UITConnect - SE104 Project

Last updated: 2026-04-12

## Overview

UITConnect is a full-stack student forum application for UIT.

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy 2, JWT authentication
- Database: Microsoft SQL Server via `pyodbc`

The repository currently contains a working backend API and a frontend that is already connected to the live authentication and forum APIs for the main user flows.

## Current Status

Implemented in the current codebase:

- Authentication:
  - register
  - login with email or username
  - refresh token flow
  - logout
  - email verification
  - resend verification
  - forgot password
  - reset password
  - Google OAuth login
  - complete profile flow
- Forum:
  - create, edit, delete, and view posts
  - feed endpoint with search, tag, mode, sort, and pagination
  - likes, bookmarks, shares, and reports
  - nested comments and comment reporting for authenticated users
  - tags
- User features:
  - current user profile
  - edit own profile
  - public profile by username
  - user posts, comments, bookmarks
  - follow and unfollow users
  - notifications list and mark-as-read
- Admin backend:
  - user list
  - ban and unban users
  - reports moderation
  - tag management

Frontend pages already present:

- landing page
- login and register
- verify email
- forgot password and reset password
- Google auth callback
- complete profile
- feed
- create post and edit post
- post detail
- profile and profile edit

Still incomplete or mostly UI-only:

- `/dashboard` is a visual wireframe, not a fully connected admin console
- `/settings` is present but still placeholder content
- development email sending is currently a console-print placeholder in the backend

## Repository Structure

```text
backend/
  main.py
  database.py
  init_db.py
  seed_admin.py
  requirements.txt
  routers/
  models/
  schemas/
  services/
  dependencies/
  utils/

frontend/
  app/
  components/
  lib/
  public/
  package.json
  next.config.ts

Database/
  StudentForum.sql

docs/
  report/
```

## Requirements

### Backend

- Python 3.12 recommended
- Microsoft SQL Server
- ODBC Driver 17 for SQL Server or compatible Windows driver

### Frontend

- Node.js 18+
- npm 9+

## Environment Setup

### Backend

Copy [backend/.env.example](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/backend/.env.example) to `backend/.env`.

```env
DATABASE_URL=mssql+pyodbc://@localhost\\SQLEXPRESS/StudentForum?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&Encrypt=no&TrustServerCertificate=yes
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://127.0.0.1:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

Notes:

- `FRONTEND_URL` is used when building verification and password reset links.
- Google OAuth is optional. Leave the Google variables empty if you do not need it.

### Frontend

Copy [frontend/.env.example](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/frontend/.env.example) to `frontend/.env.local`.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Run Locally

### 1. Start the backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

Optional utilities:

```powershell
python test_db.py
python seed_admin.py
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

## Main Routes

### Frontend

- `/`
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/complete-profile`
- `/feed`
- `/create`
- `/edit/[id]`
- `/post/[id]`
- `/profile/[id]`
- `/profile/edit`
- `/dashboard`
- `/settings`

### Backend

Auth:

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

Forum:

- `GET /api/posts/feed`
- `POST /api/posts/`
- `GET /api/posts/{post_id}`
- `PUT /api/posts/{post_id}`
- `DELETE /api/posts/{post_id}`
- `POST /api/posts/{post_id}/like`
- `POST /api/posts/{post_id}/bookmark`
- `POST /api/posts/{post_id}/share`
- `POST /api/posts/{post_id}/report`
- `GET /api/posts/tags`
- `POST /api/posts/{post_id}/comments/`
- `GET /api/posts/{post_id}/comments/`
- `POST /api/posts/{post_id}/comments/{comment_id}/report`

Users and social:

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

Admin:

- `GET /api/admin/users`
- `POST /api/admin/users/{user_id}/ban`
- `POST /api/admin/users/{user_id}/unban`
- `GET /api/admin/reports`
- `POST /api/admin/reports/{report_id}/moderate`
- `GET /api/admin/tags`
- `POST /api/admin/tags`
- `PUT /api/admin/tags/{tag_id}`
- `DELETE /api/admin/tags/{tag_id}`

Most `/api/posts`, comment, notification, follow, and admin endpoints require an authenticated user. Post and comment interactions also require the account to be verified.

## Notes

- The backend creates tables on startup through SQLAlchemy metadata.
- The frontend uses an Axios interceptor in [frontend/lib/axios.ts](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/frontend/lib/axios.ts) to attach the access token and refresh it automatically on `401`.
- Verification and password reset emails are currently printed to the backend console during development.
- Some older docs in the repository still describe earlier backend layouts or database assumptions. Use `README.md`, Swagger, and the current source as the authoritative reference.

## Related Docs

- [README-vi.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/README-vi.md)
- [AUTHENTICATION.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/AUTHENTICATION.md)
- [AUTHENTICATION_vi.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/AUTHENTICATION_vi.md)
- [API_ENDPOINTS.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/API_ENDPOINTS.md)
- [backend/API_DOCUMENTATION.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/backend/API_DOCUMENTATION.md)
- [backend/BACKEND_SETUP.md](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/backend/BACKEND_SETUP.md)
