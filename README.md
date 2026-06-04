# Đồ án SE104 - UITConnect

Giảng viên: Đỗ Văn Tiến

## Sinh Viên Thực Hiện

| Họ và tên | MSSV | Phân công |
| --- | --- | --- |
| Đoàn Hữu Gia Bình | 24520192 | Thiết kế frontend (giao diện) cho trang web; Nghiên cứu và Thiết kế Phân hệ Tương tác cốt lõi (CRUD bài viết, Like, Share, Comment, Bookmark, Report, Follow); Triển khai hệ thống (Deployment). |
| Nguyễn Thái Bảo | 24520173 | Nghiên cứu và Thiết kế Phân hệ Quản trị & Xác thực (Auth, Phân quyền, Profile); Phát triển Dashboard Admin và Phân tích thống kê dữ liệu; viết báo cáo cho cho đồ án |
| Võ Hoài Chiều | 24520220 | Thiết kế cơ sở dữ liệu; Nghiên cứu và Xây dựng Phân hệ Lọc & Tìm kiếm ; Phát triển thuật toán đề xuất bài viết (Trending Score, Similar Post, Collaborative Filtering, Profile Recommendation).|

UITConnect là ứng dụng diễn đàn sinh viên full-stack dành cho cộng đồng UIT. Dự án gồm xác thực, bài viết, bình luận lồng nhau, report, kiểm duyệt, notification, gợi ý bài viết, hồ sơ người dùng và cấu hình deploy lên Vercel + Render.

Cập nhật theo mã nguồn hiện tại: 2026-06-04.

## Công nghệ

- Frontend: Next.js 15.5.19, React 19.0.4, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy 2.0, Uvicorn
- Database: Microsoft SQL Server qua `pyodbc`
- SQL driver: ODBC Driver 18 for SQL Server
- Xác thực: JWT access/refresh token, Google OAuth tùy chọn
- Deploy: Vercel cho frontend, Render Docker backend, Azure SQL hoặc SQL Server bên ngoài

## Cấu trúc Repository

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

## Trạng thái tính năng

Đã có:

- Đăng ký và đăng nhập local
- JWT refresh/logout
- Google OAuth callback tùy chọn
- Luồng hoàn thiện hồ sơ
- Feed, tìm kiếm, tag, sắp xếp và phân trang
- Tạo, sửa, xóa, like, bookmark, share và report bài viết
- Bình luận lồng nhau và report bình luận
- Hồ sơ người dùng hiện tại/công khai
- Follow/unfollow
- Notification cho kiểm duyệt, like, comment, reply, report, follow và trạng thái tài khoản
- Admin quản lý user, xử lý report, duyệt/từ chối bài, tag và analytics
- Gợi ý bài viết theo trending, tương tự, collaborative và profile

Giới hạn hiện tại:

- Xác minh email đang tạm tắt.
- Gửi email thật chưa hoàn thiện; backend đang in email ra log.
- Notification chưa realtime.
- Upload trên Render dùng filesystem tạm nếu chưa chuyển sang storage ngoài.
- `/settings` vẫn là giao diện placeholder.

## Biến môi trường

### Backend

Tạo `backend/.env` từ `backend/.env.example`.

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

Ví dụ Azure SQL / Render:

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER.database.windows.net:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
```

Nếu password DB có ký tự đặc biệt thì cần URL-encode, ví dụ `!` -> `%21`, `@` -> `%40`, `#` -> `%23`.

### Frontend

Tạo `frontend/.env.local` từ `frontend/.env.example`.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Chạy local không dùng Docker

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python setup_local_db.py --wait 90
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Tài liệu API:

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

## Chạy bằng Docker Compose

Tại root repo:

```powershell
docker compose up -d --build
```

Các service:

- SQL Server: `localhost:1433`
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## Deploy

### Frontend trên Vercel

Cấu hình Vercel Project Settings:

- Root Directory: `frontend`
- Framework Preset: Next.js
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: để trống

Biến môi trường:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Backend trên Render

Dùng Blueprint `render.yaml` ở root repo, hoặc tạo Docker Web Service thủ công:

- Dockerfile Path: `backend/Dockerfile`
- Docker Context: `backend`
- Health Check Path: `/health`

Biến môi trường trên Render:

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

Nếu database mới chưa có bảng, đặt `RUN_DB_SETUP_ON_START=true` cho lần deploy đầu, sau đó đổi lại `false`.

## Route chính

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

Xem `PROJECT_SUMMARY_vi.md` để có danh sách endpoint đầy đủ.

## Kiểm tra

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


