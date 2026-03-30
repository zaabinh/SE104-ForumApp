# **DATABASE** 

Hệ thống cơ sở dữ liệu cho Forum tích hợp các tính năng xác thực, tương tác mạng xã hội (và định hướng AI).

---

## 1. Nhóm Người dùng & Bảo mật (Authentication & Profile)

### Bảng: `users` (Thông tin tài khoản)
Lưu trữ thông tin cốt lõi của người dùng và phân quyền.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, Auto Increment | ID duy nhất của người dùng |
| `username` | VARCHAR(50) | Unique, Not Null | Tên đăng nhập |
| `email` | VARCHAR(255) | Unique, Not Null | Email liên kết |
| `password_hash` | TEXT | Not Null | Mật khẩu đã mã hóa |
| `full_name` | VARCHAR(100) | | Tên hiển thị trên Profile |
| `avatar_url` | TEXT | | Link ảnh đại diện |
| `role` | ENUM | 'Admin', 'Member' | Vai trò người dùng trong hệ thống |
| `created_at` | TIMESTAMP | Default: Now() | Thời điểm tham gia |

### Bảng: `auth_sessions` (Quản lý Đăng nhập/Đăng xuất)
Theo dõi phiên làm việc và hỗ trợ bảo vệ Route.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, Auto Increment | ID phiên làm việc |
| `user_id` | INT | FK (users.id) | Liên kết với tài khoản người dùng |
| `token` | TEXT | Not Null | Mã xác thực (JWT/Session ID) |
| `ip_address` | VARCHAR(45) | | Lưu địa chỉ IP đăng nhập |
| `expires_at` | TIMESTAMP | Not Null | Thời điểm hết hạn phiên làm việc |

---

## 2. Nhóm Nội dung & Phân loại (Posts, Tags & Feed)

### Bảng: `posts` (Bài viết)
Chứa dữ liệu bài viết và trạng thái kiểm duyệt.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, Auto Increment | ID bài viết |
| `user_id` | INT | FK (users.id) | Người sở hữu bài viết |
| `title` | VARCHAR(255) | Not Null | Tiêu đề bài viết |
| `content` | TEXT | Not Null | Nội dung chi tiết bài viết |
| `media_url` | TEXT | | Đường dẫn ảnh hoặc video đính kèm |
| `view_count` | INT | Default: 0 | Tổng số lượt xem |
| `status` | ENUM | 'Pending', 'Approved' | Trạng thái hiển thị bài viết |
| `created_at` | TIMESTAMP | Index | Ngày đăng (tối ưu Infinite Scroll) |

### Bảng: `tags` (Danh mục/Nhãn)
Lưu trữ danh sách các chủ đề phân loại.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, Auto Increment | ID nhãn |
| `tag_name` | VARCHAR(50) | Unique, Not Null | Tên nhãn (vd: #LapTrinh, #AI) |

### Bảng: `post_tags` (Liên kết bài viết - nhãn)
Thiết lập mối quan hệ n-n giữa bài viết và các thẻ nhãn.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `post_id` | INT | FK (posts.id) | ID bài viết tham chiếu |
| `tag_id` | INT | FK (tags.id) | ID tag tham chiếu |

---

## 3. Nhóm Tương tác & Quan hệ (Social Features)

### Bảng: `comments` (Bình luận)
Lưu trữ thảo luận và hỗ trợ phản hồi phân cấp.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, Auto Increment | ID bình luận |
| `post_id` | INT | FK (posts.id) | Bài viết chứa bình luận này |
| `user_id` | INT | FK (users.id) | Người viết bình luận |
| `parent_id` | INT | FK (comments.id) | ID bình luận gốc (nếu là trả lời) |
| `content` | TEXT | Not Null | Nội dung trao đổi |

### Nhóm bảng Tương tác nhanh

| Tên bảng | Cột tham chiếu | Mô tả |
| :--- | :--- | :--- |
| `likes` | `user_id`, `post_id` | Ghi nhận lượt yêu thích bài viết |
| `bookmarks` | `user_id`, `post_id` | Danh sách các bài viết người dùng lưu lại |
| `follows` | `follower_id`, `following_id` | Quan hệ theo dõi giữa các thành viên |

---

## 4. Nhóm AI & Kiểm duyệt (AI Features)

### Bảng: `user_interests` (Cá nhân hóa Feed)
Dữ liệu đầu vào để AI gợi ý nội dung phù hợp.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `user_id` | INT | FK (users.id) | Định danh người dùng |
| `tag_id` | INT | FK (tags.id) | Chủ đề quan tâm |
| `score` | FLOAT | | Trọng số quan tâm (dựa trên hành vi) |

### Bảng: `moderation_logs` (Kiểm duyệt nội dung)
Nhật ký xử lý nội dung vi phạm bằng AI hoặc thủ công.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK | ID bản ghi kiểm duyệt |
| `post_id` | INT | FK (posts.id) | Bài viết bị kiểm tra/xử lý |
| `is_ai` | BOOLEAN | | TRUE nếu phát hiện tự động bởi AI |
| `reason` | TEXT | | Lý do xử lý (Spam, nội dung xấu...) |
| `action` | VARCHAR(50) | | Hành động thực hiện (Ẩn bài, Ban user) |
