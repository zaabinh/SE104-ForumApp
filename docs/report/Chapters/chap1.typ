= CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI

== 1.1. Lý do chọn đề tài

=== 1.1.1. Bối cảnh thực tiễn

Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ trên mọi lĩnh vực, giáo dục đại học cũng không nằm ngoài xu hướng này. Các trường đại học ngày càng chú trọng ứng dụng công nghệ thông tin vào hoạt động giảng dạy, quản lý và hỗ trợ sinh viên. Việc xây dựng các nền tảng trực tuyến phục vụ cho cộng đồng sinh viên trở thành một nhu cầu thiết yếu, đặc biệt trong giai đoạn hiện nay khi thói quen trao đổi, học tập trực tuyến đã trở nên phổ biến.

Hiện nay, sinh viên có nhu cầu rất lớn trong việc trao đổi thông tin học tập, chia sẻ tài liệu, thảo luận về các vấn đề liên quan đến chương trình đào tạo, cũng như kết nối với nhau trong các hoạt động ngoại khóa, câu lạc bộ. Tuy nhiên, các kênh giao tiếp phổ biến hiện tại như mạng xã hội (Facebook, Zalo) hay email thường mang tính chất phân tán, thiếu tổ chức và khó quản lý. Thông tin dễ bị trôi, khó tìm kiếm lại, và không có sự phân loại rõ ràng theo chủ đề hay khoa ngành.

Bên cạnh đó, nhà trường cũng gặp khó khăn trong việc nắm bắt ý kiến, phản hồi của sinh viên một cách có hệ thống. Các thông báo quan trọng từ phía nhà trường đôi khi không được truyền tải đến sinh viên một cách kịp thời và đầy đủ thông qua các kênh truyền thông không chính thức.

=== 1.1.2. Lý do chọn đề tài

Xuất phát từ những thực trạng nêu trên, nhóm quyết định chọn đề tài *"Ứng dụng quản lý Forum sinh viên"* với những lý do cụ thể sau:

- *Đáp ứng nhu cầu thực tế:* Sinh viên cần một nền tảng tập trung, có tổ chức để trao đổi học tập, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau. Một forum chuyên biệt dành cho sinh viên sẽ giúp giải quyết vấn đề phân tán thông tin hiện tại.

- *Tăng cường tương tác trong cộng đồng sinh viên:* Forum cung cấp không gian để sinh viên đặt câu hỏi, thảo luận, đánh giá và phản hồi về các môn học, giảng viên, cũng như chia sẻ cơ hội việc làm, thực tập. Điều này giúp xây dựng một cộng đồng sinh viên gắn kết và năng động hơn.

- *Hỗ trợ công tác quản lý:* Ứng dụng cho phép quản trị viên (nhà trường, ban cán sự) quản lý nội dung, kiểm duyệt bài viết, phân loại chủ đề và theo dõi hoạt động của sinh viên trên nền tảng một cách hiệu quả.

- *Ứng dụng kiến thức Công nghệ Phần mềm:* Đề tài cho phép nhóm áp dụng toàn diện các kiến thức đã học trong môn Nhập môn Công nghệ Phần mềm, bao gồm phân tích yêu cầu, thiết kế hệ thống, xây dựng cơ sở dữ liệu, lập trình và kiểm thử phần mềm.

- *Tính khả thi và mở rộng:* Đề tài có quy mô phù hợp với thời gian và nguồn lực của đồ án môn học, đồng thời có khả năng mở rộng thêm các tính năng nâng cao trong tương lai như hệ thống thông báo thời gian thực, tích hợp AI hỗ trợ tìm kiếm, hay ứng dụng di động.

== 1.2. Mục tiêu

Đề tài hướng đến việc xây dựng một ứng dụng forum dành cho sinh viên với bốn nhóm chức năng cốt lõi sau:

- *Hồ sơ cá nhân (Profile):* Cho phép sinh viên tạo và quản lý hồ sơ cá nhân, bao gồm các thông tin cơ bản như tên, ảnh đại diện và tiểu sử ngắn. Sinh viên có thể theo dõi (follow) lẫn nhau, xem lại các bài viết đã đăng, đã thích hoặc đã lưu, giúp xây dựng danh tính và kết nối trong cộng đồng.

- *Bảng tin (Newsfeed):* Xây dựng hệ thống bảng tin cho phép sinh viên đăng bài viết, chia sẻ thông tin và tài liệu học tập. Bảng tin hỗ trợ tìm kiếm, lọc theo tag, sắp xếp theo nhiều tiêu chí (mới nhất, xu hướng, nhiều tương tác nhất) và tải thêm bài tự động (infinite scroll).

- *Tương tác xã hội (Social Interactions):* Cung cấp các hình thức tương tác phong phú bao gồm thích (like), lưu bài (bookmark), bình luận đa cấp (nested comments), chia sẻ bài viết và báo cáo nội dung vi phạm. Hệ thống tính điểm xu hướng (trending score) dựa trên các tương tác để xếp hạng bài viết.

- *Quản trị hệ thống (Administration):* Cung cấp công cụ cho quản trị viên kiểm duyệt nội dung bị báo cáo, quản lý tài khoản người dùng (khóa/mở khóa), quản lý danh mục tag và giám sát hoạt động hệ thống thông qua hệ thống thông báo.



== 1.3. Phạm vi thực hiện

=== 1.3.1. Phạm vi

*Đối tượng sử dụng:*
- Sinh viên các trường đại học, cao đẳng — là người dùng chính của hệ thống, có thể đăng bài, tương tác, theo dõi người dùng khác và quản lý hồ sơ cá nhân.
- Quản trị viên (Admin) — chịu trách nhiệm quản lý nội dung, kiểm duyệt bài viết và quản lý tài khoản người dùng trên hệ thống.

*Nền tảng:*
- Ứng dụng được phát triển dưới dạng *web application*, hoạt động trên trình duyệt web (Google Chrome, Firefox, Microsoft Edge...) và hỗ trợ giao diện responsive trên các thiết bị khác nhau.

*Công nghệ sử dụng:*
- Frontend: Next.js 15 (React), CSS
- Backend: FastAPI (Python)
- Cơ sở dữ liệu: Microsoft SQL Server

*Phạm vi chức năng:*
- Hệ thống bao gồm bốn nhóm chức năng chính: Hồ sơ cá nhân (Profile), Bảng tin (Newsfeed), Tương tác xã hội (Social Interactions) và Quản trị hệ thống (Administration), như đã trình bày tại mục 1.2.

=== 1.3.2. Giới hạn của đề tài

- Ứng dụng chỉ phát triển trên nền tảng web, chưa hỗ trợ ứng dụng di động native (iOS, Android).
- Chưa tích hợp tính năng nhắn tin trực tiếp (chat) giữa các người dùng.
- Chưa hỗ trợ tạo và quản lý nhóm cộng đồng (group/community).
- Hệ thống chưa được tối ưu hóa để phục vụ số lượng lớn người dùng đồng thời (high concurrency).
- Chưa tích hợp trí tuệ nhân tạo (AI) trong việc gợi ý nội dung hay kiểm duyệt tự động, mặc dù cơ sở dữ liệu đã chuẩn bị sẵn cấu trúc cho tính năng này.
- Đề tài tập trung vào việc xây dựng và hoàn thiện các chức năng cơ bản trong phạm vi đồ án môn học, chưa triển khai lên môi trường production thực tế.


#pagebreak()