# UITConnect - Hệ thống diễn đàn sinh viên

## Tóm tắt dự án

UITConnect là ứng dụng diễn đàn sinh viên full-stack dành cho cộng đồng UIT. Mã nguồn hiện tại gồm frontend Next.js, backend FastAPI, lưu trữ bằng Microsoft SQL Server thông qua `pyodbc`, kiểm duyệt nội dung, gợi ý bài viết, notification và cấu hình deploy lên Vercel + Render.

Cập nhật theo mã nguồn hiện tại: 2026-06-04.

## Công nghệ hiện tại

| Lớp | Công nghệ |
| --- | --- |
| Frontend | Next.js 15.5.19, React 19.0.4, TypeScript, Tailwind CSS |
| Backend | FastAPI 0.116, SQLAlchemy 2.0, Uvicorn |
| Database | Microsoft SQL Server qua `pyodbc` và ODBC Driver 18 |
| Xác thực | JWT access/refresh token, Google OAuth tùy chọn |
| Deploy | Vercel cho frontend, Render Docker service cho backend, Azure SQL hoặc SQL Server bên ngoài |
| Local | Docker Compose gồm SQL Server, backend, frontend |

## Cấu trúc thư mục

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

## Backend

Backend là ứng dụng FastAPI tại `backend/main.py`.

### Yêu cầu runtime

- Python 3.12 trong Docker image
- SQL Server truy cập được qua `DATABASE_URL`
- ODBC Driver 18 for SQL Server
- Các biến môi trường bắt buộc:
  - `DATABASE_URL`
  - `JWT_SECRET_KEY`
  - `CORS_ALLOWED_ORIGINS`
  - `FRONTEND_URL`

### Kết nối cơ sở dữ liệu

Backend dùng SQLAlchemy với `mssql+pyodbc`. File `backend/database.py` chuẩn hóa `DATABASE_URL`, mặc định driver là `ODBC Driver 18 for SQL Server`, và kiểm tra driver đã được cài trước khi tạo engine.

Ví dụ cho Azure SQL / Render:

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER.database.windows.net:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
```

### Router backend

| Router | Prefix | Chức năng |
| --- | --- | --- |
| `auth.py` | `/auth` | Đăng ký, đăng nhập, refresh, logout, Google OAuth, hoàn thiện hồ sơ, đặt lại mật khẩu |
| `user.py` | `/users` | Hồ sơ, bài viết, bình luận, bookmark, notification |
| `post.py` | `/api/posts` | Feed, CRUD bài viết, like, bookmark, share, report, gợi ý |
| `comment.py` | `/api/posts/{post_id}/comments` | Bình luận lồng nhau và report bình luận |
| `follow.py` | `/follow` | Theo dõi và hủy theo dõi |
| `admin.py` | `/api/admin` | Người dùng, report, bài chờ duyệt, kiểm duyệt, analytics, tag |
| `upload.py` | `/upload` | Upload ảnh; file được phục vụ từ `/uploads` |

### Trạng thái xác thực email

Chức năng xác minh email đang được tạm tắt. Người dùng local và Google OAuth mới được xem như đã xác minh để có thể đăng nhập ngay. Hai endpoint cũ `/auth/verify-email` và `/auth/resend-verification` vẫn tồn tại nhưng trả thông báo tạm tắt.

### Kiểm duyệt nội dung

Bài viết của sinh viên mặc định có trạng thái `pending`; bài của admin được duyệt ngay là `active`.

Admin có thể:

- xem danh sách bài chờ duyệt
- duyệt bài
- từ chối bài
- xem danh sách report
- xử lý report
- ẩn bài bị report
- ẩn bình luận bị report
- ban tác giả bị report
- xem analytics tổng quan
- CRUD tag
- ghi audit log

### Notification

Notification được lưu trong bảng `notifications` và lấy qua:

- `GET /users/me/notifications`
- `POST /users/me/notifications/{notification_id}/read`

Các sự kiện đã có notification:

- bài viết được duyệt
- bài viết bị từ chối
- bài viết được like
- có bình luận mới trong bài
- có trả lời bình luận
- bài bị admin xóa
- bài bị ẩn sau khi xử lý report
- bình luận bị ẩn sau khi xử lý report
- bài viết bị report
- bình luận bị report
- report đã được xử lý
- có người theo dõi
- tài khoản bị ban hoặc được mở lại

Notification hiện là dạng pull-based, chưa có WebSocket/SSE realtime.

## Endpoint chính

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

### Diễn đàn

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

### Gợi ý và khám phá

- `GET /api/posts/trending/suggestions`
- `GET /api/posts/trending/tags`
- `GET /api/posts/{post_id}/similar`
- `GET /api/posts/recommendations/collaborative`
- `GET /api/posts/recommendations/profile`
- `GET /api/posts/profile/summary`
- `GET /api/posts/profile/analysis`

### Người dùng và mạng xã hội

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

## Frontend

Frontend là ứng dụng Next.js App Router trong thư mục `frontend/`.

### Runtime frontend

- Khuyến nghị Node.js 20
- Cài dependency bằng `npm ci`
- Build bằng `npm run build`
- `NEXT_PUBLIC_API_URL` phải trỏ tới backend đã deploy

### Trang frontend

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

### API client

`frontend/lib/axios.ts` tạo Axios client từ `NEXT_PUBLIC_API_URL`, chuẩn hóa base URL, gắn JWT access token và tự refresh token khi gặp lỗi `401`.

## Deploy

### Frontend trên Vercel

Set Root Directory là `frontend`.

Biến môi trường:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

`frontend/vercel.json` cấu hình:

- framework: `nextjs`
- install command: `npm ci`
- build command: `npm run build`

### Backend trên Render

Dùng `render.yaml` ở root repo hoặc tạo Docker web service thủ công:

- Dockerfile Path: `backend/Dockerfile`
- Docker Context: `backend`
- Health Check Path: `/health`

Biến môi trường cần có:

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

Nếu Azure SQL mới chưa có bảng, tạm đặt `RUN_DB_SETUP_ON_START=true` cho lần deploy đầu, sau đó đổi lại `false`.

### Docker Compose local

```bash
docker compose up -d --build
```

Các service:

- SQL Server 2022 tại port `1433`
- FastAPI backend tại port `8000`
- Next.js frontend tại port `3000`

## Giới hạn hiện tại

- Gửi email thật chưa hoàn thiện; backend vẫn in email ra console.
- Xác minh email đang tạm tắt.
- Notification chưa realtime.
- File upload trên Render là filesystem tạm; production nên chuyển sang Cloudinary/S3/Azure Blob.
- Trang `/settings` vẫn ở mức placeholder.

## Lệnh kiểm tra

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

Docker Compose:

```bash
docker compose -f docker-compose.yml config
```

