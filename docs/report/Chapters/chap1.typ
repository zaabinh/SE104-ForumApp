= CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI

== 1.1. Lý do chọn đề tài

=== 1.1.1. Bối cảnh thực tiễn

Trong môi trường đại học, nhu cầu trao đổi học tập, chia sẻ tài liệu, hỏi đáp kinh nghiệm môn học và kết nối giữa sinh viên diễn ra thường xuyên. Tuy nhiên, các kênh phổ biến như nhóm mạng xã hội, ứng dụng nhắn tin hoặc email thường phân tán, khó tìm kiếm lại và thiếu cơ chế phân loại nội dung theo chủ đề. Thông tin quan trọng dễ bị trôi, còn các cuộc thảo luận có giá trị lâu dài lại không được lưu trữ theo cấu trúc rõ ràng.

Bên cạnh đó, sinh viên cần một không gian mang tính học thuật hơn mạng xã hội phổ thông, nơi mỗi bài viết có thể được gắn tag, bình luận, lưu lại, chia sẻ và theo dõi theo sở thích. Nhà trường hoặc quản trị viên cũng cần công cụ để kiểm duyệt nội dung, quản lý tài khoản, xử lý báo cáo vi phạm và theo dõi tình hình hoạt động của hệ thống.

Từ nhu cầu trên, nhóm xây dựng một ứng dụng forum sinh viên theo hướng web application, tập trung vào các luồng nghiệp vụ xác thực, bài viết, bảng tin, tương tác xã hội, hồ sơ cá nhân và quản trị nội dung.

=== 1.1.2. Lý do chọn đề tài

Nhóm chọn đề tài *"Ứng dụng quản lý Forum sinh viên"* vì các lý do sau:

- *Tính thực tiễn cao:* Forum giúp tập trung hóa nội dung trao đổi của sinh viên, hỗ trợ tìm kiếm, phân loại và lưu trữ thông tin tốt hơn so với các kênh trò chuyện tức thời.
- *Phù hợp với phạm vi môn học:* Đề tài bao gồm nhiều nghiệp vụ tiêu biểu trong phát triển phần mềm như xác thực, phân quyền, CRUD, tương tác người dùng, kiểm duyệt và quản lý dữ liệu.
- *Có khả năng mở rộng:* Hệ thống có thể mở rộng thêm gợi ý nội dung, phân tích hồ sơ, thông báo nâng cao, ứng dụng di động hoặc tích hợp dịch vụ gửi email thực tế.
- *Rèn luyện quy trình công nghệ phần mềm:* Nhóm có thể thực hành phân tích yêu cầu, thiết kế cơ sở dữ liệu, thiết kế API, xây dựng giao diện, kiểm thử và triển khai bằng Docker.

== 1.2. Mục tiêu

Mục tiêu của đề tài là xây dựng một hệ thống forum sinh viên có các nhóm chức năng chính sau:

- *Xác thực và bảo mật tài khoản:* Cho phép đăng ký, đăng nhập bằng email hoặc username, xác minh email, đăng nhập Google OAuth, làm mới token, đăng xuất, quên mật khẩu, đặt lại mật khẩu và hoàn thiện hồ sơ sau đăng nhập.
- *Bảng tin và bài viết:* Cho phép tạo, xem, chỉnh sửa, xóa bài viết; hỗ trợ ảnh bìa, tag, tìm kiếm, lọc tag, phân trang và sắp xếp theo mới nhất, xu hướng, nhiều like hoặc nhiều bình luận.
- *Tương tác xã hội:* Cho phép like, bookmark, chia sẻ bài viết, bình luận lồng nhau, báo cáo bài viết/bình luận và theo dõi người dùng khác.
- *Hồ sơ cá nhân:* Cho phép xem hồ sơ công khai, cập nhật thông tin cá nhân, chuyên ngành, năm học, mục tiêu nghề nghiệp, tag quan tâm, danh sách bài viết, bình luận và bookmark.
- *Thông báo:* Tự động tạo thông báo khi có tương tác như like, comment, reply, follow, share, xử lý báo cáo hoặc thay đổi trạng thái tài khoản.
- *Quản trị hệ thống:* Cho phép quản trị viên quản lý người dùng, khóa/mở khóa tài khoản, xử lý báo cáo, duyệt bài viết chờ kiểm duyệt, quản lý tag và xem thống kê tổng quan.
- *Gợi ý nội dung:* Hệ thống có các API gợi ý bài viết theo xu hướng, bài viết tương tự,và phân tích hồ sơ để cá nhân hóa bảng tin.

== 1.3. Phạm vi thực hiện

=== 1.3.1. Phạm vi người dùng

Hệ thống phục vụ ba nhóm tác nhân chính:

- *Khách:* Có thể đăng ký, đăng nhập, xác minh email, yêu cầu đặt lại mật khẩu và đăng nhập qua Google.
- *Sinh viên:* Là người dùng đã đăng nhập, đã xác minh email và hoàn thiện hồ sơ. Sinh viên có thể đăng bài, tương tác, theo dõi người khác, quản lý hồ sơ và xem thông báo.
- *Quản trị viên:* Có toàn bộ quyền của sinh viên và các quyền quản trị như quản lý tài khoản, kiểm duyệt báo cáo, duyệt bài chờ xử lý, quản lý tag và xem thống kê hệ thống.

=== 1.3.2. Phạm vi nền tảng và công nghệ

Ứng dụng được phát triển dưới dạng web application, gồm:

- *Frontend:* Next.js 15, React 19, TypeScript, Tailwind CSS, Axios.
- *Backend:* FastAPI, SQLAlchemy 2, Pydantic, JWT, Argon2.
- *Cơ sở dữ liệu:* Microsoft SQL Server thông qua ODBC Driver và `pyodbc`.
- *Triển khai:* Hỗ trợ chạy local và Docker Compose gồm SQL Server, backend FastAPI và frontend Next.js.

=== 1.3.3. Phạm vi chức năng

- Xác thực, xác minh email, reset mật khẩu, refresh token, Google OAuth.
- Quản lý bài viết, tag, bảng tin, tìm kiếm, lọc và sắp xếp.
- Like, bookmark, share, view, comment, reply và report.
- Hồ sơ cá nhân, follow/unfollow và notification.
- Admin dashboard ở mức kết nối API cho quản lý người dùng, báo cáo, bài pending, tag và analytics.
- API recommendation gồm trending, similar posts, collaborative recommendations và profile-based recommendations.

=== 1.3.4. Giới hạn của đề tài

- Ứng dụng chỉ hỗ trợ nền tảng web, chưa có ứng dụng native cho iOS hoặc Android.
- Chưa triển khai nhắn tin trực tiếp, group/community riêng.
- Hệ thống recommendation hiện dựa trên công thức và dữ liệu tương tác, chưa sử dụng mô hình học máy chuyên sâu.
- Chưa tối ưu cho tải rất lớn hoặc triển khai production thực tế với monitoring, backup và scaling đầy đủ.
- Một số chức năng mở rộng như thiết lập tài khoản và thông báo mới ở mức nền tảng, chưa hoàn thiện đầy đủ.

#pagebreak()
