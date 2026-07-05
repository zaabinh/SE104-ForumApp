# Tài liệu Chức năng Xác thực (Authentication Functions Documentation)

**Ngày cập nhật tài liệu:** 2026-04-05

---

## 1. Mục đích

Tài liệu này mô tả cách hệ thống xác thực hiện tại được triển khai trong backend của SE104 Forum App và cách frontend sử dụng hệ thống xác thực này.

---

## 2. Kiến trúc xác thực

Hệ thống sử dụng xác thực JWT với:

- Access token dùng để truy cập API đã đăng nhập
- Refresh token dùng để cấp lại access token mà không cần đăng nhập lại
- Refresh token được lưu trong database (persistent session)

Các file backend chính:

- backend/routes/auth.py
- backend/dependencies/auth.py
- backend/utils/jwt.py
- backend/utils/hash.py
- backend/schemas/auth_schema.py
- backend/models/auth_session.py
- frontend/lib/axios.ts

---

## 3. Mô hình Token

### 3.1 Access Token

Được tạo bởi hàm:

```
create_access_token(user_id, email, role)
```

Dữ liệu trong token:

- `sub`: id người dùng
- `email`: email người dùng
- `role`: vai trò người dùng
- `type`: `"access"`
- `exp`: thời gian hết hạn

Thời gian sống:

- Được cấu hình bởi `ACCESS_TOKEN_EXPIRE_MINUTES`
- Mặc định: 60 phút

Cách sử dụng:

Gửi trong header HTTP:

```
Authorization: Bearer <access_token>
```

---

### 3.2 Refresh Token

Được tạo bởi hàm:

```
create_refresh_token(user_id)
```

Dữ liệu trong token:

- `sub`: id người dùng
- `type`: `"refresh"`
- `exp`: thời gian hết hạn

Thời gian sống:

- Được cấu hình bởi `REFRESH_TOKEN_EXPIRE_DAYS`
- Mặc định: 7 ngày

Lưu trữ:

- Được lưu trong bảng `auth_sessions`
- Liên kết với một user cụ thể
- Lưu các thông tin:
  - refresh token
  - địa chỉ IP
  - user agent
  - thời gian hết hạn

---

## 4. Xử lý mật khẩu

Mã hóa mật khẩu được thực hiện trong file:

```
backend/utils/hash.py
```

Cách hoạt động:

- Mật khẩu được hash bằng Argon2 thông qua `passlib`
- Khi đăng nhập, hệ thống so sánh mật khẩu với hash đã lưu

Các hàm sử dụng:

```
hash_password(password: str) -> str
verify_password(password: str, hashed: str) -> bool
```

Thư viện sử dụng:

```
passlib[argon2]
```

---

## 5. Các API xác thực

Prefix chung:

```
/auth
```

---

### 5.1 Đăng ký

Endpoint:

```
POST /auth/register
```

Request:

```json
{
  "username": "student123",
  "email": "student@example.com",
  "password": "secret123",
  "full_name": "Nguyen Van A"
}
```

Quy tắc validate:

- `username`: 3–50 ký tự
- `email`: đúng định dạng email
- `password`: 6–128 ký tự
- `full_name`: 2–255 ký tự

Xử lý:

- Chuyển email về chữ thường
- Xóa khoảng trắng username
- Không cho trùng email
- Không cho trùng username
- Hash mật khẩu trước khi lưu
- Tạo user mới với:
  - role = "Student"
  - status = "Active"
  - provider = "local"

Response thành công:

```json
{
  "message": "User registered successfully."
}
```

Các lỗi thường gặp:

- 400: email đã tồn tại
- 400: username đã tồn tại
- 500: lỗi database

---

### 5.2 Đăng nhập

Endpoint:

```
POST /auth/login
```

Request:

```json
{
  "identifier": "student@example.com",
  "password": "secret123"
}
```

Xử lý:

- Cho phép đăng nhập bằng email hoặc username
- Tìm user theo email hoặc username
- Nếu không tìm thấy → lỗi
- Nếu tài khoản không active → lỗi
- Kiểm tra mật khẩu
- Tạo:
  - access token
  - refresh token
- Lưu refresh token vào bảng `auth_sessions`

