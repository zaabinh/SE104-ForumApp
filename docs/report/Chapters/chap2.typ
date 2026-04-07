= CHƯƠNG 2. CÔNG NGHỆ SỬ DỤNG

== 2.1. Công nghệ sử dụng

=== 2.1.1. Frontend — Next.js 15

Hệ thống sử dụng *Next.js 15* — một framework xây dựng trên nền tảng React, được phát triển bởi Vercel. Next.js cung cấp nhiều tính năng mạnh mẽ giúp xây dựng ứng dụng web hiện đại:

- *Server-Side Rendering (SSR)* và *Static Site Generation (SSG):* Hỗ trợ render trang phía server, cải thiện hiệu năng tải trang và tối ưu SEO.
- *App Router:* Hệ thống định tuyến dựa trên cấu trúc thư mục, giúp tổ chức mã nguồn rõ ràng và dễ bảo trì.
- *API Routes:* Cho phép xây dựng các endpoint API ngay trong ứng dụng frontend.
- *Hỗ trợ TypeScript:* Tích hợp sẵn TypeScript, giúp phát hiện lỗi sớm trong quá trình phát triển.

Giao diện được xây dựng bằng *CSS* thuần, đảm bảo khả năng tùy biến cao và kiểm soát hoàn toàn thiết kế. Ứng dụng hỗ trợ giao diện responsive, hoạt động tốt trên cả máy tính và thiết bị di động.

=== 2.1.2. Backend — FastAPI (Python)

Backend được xây dựng bằng *FastAPI* — một web framework hiệu năng cao dành cho Python. FastAPI được chọn vì các ưu điểm sau:

- *Hiệu năng cao:* Dựa trên ASGI (Asynchronous Server Gateway Interface), FastAPI có tốc độ xử lý nhanh, tương đương Node.js và Go.
- *Tự động tạo tài liệu API:* Tích hợp sẵn Swagger UI tại `/docs`, giúp việc kiểm thử và tài liệu hóa API trở nên thuận tiện.
- *Validation tự động:* Sử dụng Pydantic để kiểm tra dữ liệu đầu vào, giảm thiểu lỗi từ phía client.
- *Hỗ trợ bất đồng bộ (async/await):* Phù hợp cho các tác vụ I/O như truy vấn database và gọi API bên ngoài.

Backend sử dụng *SQLAlchemy* làm ORM (Object-Relational Mapping) để tương tác với cơ sở dữ liệu, kết hợp với *pyodbc* làm driver kết nối.

=== 2.1.3. Cơ sở dữ liệu — Microsoft SQL Server

Hệ thống sử dụng *Microsoft SQL Server* làm hệ quản trị cơ sở dữ liệu quan hệ (RDBMS). SQL Server được chọn vì:

- *Hiệu năng và độ tin cậy:* SQL Server là một trong những RDBMS phổ biến nhất trong môi trường doanh nghiệp, hỗ trợ xử lý lượng dữ liệu lớn với hiệu năng ổn định.
- *Tích hợp tốt với hệ sinh thái Windows:* Hỗ trợ Windows Authentication, tích hợp dễ dàng với các công cụ Microsoft.
- *Hỗ trợ ACID:* Đảm bảo tính toàn vẹn dữ liệu thông qua các giao dịch (transaction).
- *Công cụ quản lý mạnh mẽ:* SQL Server Management Studio (SSMS) cung cấp giao diện trực quan để quản lý và truy vấn dữ liệu.

Kết nối giữa backend và SQL Server thông qua *ODBC Driver 17 for SQL Server*, sử dụng chuỗi kết nối được cấu hình trong biến môi trường.

== 2.2. Xác thực và bảo mật

Hệ thống sử dụng cơ chế xác thực dựa trên *JWT (JSON Web Token)* với mô hình hai token:

- *Access Token:* Thời gian sống ngắn (mặc định 60 phút), được gửi trong header `Authorization: Bearer <token>` để truy cập các API cần đăng nhập.
- *Refresh Token:* Thời gian sống dài (mặc định 7 ngày), được lưu trong bảng `auth_sessions` tại database. Dùng để cấp lại access token mà không cần đăng nhập lại.

Mật khẩu người dùng được mã hóa bằng thuật toán *Argon2* thông qua thư viện `passlib` — đây là thuật toán hash mật khẩu được khuyến nghị bởi OWASP, có khả năng chống lại các cuộc tấn công brute-force hiệu quả.

Phía frontend sử dụng *Axios interceptor* để tự động refresh token khi access token hết hạn, đảm bảo trải nghiệm người dùng liền mạch.

== 2.3. Công cụ phát triển

#table(
  columns: (auto, auto),
  align: (left, left),
  table.header(
    [*Công cụ*], [*Mục đích*],
  ),
  table.hline(),
  [Visual Studio Code], [Trình soạn thảo mã nguồn chính],
  [Enterprise Architect], [Vẽ sơ đồ Use Case, DFD],
  [SQL Server Management Studio], [Quản lý cơ sở dữ liệu],
  [Git / GitHub], [Quản lý mã nguồn, cộng tác nhóm],
  [Swagger UI], [Kiểm thử và tài liệu hóa API],
  [Postman], [Kiểm thử API thủ công],
  [npm], [Quản lý thư viện frontend],
  [pip], [Quản lý thư viện backend],
)


#pagebreak()