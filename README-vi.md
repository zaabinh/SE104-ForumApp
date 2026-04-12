# UITConnect - Đồ án SE104

Cập nhật lần cuối: 12-04-2026

## Tổng quan

UITConnect là một ứng dụng diễn đàn sinh viên (full-stack) dành riêng cho UIT.

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy 2, JWT authentication
- **Cơ sở dữ liệu:** Microsoft SQL Server thông qua `pyodbc`

Repository hiện tại đã bao gồm Backend API hoạt động ổn định và Frontend đã kết nối với các API xác thực và diễn đàn cho các luồng người dùng chính.

## Trạng thái hiện tại

Các tính năng đã triển khai trong mã nguồn:

- **Xác thực (Authentication):**
  - Đăng ký tài khoản
  - Đăng nhập bằng email hoặc tên người dùng
  - Luồng làm mới token (Refresh token)
  - Đăng xuất
  - Xác minh email
  - Gửi lại mã xác minh
  - Quên mật khẩu & Đặt lại mật khẩu
  - Đăng nhập qua Google OAuth
  - Hoàn thiện hồ sơ (Complete profile flow)
- **Diễn đàn (Forum):**
  - Tạo, sửa, xóa và xem bài viết
  - Bảng tin (Feed) hỗ trợ tìm kiếm, gắn thẻ (tag), chế độ xem, sắp xếp và phân trang
  - Thích (likes), dấu trang (bookmarks), chia sẻ và báo cáo (reports)
  - Bình luận lồng nhau và báo cáo bình luận (cho người dùng đã xác thực)
  - Quản lý thẻ (Tags)
- **Tính năng người dùng:**
  - Hồ sơ cá nhân hiện tại
  - Chỉnh sửa hồ sơ cá nhân
  - Xem hồ sơ công khai qua tên người dùng
  - Danh sách bài viết, bình luận, dấu trang của người dùng
  - Theo dõi và hủy theo dõi người dùng
  - Danh sách thông báo và đánh dấu đã đọc
- **Quản trị viên (Admin backend):**
  - Danh sách người dùng
  - Khóa (ban) và mở khóa người dùng
  - Kiểm duyệt báo cáo
  - Quản lý thẻ

**Các trang Frontend hiện có:**
- Landing page, Đăng nhập & Đăng ký
- Xác minh email
- Quên mật khẩu & Đặt lại mật khẩu
- Google auth callback
- Hoàn thiện hồ sơ
- Bảng tin (Feed)
- Tạo và Chỉnh sửa bài viết
- Chi tiết bài viết
- Hồ sơ cá nhân và Chỉnh sửa hồ sơ

**Các phần chưa hoàn thiện hoặc chủ yếu là giao diện (UI-only):**
- `/dashboard`: Hiện là khung giao diện (wireframe), chưa kết nối hoàn toàn với bảng điều khiển admin.
- `/settings`: Đã có trang nhưng nội dung vẫn là bản nháp (placeholder).
- Việc gửi email thực tế đang được thay thế bằng việc in mã ra console của backend trong môi trường phát triển.

## Cấu trúc Repository

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
  ## Yêu cầu hệ thống
### Backend
- Khuyến nghị **Python 3.12**
- **Microsoft SQL Server**
- **ODBC Driver 17** cho SQL Server hoặc driver tương thích trên Windows

### Frontend
- **Node.js 18+**
- **npm 9+**

## Thiết lập môi trường

### Backend
Sao chép `backend/.env.example` thành `backend/.env`.

```env
DATABASE_URL=mssql+pyodbc://@localhost\\SQLEXPRESS/StudentForum?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&Encrypt=no&TrustServerCertificate=yes
JWT_SECRET_KEY=thay-bang-mot-chuoi-bi-mat-ngau-nhien
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=[http://127.0.0.1:3000](http://127.0.0.1:3000)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=[http://127.0.0.1:8000/auth/google/callback](http://127.0.0.1:8000/auth/google/callback)
```
## Ghi chú

- `FRONTEND_URL` được sử dụng khi tạo link xác thực tài khoản và đặt lại mật khẩu.
- Google OAuth là tùy chọn. Bạn có thể để trống các biến Google nếu không sử dụng.

### Frontend

Sao chép file [frontend/.env.example](/d:/ZB/Code/UIT/NMCNPM/SE104.ForumApp/frontend/.env.example) thành `frontend/.env.local`.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Chạy project trên máy local

### 1. Khởi động backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
## Tài liệu API

- Swagger UI: http://127.0.0.1:8000/docs  
- ReDoc: http://127.0.0.1:8000/redoc  

## Công cụ hỗ trợ (tùy chọn)

```powershell
python test_db.py
python seed_admin.py
```

---

## 2. Khởi động frontend

Mở terminal thứ hai:

```powershell
cd frontend
npm install
npm run dev
```

## Địa chỉ frontend

```
http://127.0.0.1:3000
```

---

## Các route chính

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

---

### Backend

#### Xác thực (Auth)

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

#### Diễn đàn (Forum)

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

#### Người dùng & mạng xã hội

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

#### Admin

- `GET /api/admin/users`
- `POST /api/admin/users/{user_id}/ban`
- `POST /api/admin/users/{user_id}/unban`
- `GET /api/admin/reports`
- `POST /api/admin/reports/{report_id}/moderate`
- `GET /api/admin/tags`
- `POST /api/admin/tags`
- `PUT /api/admin/tags/{tag_id}`
- `DELETE /api/admin/tags/{tag_id}`

---

## Lưu ý

- Hầu hết các endpoint `/api/posts`, comment, notification, follow và admin đều yêu cầu đăng nhập.  
- Các thao tác với bài viết và bình luận yêu cầu tài khoản đã được xác thực.

---

## Ghi chú thêm

- Backend tự tạo bảng khi khởi động thông qua SQLAlchemy metadata.  
- Frontend sử dụng Axios interceptor tại `frontend/lib/axios.ts` để:
  - Gắn access token  
  - Tự động refresh khi gặp lỗi `401`  
- Email xác thực và reset password hiện được in ra console backend (dev).  
- Một số tài liệu cũ có thể không còn chính xác → ưu tiên:
  - `README.md`
  - Swagger
  - Source code hiện tại  

---

## Tài liệu liên quan

- `README-vi.md`
- `AUTHENTICATION.md`
- `AUTHENTICATION_vi.md`
- `API_ENDPOINTS.md`
- `backend/API_DOCUMENTATION.md`
- `backend/BACKEND_SETUP.md`