Response thành công:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 3600
}
```

Các lỗi thường gặp:

- 401: không tìm thấy user
- 401: sai mật khẩu
- 403: tài khoản bị khóa

---

### 5.3 Refresh Token

Endpoint:

```
POST /auth/refresh
```

Request:

```json
{
  "refresh_token": "<jwt>"
}
```

Xử lý:

- Kiểm tra refresh token trong bảng `auth_sessions`
- Nếu không tồn tại → lỗi
- Nếu hết hạn → xóa session và báo lỗi
- Decode JWT và kiểm tra:
  - Token hợp lệ
  - Type = refresh
  - User trong token trùng với session
- Tạo access token mới
- Trả về access token mới

Response thành công:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<same-refresh-token>",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### 5.4 Đăng xuất

Endpoint:

```
POST /auth/logout
```

Request:

```json
{
  "refresh_token": "<jwt>"
}
```

Xử lý:

- Xóa refresh session khỏi bảng `auth_sessions`
- Nếu token không tồn tại vẫn trả về success

Response:

```json
{
  "message": "Logged out successfully."
}
```

---

### 5.5 Lấy thông tin user hiện tại

Endpoint:

```
GET /auth/me
```

Yêu cầu:

- Cần access token

Trả về thông tin:

- id
- username
- email
- full_name
- avatar_url
- bio
- role
- status
- provider

---

### 5.6 Lấy thông tin user theo ID

Endpoint:

```
GET /auth/users/{user_id}
```

Yêu cầu:

- Cần access token

---

## 6. Authentication bằng Dependency

File:

```
backend/dependencies/auth.py
```

### get_current_user

Chức năng:

- Đọc bearer token
- Decode JWT
- Kiểm tra token type = access
- Lấy user từ database
- Không cho user bị khóa truy cập
- Trả về user hiện tại

Các lỗi:

- Không có token
- Token không hợp lệ
- Token hết hạn
- Sai token type
- Không tìm thấy user
- User bị khóa

### require_role(*roles)

Chức năng:

- Kiểm tra role của user
- Chỉ cho phép user có role hợp lệ truy cập

---

## 7. Luồng xác thực phía Frontend

File:

```
frontend/lib/axios.ts
```

Local storage lưu:

- access_token
- refresh_token
- auth_user

Các hàm chính:

### saveAuthSession()

- Lưu access token
- Lưu refresh token
- Lưu thông tin user

### fetchCurrentUser()

- Gọi API `/auth/me`
- Lưu thông tin user

### refreshAccessToken()

- Gọi `/auth/refresh`
- Cập nhật token mới
- Nếu refresh thất bại → logout

### Axios interceptor

- Tự động thêm access token vào request
- Nếu gặp lỗi 401 → tự refresh token
- Nếu refresh thành công → gửi lại request cũ

### logout()

- Gọi `/auth/logout`
- Xóa dữ liệu đăng nhập local

---

## 8. Biến môi trường

Backend:

```env
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 9. Các bảng database liên quan đến xác thực

### users

Các cột sử dụng:

- id
- username
- email
- password_hash
- full_name
- role
- status
- provider

### auth_sessions

Chức năng:

- Lưu refresh token hợp lệ

Các cột:

- id
- user_id
- refresh_token
- ip_address
- user_agent
- expires_at
- created_at

---

## 10. Bảo mật

Ưu điểm hiện tại:

- Mật khẩu hash bằng Argon2
- Access token và refresh token tách riêng
- Refresh token lưu trong database
- User bị khóa không thể đăng nhập

Hạn chế hiện tại:

- Chưa có refresh token rotation
- Token đang lưu ở local storage (chưa dùng HttpOnly cookie)
- Chưa có giới hạn số lần đăng nhập
- Chưa có email verification
- JWT secret mặc định không được dùng khi deploy

---

## 11. Hướng cải thiện trong tương lai

1. Rotate refresh token mỗi lần refresh
2. Lưu token trong HttpOnly cookie
3. Thêm giới hạn đăng nhập (chống brute force)
4. Thêm xác thực email và reset mật khẩu
5. Viết test cho register, login, refresh, logout

---

## 12. Quy trình test nhanh

1. Đăng ký: `POST /auth/register`
2. Đăng nhập: `POST /auth/login`
3. Copy access_token
4. Gọi: `GET /auth/me`
5. Refresh: `POST /auth/refresh`
6. Logout: `POST /auth/logout`
7. Kiểm tra refresh token không còn hoạt động sau logout