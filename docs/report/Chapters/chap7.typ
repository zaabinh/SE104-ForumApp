= CHƯƠNG 7. TỔNG KẾT

== 7.1. Kết quả đạt được

Sau quá trình khảo sát, phân tích, thiết kế và xây dựng, nhóm đã hoàn thiện hệ thống với các chức năng chính của một diễn đàn sinh viên:

- Đăng ký, đăng nhập, đăng xuất, xác minh email, đăng nhập Google, quên mật khẩu và đặt lại mật khẩu.
- Hoàn thiện và chỉnh sửa hồ sơ với thông tin học tập, mục tiêu nghề nghiệp và tag quan tâm.
- Tạo, chỉnh sửa, xóa, xem chi tiết, chia sẻ và kiểm duyệt bài viết.
- Bảng tin hỗ trợ tìm kiếm, lọc tag, phân trang, các chế độ For You, Following, Trending và nhiều tiêu chí sắp xếp.
- Tương tác với bài viết qua like, bookmark, view, share, comment, reply và report.
- Theo dõi/hủy theo dõi người dùng và nhận thông báo.
- Giao diện quản trị cho quản lý người dùng, xử lý báo cáo, duyệt bài chờ kiểm duyệt, quản lý tag và xem thống kê.
- Các service gợi ý nội dung theo xu hướng, bài tương tự, hồ sơ người dùng và hành vi tương tác.

== 7.2. Ưu điểm

Hệ thống có một số điểm nổi bật:

- Kiến trúc frontend, backend và cơ sở dữ liệu được tách rõ ràng.
- Backend được tổ chức theo router, schema, service, model và dependency nên dễ mở rộng.
- Mật khẩu được băm bằng Argon2, xác thực dùng JWT access token và refresh token.
- Các API quan trọng có kiểm tra trạng thái tài khoản, xác minh email và vai trò quản trị.
- Bài viết của sinh viên có cơ chế chờ duyệt trước khi xuất hiện trên bảng tin.
- Dữ liệu tương tác được lưu ở các bảng riêng, giúp thống kê và gợi ý nội dung thuận lợi hơn.
- Giao diện đã bao phủ các luồng chính của người dùng và quản trị viên.

== 7.3. Hạn chế

Một số điểm còn hạn chế:

- Email service trong môi trường phát triển vẫn là cơ chế mô phỏng, chưa gửi email thật qua SMTP.
- Chưa có thông báo thời gian thực bằng WebSocket.
- Chức năng cài đặt mới ở mức nền tảng, chưa hoàn thiện đầy đủ đổi mật khẩu và tùy chọn thông báo.
- Bộ kiểm thử tự động còn ít, chủ yếu mới bao phủ một phần schema và service báo cáo.
- Recommendation còn dựa trên luật và điểm số, chưa dùng mô hình học máy hoặc dữ liệu đánh giá lớn.
- Chưa triển khai production đầy đủ với domain, HTTPS, logging, monitoring và backup định kỳ.

== 7.4. Hướng phát triển

Trong tương lai, hệ thống có thể được phát triển theo các hướng:

- Tích hợp dịch vụ gửi email thật cho xác minh tài khoản và đặt lại mật khẩu.
- Bổ sung WebSocket để hiển thị thông báo thời gian thực.
- Mở rộng vai trò như moderator để chia nhỏ trách nhiệm kiểm duyệt.
- Hoàn thiện trang cài đặt, quản lý thông báo và đổi mật khẩu.
- Bổ sung chức năng nhóm cộng đồng, nhắn tin riêng hoặc mention người dùng.
- Cải tiến gợi ý nội dung bằng embedding, vector search hoặc mô hình học máy.
- Xây dựng thêm kiểm thử tự động cho backend, frontend và các luồng tích hợp.
- Triển khai production với HTTPS, logging, monitoring và cơ chế sao lưu cơ sở dữ liệu.

== 7.5. Kết luận

Đề tài Quản lý Forum Sinh Viên đã đáp ứng mục tiêu xây dựng một ứng dụng forum sinh viên trên nền tảng web. Hệ thống không chỉ hỗ trợ các chức năng cơ bản như bài viết, bình luận và tương tác, mà còn có các thành phần cần thiết cho một sản phẩm thực tế như xác thực JWT, xác minh email, kiểm duyệt nội dung, quản trị người dùng, thông báo và gợi ý nội dung.

Thông qua đồ án, nhóm đã vận dụng quy trình phát triển phần mềm từ khảo sát, phân tích yêu cầu, thiết kế hệ thống, thiết kế dữ liệu, thiết kế giao diện đến cài đặt và kiểm tra. Đây là nền tảng để tiếp tục hoàn thiện thành một hệ thống có thể sử dụng thực tế trong môi trường sinh viên.

