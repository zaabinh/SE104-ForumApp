= CHƯƠNG 2. CÔNG NGHỆ SỬ DỤNG

== 2.1. Kiến trúc công nghệ tổng quan

Hệ thống được xây dựng theo mô hình client-server. Frontend Next.js chịu trách nhiệm giao diện và trải nghiệm người dùng, backend FastAPI cung cấp REST API và xử lý nghiệp vụ, còn Microsoft SQL Server lưu trữ dữ liệu quan hệ. Dữ liệu được trao đổi qua HTTP dưới dạng JSON.

#table(
  columns: (auto, 1fr, 1.4fr),
  align: (left, left, left),
  table.header([*Thành phần*], [*Công nghệ*], [*Vai trò*]),
  table.hline(),
  [Frontend], [Next.js 15,\ React 19,\ TypeScript,\ Tailwind CSS], [Xây dựng giao diện, định tuyến App Router, quản lý trạng thái UI và gọi API.],
  [Backend], [FastAPI,\ SQLAlchemy 2,\ Pydantic], [Cung cấp REST API, validation, xử lý nghiệp vụ và truy vấn CSDL.],
  [Xác thực], [JWT,\ Argon2,\ OAuth Google], [Đăng nhập, refresh token, mã hóa mật khẩu, xác minh người dùng.],
  [CSDL], [Microsoft SQL Server,\ pyodbc], [Lưu trữ dữ liệu tài khoản, bài viết, tương tác, báo cáo và thông báo.],
  [Triển khai], [Docker Compose,\ Uvicorn,\ Next.js server], [Chạy đồng bộ frontend, backend và database trong môi trường local/staging.],
)

== 2.2. Frontend

Frontend sử dụng *Next.js 15* với App Router, kết hợp React 19 và TypeScript. Cấu trúc thư mục `frontend/app` định nghĩa các route chính như landing page, đăng nhập, đăng ký, xác minh email, bảng tin, tạo/chỉnh sửa bài viết, chi tiết bài viết, hồ sơ và dashboard quản trị.

Các điểm chính của frontend:

- *TypeScript:* Giúp định nghĩa kiểu dữ liệu cho bài viết, hồ sơ, phản hồi API và trạng thái giao diện.
- *Tailwind CSS:* Dùng để xây dựng giao diện responsive, đồng bộ style và tối ưu tốc độ phát triển UI.
- *Axios:* Tập trung cấu hình HTTP client trong `frontend/lib/axios.ts`, tự gắn access token vào header và tự refresh token khi gặp lỗi `401`.
- *Custom hooks:* Bao gồm `useAuthGuard`, `useDebouncedValue`, `useResponsiveSidebar` để tái sử dụng logic kiểm tra đăng nhập, debounce tìm kiếm và điều khiển sidebar.
- *API layer:* Các file `forumApi.ts`, `profileApi.ts`, `adminApi.ts` đóng vai trò adapter giữa giao diện và backend.

== 2.3. Backend

Backend sử dụng *FastAPI* vì tốc độ xử lý tốt, hỗ trợ type hint, validation tự động và sinh tài liệu Swagger UI tại `/docs`. Ứng dụng khởi tạo tại `backend/main.py`, đăng ký các router chính:

- `/auth`: đăng ký, đăng nhập, Google OAuth, refresh token, logout, verify email, resend verification, forgot/reset password, complete profile, current user.
- `/api/posts`: bài viết, feed, tag, like, bookmark, share, report, recommendation.
- `/api/posts/{post_id}/comments`: bình luận và report comment.
- `/users`: hồ sơ, activity cá nhân, notification.
- `/follow`: follow/unfollow người dùng.
- `/api/admin`: quản trị người dùng, báo cáo, bài chờ duyệt, tag và analytics.

Backend được tổ chức theo các tầng:

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Tầng*], [*Mô tả*]),
  table.hline(),
  [`routers/`], [Nhận request, kiểm tra quyền, điều phối xử lý và trả response.],
  [`schemas/`], [Định nghĩa Pydantic model cho dữ liệu vào/ra.],
  [`services/`], [Chứa logic tái sử dụng như tạo token email, đồng bộ tag, recommendation, notification.],
  [`models/`], [Định nghĩa bảng SQLAlchemy ORM và quan hệ giữa các bảng.],
  [`dependencies/`], [Chứa dependency xác thực và phân quyền.],
  [`utils/`], [Hàm tiện ích JWT và hash mật khẩu.],
)

== 2.4. Cơ sở dữ liệu

Hệ thống dùng *Microsoft SQL Server* làm hệ quản trị cơ sở dữ liệu quan hệ. Backend kết nối thông qua SQLAlchemy engine và `pyodbc`. Các bảng được khai báo bằng SQLAlchemy ORM và được tạo bằng `Base.metadata.create_all(bind=engine)` khi backend khởi động.

Nhóm bảng dữ liệu chính gồm:

- `users`, `auth_sessions`
- `email_verification_tokens`, `password_reset_tokens`.
- `posts`, `tags`, `post_tags`, `post_views`, `post_likes`, `post_shares`, `bookmarks`.
- `comments`, `follows`, `notifications`, `reports`.
- `admin_audit_logs` để truy vết hành động quản trị.

Các dữ liệu như số lượt like, comment, view, share và trending score không lưu cứng trong bài viết mà được tổng hợp khi truy vấn.

== 2.5. Xác thực và phân quyền

Hệ thống sử dụng JWT với hai loại token:

- *Access token:* thời gian sống ngắn, dùng để gọi API cần xác thực.
- *Refresh token:* thời gian sống dài hơn, lưu trong bảng `auth_sessions` để cấp lại access token và có thể thu hồi khi logout hoặc reset mật khẩu.

Mật khẩu người dùng được hash bằng `Argon2` thông qua `passlib`. Backend không lưu mật khẩu dạng plaintext. Người dùng cần thỏa ba điều kiện để sử dụng đầy đủ chức năng: tài khoản `active`, email đã xác minh và hồ sơ đã hoàn thiện.

Phân quyền được triển khai bằng dependency:

- `get_current_user`: kiểm tra Bearer token, trạng thái deleted/banned và trả về user hiện tại.
- `require_active_verified_user`: yêu cầu tài khoản active, đã verify email và đã complete profile.
- `require_role("admin")`: yêu cầu vai trò quản trị viên cho các endpoint admin.



== 2.6. Công cụ phát triển

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Công cụ*], [*Mục đích*]),
  table.hline(),
  [Visual Studio Code], [Soạn thảo mã nguồn và tài liệu.],
  [Git / GitHub], [Quản lý phiên bản và cộng tác nhóm.],
  [Swagger UI], [Kiểm thử API tự động sinh từ FastAPI.],
  [SQL Server Management Studio], [Quản lý và kiểm tra dữ liệu SQL Server.],
  [Docker Compose], [Chạy đồng bộ database, backend và frontend.],
  [npm], [Quản lý thư viện frontend.],
  [pip], [Quản lý thư viện backend.],
  [pytest], [Kiểm thử service/schema backend.],
)

#pagebreak()
