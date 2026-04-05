# SE104 Forum App

**Cập nhật tiến độ:** 2026-04-05

## 1. Tổng quan

SE104 Forum App là hệ thống diễn đàn sinh viên dành cho UIT được xây dựng theo mô hình full-stack, bao gồm:

- Frontend sử dụng **Next.js 15**
- Backend sử dụng **FastAPI**
- Cơ sở dữ liệu **Microsoft SQL Server** thông qua **SQLAlchemy + pyodbc**
- Xác thực người dùng bằng **JWT (Access Token + Refresh Token)**
- Các chức năng diễn đàn: bài viết, bình luận, bookmark, hồ sơ cá nhân, theo dõi người dùng

Repository hiện tại bao gồm cả **frontend** và **backend** và đang trong quá trình phát triển.

---

## 2. Tiến độ hiện tại

Tính đến ngày 2026-04-05, hệ thống đã có:

### Backend API
- Đăng ký tài khoản
- Đăng nhập
- Refresh token
- Đăng xuất
- Lấy thông tin người dùng hiện tại
- API cho:
  - Profile
  - Bookmark
  - Comment
  - Follow

### Frontend
- Landing page có tích hợp form **Đăng nhập / Đăng ký**
- Luồng đăng nhập và đăng ký đã kết nối với backend
- Các trang yêu cầu đăng nhập (Protected routes)
- Trang **Main Feed** có:
  - Tìm kiếm
  - Lọc
  - Sắp xếp
  - Infinite scroll
  - Sidebar và Rightbar mượt hơn
- Các trang:
  - Tạo bài viết
  - Sửa bài viết
  - Chi tiết bài viết
  - Trang cá nhân
  - Cài đặt
  - Dashboard
- Logo UIT đã tích hợp trên thanh topbar và tab trình duyệt

### Tối ưu hiệu năng
- Trì hoãn lưu Local Storage cho mock forum state
- Memoization cho tag rendering và layout
- Scrollbar riêng cho rightbar và cuộn mượt hơn

---

## 3. Cấu trúc thư mục

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
## 4. Yêu cầu hệ thống

### Backend
- Python 3.12+
- Microsoft SQL Server
- ODBC Driver 17 for SQL Server (Windows)

### Frontend
- Node.js 18+
- npm 9+

---

## 5. Cấu hình môi trường

### Backend

Sao chép file:
```
backend/.env.example → backend/.env
```

Cấu hình:

```env
DATABASE_URL=mssql+pyodbc://@localhost\\SQLEXPRESS/StudentForum?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&Encrypt=no&TrustServerCertificate=yes
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend

Sao chép file:
```
frontend/.env.example → frontend/.env.local
```

Cấu hình:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 6. Cách chạy hệ thống

### Bước 1: Chạy Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Khởi tạo database:

```powershell
python init_db.py
```

Kiểm tra kết nối database (tùy chọn):

```powershell
python test_db.py
```

Chạy server:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:
```
http://127.0.0.1:8000
```

Swagger API Docs:
```
http://127.0.0.1:8000/docs
```

---

### Bước 2: Chạy Frontend

Mở terminal thứ hai:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:
```
http://127.0.0.1:3000
```

---

## 7. Thứ tự khởi động hệ thống

Khi chạy local, chạy theo thứ tự:

1. Chạy SQL Server
2. Chạy Backend (FastAPI) port `8000`
3. Chạy Frontend (Next.js) port `3000`
4. Mở landing page và đăng nhập từ đó

---

## 8. Các route chính

### Frontend routes

| Route | Mô tả |
|------|------|
| `/` | Landing page + đăng nhập/đăng ký |
| `/login` | Trang đăng nhập |
| `/register` | Trang đăng ký |
| `/feed` | Trang bảng tin |
| `/create` | Tạo bài viết |
| `/post/[id]` | Chi tiết bài viết |
| `/profile/[id]` | Trang cá nhân |
| `/profile/current-user` | Redirect tới user hiện tại |
| `/settings` | Cài đặt |
| `/dashboard` | Dashboard |

### Backend auth routes

| Method | Route |
|-------|------|
| POST | /auth/register |
| POST | /auth/login |
| POST | /auth/refresh |
| POST | /auth/logout |
| GET | /auth/me |
| GET | /auth/users/{user_id} |

---

## 9. Hệ thống xác thực (Authentication)

Backend sử dụng JWT với 2 loại token:

### Access Token
- Thời gian sống ngắn
- Gửi qua header:
```
Authorization: Bearer <token>
```
- Dùng để truy cập API cần đăng nhập

### Refresh Token
- Lưu trong bảng `auth_sessions`
- Dùng để cấp access token mới
- Bị vô hiệu hóa khi logout

### Frontend lưu trong Local Storage:
- access_token
- refresh_token
- auth_user

Frontend tự động refresh access token thông qua Axios interceptor.

---

## 10. Ghi chú

- Backend sử dụng **SQL Server**, không dùng SQLite
- Frontend vẫn còn một số **mock forum state**
- Nếu Next.js bị lỗi cache:
  - Xóa thư mục `frontend/.next`
  - Chạy lại frontend

---

## 11. Lệnh thường dùng

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

---

## 12. Xử lý lỗi thường gặp

### Backend
Nếu không kết nối được database:
- Kiểm tra SQL Server đã chạy chưa
- Kiểm tra `DATABASE_URL`
- Kiểm tra ODBC Driver 17

Nếu lỗi JWT:
- Kiểm tra `JWT_SECRET_KEY`
- Kiểm tra frontend và backend có cùng backend URL

### Frontend
Nếu lỗi authentication:
- Kiểm tra `NEXT_PUBLIC_API_URL`
- Kiểm tra backend CORS

Nếu web không cập nhật:
- Xóa `frontend/.next`
- Chạy lại `npm run dev`

---

## 13. Tác giả

Đồ án môn **Công nghệ Phần mềm – SE104**  
Trường Đại học Công nghệ Thông tin – UIT