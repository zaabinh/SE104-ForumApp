= CHƯƠNG 3. ĐẶC TẢ VÀ PHÂN TÍCH YÊU CẦU

== 3.1. Yêu cầu chức năng

=== 3.1.1. Yêu cầu chức năng nghiệp vụ

Bảng yêu cầu nghiệp vụ:

#table(
  columns: (auto, auto, auto, auto, auto, auto),
  align: (center, left, left, center, center, center),
  table.header(
    [*STT*], [*Nghiệp vụ*], [*Thao tác cụ thể*], [*Biểu mẫu*], [*Quy định*], [*Ghi chú*],
  ),
  table.hline(),
  [1], table.cell(rowspan: 4)[Quản lý xác thực], [Đăng ký tài khoản], [BM 1], [QĐ 1.1], [Lưu trữ],
  [2], [Đăng nhập], [BM 1], [QĐ 1.2], [],
  [3], [Đăng xuất], [], [], [],
  [4], [Quên mật khẩu], [BM 1], [], [],
  table.hline(),
  [5], table.cell(rowspan: 4)[Quản lý bài viết], [Tạo bài viết], [BM 2], [QĐ 2.1], [Lưu trữ],
  [6], [Chỉnh sửa bài viết], [BM 2], [], [Lưu trữ],
  [7], [Xóa bài viết], [], [], [],
  [8], [Xem chi tiết bài viết], [], [], [Tra cứu],
  table.hline(),
  [9], table.cell(rowspan: 4)[Quản lý bảng tin], [Xem bảng tin], [], [], [Tra cứu],
  [10], [Tìm kiếm bài viết], [], [], [Tra cứu],
  [11], [Lọc bài viết theo tag], [], [], [Tra cứu],
  [12], [Sắp xếp bài viết], [], [], [Tra cứu],
  table.hline(),
  [13], table.cell(rowspan: 6)[Quản lý tương tác], [Like bài viết], [], [QĐ 3.1], [Lưu trữ],
  [14], [Bookmark bài viết], [], [], [Lưu trữ],
  [15], [Chia sẻ bài viết], [], [], [],
  [16], [Bình luận bài viết], [BM 3], [QĐ 3.2], [Lưu trữ],
  [17], [Trả lời bình luận], [BM 3], [QĐ 3.2], [Lưu trữ],
  [18], [Báo cáo nội dung], [BM 4], [QĐ 4.1], [Lưu trữ],
  table.hline(),
  [19], table.cell(rowspan: 4)[Quản lý hồ sơ \& xã hội], [Xem hồ sơ người dùng], [], [], [Tra cứu],
  [20], [Chỉnh sửa hồ sơ], [BM 1], [], [Lưu trữ],
  [21], [Follow\/Unfollow], [], [QĐ 5.1], [Lưu trữ],
  [22], [Xem thông báo], [BM 6], [QĐ 6.1], [Tra cứu],
  table.hline(),
  [23], table.cell(rowspan: 3)[Quản trị hệ thống], [Quản lý người dùng], [BM 1], [QĐ 1.3], [Lưu trữ],
  [24], [Kiểm duyệt nội dung], [BM 4], [QĐ 4.2], [Lưu trữ],
  [25], [Quản lý tags], [BM 5], [QĐ 5.1], [Lưu trữ],
)

=== 3.1.2. Danh sách các Biểu mẫu và Quy định

Các biểu mẫu dữ liệu chính trong hệ thống và quy định ràng buộc tương ứng:

*Biểu mẫu 1: Tài khoản người dùng*

#table(
  columns: (auto, auto, auto, auto),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [Username], [VARCHAR(50)], [Tên đăng nhập của người dùng], [Bắt buộc, duy nhất, 3-50 ký tự],
  [Email], [VARCHAR(255)], [Địa chỉ email liên lạc], [Bắt buộc, duy nhất, đúng định dạng],
  [Mật khẩu], [NVARCHAR(MAX)], [Mật khẩu đăng nhập (lưu dạng hash)], [Bắt buộc, 6-128 ký tự],
  [Họ tên], [NVARCHAR(100)], [Tên hiển thị của người dùng], [Bắt buộc, 2-255 ký tự],
  [Ảnh đại diện], [NVARCHAR(MAX)], [URL ảnh đại diện], [Tùy chọn],
  [Tiểu sử], [NVARCHAR(MAX)], [Giới thiệu ngắn về bản thân], [Tùy chọn],
  [Vai trò], [VARCHAR(20)], [Phân quyền: Student hoặc Admin], [Mặc định "Student"],
  [Trạng thái], [VARCHAR(20)], [Trạng thái tài khoản], [Mặc định "Active"],
)

- _QĐ 1.1:_ Có 2 vai trò: Student và Admin. Admin kế thừa toàn bộ quyền của Student.
- _QĐ 1.2:_ Tài khoản có trạng thái "Banned" không được phép đăng nhập.
- _QĐ 1.3:_ Username và email không được trùng lặp trong hệ thống.

*Biểu mẫu 2: Bài viết*

#table(
  columns: (auto, auto, auto, auto),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [Tiêu đề], [NVARCHAR(255)], [Tiêu đề bài viết], [Bắt buộc, tối đa 255 ký tự],
  [Nội dung], [NVARCHAR(MAX)], [Nội dung chi tiết bài viết], [Bắt buộc],
  [Slug], [VARCHAR(255)], [Đường dẫn URL thân thiện], [Tự động tạo, duy nhất],
  [Ảnh bìa], [NVARCHAR(MAX)], [URL ảnh bìa bài viết], [Tùy chọn],
  [Lượt xem], [INT], [Số lần bài viết được xem], [Mặc định 0],
  [Điểm xu hướng], [FLOAT], [Điểm xếp hạng trending], [Mặc định 0],
  [Trạng thái], [VARCHAR(20)], [Trạng thái kiểm duyệt], [Mặc định "Pending"],
  [Tags], [Quan hệ N-N], [Danh mục phân loại bài viết], [Tùy chọn, qua bảng post\_tags],
)

- _QĐ 2.1:_ Mỗi bài viết có thể gắn nhiều tag, mỗi tag có thể thuộc nhiều bài viết.
- _QĐ 2.2:_ Điểm xu hướng được tính: like (+4), comment (+3), view (+1).
- _QĐ 2.3:_ Slug được tạo tự động từ tiêu đề, đảm bảo duy nhất.

*Biểu mẫu 3: Bình luận*

#table(
  columns: (auto, auto, auto, auto),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [Nội dung], [NVARCHAR(MAX)], [Nội dung bình luận], [Bắt buộc],
  [Bài viết], [INT], [Bài viết được bình luận], [Bắt buộc, FK tới posts],
  [Người viết], [UNIQUEIDENTIFIER], [Người tạo bình luận], [Bắt buộc, FK tới users],
  [Parent ID], [INT], [Bình luận cha (nếu là trả lời)], [Tùy chọn, FK tới comments],
)

- _QĐ 3.1:_ Bình luận cấp 1 có parent\_id = NULL, trả lời bình luận có parent\_id = ID comment gốc.

*Biểu mẫu 4: Báo cáo vi phạm*

#table(
  columns: (auto, auto, auto, auto),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [Người báo cáo], [UNIQUEIDENTIFIER], [Người gửi báo cáo], [FK tới users],
  [Loại mục tiêu], [VARCHAR(20)], [Loại nội dung bị báo cáo], [Bắt buộc: "Post" hoặc "Comment"],
  [ID mục tiêu], [INT], [ID của bài viết/bình luận bị báo cáo], [Bắt buộc],
  [Lý do], [NVARCHAR(255)], [Lý do báo cáo vi phạm], [Bắt buộc],
  [Trạng thái], [VARCHAR(20)], [Trạng thái xử lý báo cáo], [Mặc định "Pending"],
)

- _QĐ 4.1:_ Báo cáo có thể nhắm vào bài viết hoặc bình luận.
- _QĐ 4.2:_ Admin xử lý báo cáo bằng cách giữ lại, ẩn hoặc xóa nội dung.

*Biểu mẫu 5: Tag*

#table(
  columns: (auto, auto, auto, auto),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [Tên tag], [VARCHAR(50)], [Tên danh mục phân loại], [Bắt buộc, duy nhất],
  [Slug], [VARCHAR(50)], [Đường dẫn URL thân thiện], [Tự động tạo, duy nhất],
)

- _QĐ 5.1:_ Tên tag không được trùng lặp trong hệ thống.
- _QĐ 5.2:_ Chỉ Admin mới có quyền thêm, sửa, xóa tag.

*Biểu mẫu 6: Thông báo*


#table(
  columns: (0.6fr, 1fr, 1fr, 1fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [Người nhận], [UNIQUEIDENTIFIER], [Người nhận thông báo], [Bắt buộc, FK tới users],
  [Người gửi], [UNIQUEIDENTIFIER], [Người gây ra thông báo], [Tùy chọn, FK tới users],
  [Loại thông báo], [VARCHAR(50)], [Loại sự kiện: like, comment, follow...], [Bắt buộc],
  [Bài viết liên quan], [INT], [Bài viết liên quan đến thông báo], [Tùy chọn, FK tới posts],
  [Đã đọc], [BIT], [Trạng thái đọc của thông báo], [Mặc định 0 (chưa đọc)],
)

- _QĐ 6.1:_ Thông báo được hệ thống tự động tạo khi có tương tác (like, comment, follow, kiểm duyệt).
- _QĐ 6.2:_ Người dùng có thể đánh dấu thông báo là đã đọc.

=== 3.1.3. Bảng trách nhiệm yêu cầu nghiệp vụ

#table(
  columns: (auto, 1fr, 1fr, 1fr, 0.7fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Tên yêu cầu*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Quản lý xác thực], [Cung cấp thông tin đăng ký\/đăng nhập theo BM 1.], [Kiểm tra QĐ 1.1-1.3. Nếu hợp lệ: hash mật khẩu bằng Argon2, tạo tài khoản, cấp JWT token. Nếu không hợp lệ: báo lỗi chi tiết.], [],
  table.hline(),
  [2], [Quản lý bài viết], [Cung cấp thông tin bài viết theo BM 2.], [Kiểm tra QĐ 2.1-2.3. Tự động tạo slug từ tiêu đề, gắn tag, lưu bài viết vào CSDL. Khi xóa: kiểm tra quyền sở hữu.], [],
  table.hline(),
  [3], [Quản lý bảng tin], [Gửi yêu cầu xem bảng tin, nhập từ khóa tìm kiếm, chọn tag lọc, chọn tiêu chí sắp xếp.], [Truy vấn CSDL theo điều kiện, sắp xếp theo created\_at hoặc trending\_score, trả về danh sách kết quả (infinite scroll).], [],
  table.hline(),
  [4], [Quản lý tương tác], [Thực hiện like, bookmark, bình luận theo BM 3, báo cáo theo BM 4.], [Kiểm tra QĐ 3.1, QĐ 4.1. Ghi nhận tương tác, cập nhật trending\_score. Tự động tạo thông báo theo BM 6.], [Tự động cập nhật trending],
  table.hline(),
  [5], [Quản lý hồ sơ \& xã hội], [Cập nhật hồ sơ theo BM 1, thực hiện follow\/unfollow.], [Kiểm tra QĐ 5.1 (không tự follow). Lưu thay đổi hồ sơ, ghi nhận quan hệ follow. Tự động tạo thông báo.], [],
  table.hline(),
  [6], [Quản trị hệ thống], [Admin gửi lệnh khóa\/mở khóa user, xử lý báo cáo, thêm\/sửa\/xóa tag.], [Kiểm tra QĐ 1.3, QĐ 4.2, QĐ 5.1-5.2. Cập nhật trạng thái user\/báo cáo, quản lý danh mục tag trong CSDL.], [],
)

== 3.2. Yêu cầu phi chức năng

=== 3.2.1. Yêu cầu hiệu quả

Yêu cầu hiệu quả liên quan đến tốc độ xử lý và khả năng sử dụng tài nguyên của hệ thống, đặc biệt là các tác vụ thường xuyên và quan trọng.

Bảng yêu cầu hiệu quả:

#table(
  columns: (auto, 1fr, 1fr, 0.7fr, 1fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Tốc độ xử lý*], [*Dung lượng lưu trữ*], [*Ghi chú*]),
  table.hline(),
  [1], [Quản lý xác thực (Đăng ký\/Đăng nhập)], [Thao tác thành công < 2 giây], [], [],
  table.hline(),
  [2], [Quản lý bài viết], [Lưu trữ\/Cập nhật thông tin < 3 giây], [], [],
  table.hline(),
  [3], [Quản lý bảng tin], [Tải bảng tin < 3 giây. Tìm kiếm\/lọc\/sắp xếp < 2 giây], [], [Hỗ trợ infinite scroll, debounce 350ms],
  table.hline(),
  [4], [Quản lý tương tác], [Like\/Bookmark\/Share: phản hồi tức thì. Bình luận < 2 giây], [], [Cập nhật trending score tự động],
  table.hline(),
  [5], [Quản lý hồ sơ \& xã hội], [Cập nhật hồ sơ < 3 giây. Follow\/Unfollow: phản hồi tức thì], [], [],
  table.hline(),
  [6], [Quản trị hệ thống], [Xử lý lệnh quản trị < 3 giây], [], [],
)

Bảng trách nhiệm yêu cầu hiệu quả:

#table(
  columns: (auto, auto, 1fr, 1fr, auto),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Quản lý xác thực], [Cung cấp thông tin tài khoản.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [2], [Quản lý bài viết], [Cung cấp thông tin bài viết.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [3], [Quản lý bảng tin], [Nhập từ khóa, chọn tag, chọn sắp xếp.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [4], [Quản lý tương tác], [Thực hiện like, comment, bookmark, report.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [5], [Quản lý hồ sơ \& xã hội], [Cập nhật hồ sơ, follow\/unfollow.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [6], [Quản trị hệ thống], [Gửi lệnh quản trị.], [Thực hiện đúng theo yêu cầu.], [],
)

=== 3.2.2. Yêu cầu tiện dụng

Bảng yêu cầu tiện dụng:

#table(
  columns: (auto, 1fr, 1fr, 1fr, auto),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Mức độ dễ học*], [*Mức độ dễ sử dụng*], [*Ghi chú*]),
  table.hline(),
  [1], [Quản lý xác thực], [5 phút hướng dẫn], [Dễ dàng thao tác. Sai sót dưới 1%.], [],
  table.hline(),
  [2], [Quản lý bài viết], [10 phút hướng dẫn], [Dễ dàng tạo, sửa, xóa bài viết. Hỗ trợ gắn tag phân loại.], [],
  table.hline(),
  [3], [Quản lý bảng tin], [5 phút hướng dẫn], [Dễ dàng tìm kiếm, lọc, sắp xếp. Cuộn tải thêm tự động.], [Toast notification],
  table.hline(),
  [4], [Quản lý tương tác], [5 phút hướng dẫn], [Like\/bookmark bằng 1 click. Bình luận đa cấp trực quan.], [],
  table.hline(),
  [5], [Quản lý hồ sơ \& xã hội], [5 phút hướng dẫn], [Dễ dàng cập nhật hồ sơ, follow\/unfollow bằng 1 click.], [],
  table.hline(),
  [6], [Quản trị hệ thống], [10 phút hướng dẫn], [Giao diện quản trị riêng, rõ ràng, dễ thao tác.], [],
)

Bảng trách nhiệm yêu cầu tiện dụng:

#table(
  columns: (auto, auto, 1fr, 1fr, auto),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Quản lý xác thực], [Đọc tài liệu hướng dẫn.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [2], [Quản lý bài viết], [Đọc tài liệu hướng dẫn.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [3], [Quản lý bảng tin], [Đọc tài liệu hướng dẫn.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [4], [Quản lý tương tác], [Đọc tài liệu hướng dẫn.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [5], [Quản lý hồ sơ \& xã hội], [Đọc tài liệu hướng dẫn.], [Thực hiện đúng theo yêu cầu.], [],
  table.hline(),
  [6], [Quản trị hệ thống], [Đọc tài liệu hướng dẫn.], [Thực hiện đúng theo yêu cầu.], [],
)

=== 3.2.3. Yêu cầu tương thích

#table(
  columns: (auto, 1fr, 1fr),
  align: (center, left, left),
  table.header([*STT*], [*Yêu cầu*], [*Mô tả*]),
  table.hline(),
  [1], [Tương thích trình duyệt], [Ứng dụng web hoạt động tốt trên Google Chrome, Mozilla Firefox, Microsoft Edge.],
  table.hline(),
  [2], [Tương thích thiết bị], [Giao diện responsive, hiển thị đúng trên desktop, tablet và mobile.],
  table.hline(),
  [3], [Tương thích API], [Backend cung cấp RESTful API chuẩn, cho phép tích hợp với nhiều loại client (web, mobile, third-party).],
)

=== 3.2.4. Yêu cầu tiến hoá

Yêu cầu tiến hoá mô tả khả năng thay đổi các quy định, tham số nghiệp vụ mà không cần lập trình lại hệ thống.

Bảng yêu cầu tiến hoá:

#table(
  columns: (auto, auto, auto, auto),
  align: (center, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Tham số cần thay đổi*], [*Miền giá trị cần thay đổi*]),
  table.hline(),
  [1], [Thay đổi phân quyền hệ thống], [Vai trò tài khoản], [Bảng users (cột role)],
  table.hline(),
  [2], [Thay đổi trạng thái tài khoản], [Trạng thái Active\/Banned], [Bảng users (cột status)],
  table.hline(),
  [3], [Thay đổi danh mục tag], [Tên tag, slug], [Bảng tags],
  table.hline(),
  [4], [Thay đổi trạng thái bài viết], [Trạng thái kiểm duyệt], [Bảng posts (cột status)],
)

Bảng trách nhiệm yêu cầu tiến hoá:

#table(
  columns: (auto, 1fr, 1fr, 1fr, 0.7fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Thay đổi phân quyền], [Cho biết tài khoản cần thay đổi vai trò.], [Ghi nhận giá trị mới và thay đổi cách thức kiểm tra.], [],
  table.hline(),
  [2], [Thay đổi trạng thái tài khoản], [Cho biết tài khoản cần khóa\/mở khóa.], [Ghi nhận giá trị mới, chặn đăng nhập nếu Banned.], [],
  table.hline(),
  [3], [Thay đổi danh mục tag], [Cho biết tag cần thêm\/sửa\/xóa.], [Ghi nhận giá trị mới. Các bài viết đã gắn tag cũ không bị ảnh hưởng.], [Không ảnh hưởng bài viết cũ],
  table.hline(),
  [4], [Thay đổi trạng thái bài viết], [Cho biết bài viết cần thay đổi trạng thái.], [Ghi nhận giá trị mới và cập nhật hiển thị.], [],
)

== 3.3. Yêu cầu hệ thống

=== 3.3.1. Yêu cầu bảo mật

Yêu cầu bảo mật đảm bảo tính toàn vẹn, bảo mật của dữ liệu người dùng và thiết lập cơ chế phân quyền truy cập rõ ràng, giải quyết vấn đề "phân quyền dựa trên vai trò".

Bảng yêu cầu bảo mật:

#table(
  columns: (auto, auto, auto, auto, auto, auto),
  align: (center, left, left, center, center, center),
  table.header([*STT*], [*Nghiệp vụ*], [*Thao tác cụ thể*], [*Admin*], [*Sinh viên*], [*Khách*]),
  table.hline(),
  [1], table.cell(rowspan: 4)[Quản lý xác thực], [Đăng ký tài khoản], [], [], [✓],
  [2], [Đăng nhập], [✓], [✓], [✓],
  [3], [Đăng xuất], [✓], [✓], [],
  [4], [Quên mật khẩu], [], [], [✓],
  table.hline(),
  [5], table.cell(rowspan: 4)[Quản lý bài viết], [Tạo bài viết], [✓], [✓], [],
  [6], [Chỉnh sửa bài viết], [✓], [✓], [],
  [7], [Xóa bài viết], [✓], [✓], [],
  [8], [Xem chi tiết bài viết], [✓], [✓], [],
  table.hline(),
  [9], table.cell(rowspan: 4)[Quản lý bảng tin], [Xem bảng tin], [✓], [✓], [],
  [10], [Tìm kiếm bài viết], [✓], [✓], [],
  [11], [Lọc bài viết theo tag], [✓], [✓], [],
  [12], [Sắp xếp bài viết], [✓], [✓], [],
  table.hline(),
  [13], table.cell(rowspan: 6)[Quản lý tương tác], [Like bài viết], [✓], [✓], [],
  [14], [Bookmark bài viết], [✓], [✓], [],
  [15], [Chia sẻ bài viết], [✓], [✓], [],
  [16], [Bình luận bài viết], [✓], [✓], [],
  [17], [Trả lời bình luận], [✓], [✓], [],
  [18], [Báo cáo nội dung], [✓], [✓], [],
  table.hline(),
  [19], table.cell(rowspan: 4)[Quản lý hồ sơ \& xã hội], [Xem hồ sơ], [✓], [✓], [],
  [20], [Chỉnh sửa hồ sơ], [✓], [✓], [],
  [21], [Follow\/Unfollow], [✓], [✓], [],
  [22], [Xem thông báo], [✓], [✓], [],
  table.hline(),
  [23], table.cell(rowspan: 3)[Quản trị hệ thống], [Quản lý người dùng], [✓], [], [],
  [24], [Kiểm duyệt nội dung], [✓], [], [],
  [25], [Quản lý tags], [✓], [], [],
)

Bảng trách nhiệm yêu cầu bảo mật:

#table(
  columns: (auto, auto, 1fr, 1fr, auto),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Vai trò*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Admin], [Cung cấp tên đăng nhập và mật khẩu. Quản lý phân quyền và trạng thái tài khoản.], [Ghi nhận và thực hiện đúng.], [],
  table.hline(),
  [2], [Sinh viên], [Cung cấp tên đăng nhập và mật khẩu.], [Ghi nhận và thực hiện đúng.], [],
  table.hline(),
  [3], [Khách], [Cung cấp thông tin đăng ký tài khoản.], [Ghi nhận và thực hiện đúng.], [],
)

=== 3.3.2. Yêu cầu an toàn

Bảng yêu cầu an toàn:

#table(
  columns: (auto, 1fr, 1fr, 1fr),
  align: (center, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Đối tượng*], [*Ghi chú*]),
  table.hline(),
  [1], [Không cho phép xóa], [Tài khoản người dùng], [Chỉ được phép thay đổi trạng thái Active\/Banned. Không xóa vĩnh viễn.],
  table.hline(),
  [2], [Không cho phép xóa], [Bài viết có bình luận], [Sinh viên không được xóa bài viết đã có bình luận. Chỉ Admin mới có quyền.],
  table.hline(),
  [3], [Không cho phép], [Tự follow chính mình], [Constraint\ CHK\_no\_self\_follow ở tầng database ngăn chặn.],
  table.hline(),
  [4], [Không cho phép chỉnh sửa], [Báo cáo đã xử lý], [Báo cáo có trạng thái Resolved không được phép thay đổi.],
  table.hline(),
  [5], [Không cho phép truy cập], [API khi tài khoản Banned], [Tài khoản bị khóa không được đăng nhập hoặc gọi API.],
  table.hline(),
  [6], [Không lưu dạng plaintext], [Mật khẩu người dùng], [Mật khẩu phải được mã hóa bằng Argon2 trước khi lưu.],
)

Bảng trách nhiệm yêu cầu an toàn:

#table(
  columns: (auto, 1fr, 1fr, 1fr, auto),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Không cho phép xóa tài khoản], [Xóa tài khoản người dùng.], [Thực hiện theo đúng yêu cầu.], [],
  table.hline(),
  [2], [Không cho phép xóa bài viết có bình luận], [Xóa bài viết.], [Thực hiện theo đúng yêu cầu.], [],
  table.hline(),
  [3], [Không cho phép tự follow], [Follow chính mình.], [Thực hiện theo đúng yêu cầu.], [],
  table.hline(),
  [4], [Không cho phép sửa báo cáo đã xử lý], [Chỉnh sửa báo cáo.], [Thực hiện theo đúng yêu cầu.], [],
  table.hline(),
  [5], [Không cho phép truy cập khi Banned], [Đăng nhập khi bị khóa.], [Thực hiện theo đúng yêu cầu.], [],
  table.hline(),
  [6], [Không lưu mật khẩu plaintext], [Cung cấp mật khẩu.], [Thực hiện theo đúng yêu cầu.], [],
)

== 3.4. Yêu cầu công nghệ

Bảng yêu cầu công nghệ:

#table(
  columns: (auto, auto, 1fr, 1fr),
  align: (center, left, left, left),
  table.header([*STT*], [*Yêu cầu*], [*Mô tả chi tiết*], [*Ghi chú*]),
  table.hline(),
  [1], [Dễ sửa lỗi], [Xác định lỗi trung bình trong 10 phút.], [Khi sửa lỗi một chức năng không ảnh hưởng đến chức năng khác.],
  table.hline(),
  [2], [Dễ bảo trì], [Thêm chức năng mới nhanh.], [Không ảnh hưởng đến chức năng đã có.],
  table.hline(),
  [3], [Nền tảng], [Web], [Sinh viên truy cập qua trình duyệt.],
  table.hline(),
  [4], [Cơ sở dữ liệu], [Microsoft SQL Server], [],
  table.hline(),
  [5], [Công nghệ Backend], [FastAPI (Python)], [],
  table.hline(),
  [6], [Công nghệ Frontend], [Next.js (React)], [],
  table.hline(),
  [7], [Môi trường triển khai], [Trên máy chủ tại chỗ hoặc Cloud], [],
)

Bảng trách nhiệm yêu cầu công nghệ:

#table(
  columns: (auto, auto, auto, 1fr, auto),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Người dùng*], [*Phần mềm*], [*Ghi chú*]),
  table.hline(),
  [1], [Vận hành Backend], [], [Cung cấp các API nhanh, bảo mật (sử dụng JWT). Xử lý logic nghiệp vụ chính xác.], [],
  table.hline(),
  [2], [Vận hành Frontend], [Tất cả], [Chạy được trên trình duyệt web hiện đại (Chrome, Edge,...).], [],
  table.hline(),
  [3], [Vận hành cơ sở dữ liệu], [], [Đảm bảo các ràng buộc và khóa ngoại được thiết lập đúng để duy trì tính toàn vẹn dữ liệu.], [],
)

== 3.5. Phân tích yêu cầu

Tổng hợp các yêu cầu đã thu thập:

#table(
  columns: (1fr, auto, 1.5fr),
  align: (left, left, left),
  table.header(
    [*Loại yêu cầu*], [*Số lượng*], [*Chi tiết*],
  ),
  table.hline(),
  [Chức năng nghiệp vụ], [25], [YC-01 → YC-25],
  [Biểu mẫu], [6], [Tài khoản, Bài viết, Bình luận, Báo cáo, Tag, Thông báo],
  [Quy định], [15], [QĐ 1.1-1.3, QĐ 2.1-2.3, QĐ 3.1, QĐ 4.1-4.2, QĐ 5.1-5.2, QĐ 6.1-6.2],
  table.hline(),
  [Phi chức năng — Hiệu quả], [6], [Đảm bảo tốc độ phản hồi < 2-3s, infinite scroll],
  [Phi chức năng — Tiện dụng], [6], [Toast, thao tác 1 click, giao diện quản trị riêng, dễ học],
  [Phi chức năng — Tương thích], [3], [Đa trình duyệt, đa thiết bị, API mở],
  [Phi chức năng — Tiến hoá], [4], [Dễ dàng thay đổi tham số phân quyền, trạng thái, thiết lập],
  table.hline(),
  [Hệ thống — Bảo mật], [25], [Ma trận phân quyền chi tiết cho 25 thao tác x 3 vai trò],
  [Hệ thống — An toàn], [6], [Chống xóa vĩnh viễn, chống SQL injection, mã hóa mật khẩu],
  table.hline(),
  [Công nghệ], [7], [Next.js, FastAPI, SQL Server, triển khai linh hoạt],
)

*Nhận xét chung:*
Qua quá trình khảo sát và phân tích, các yêu cầu của hệ thống đã được thể hiện đầy đủ, làm cơ sở vững chắc cho giai đoạn thiết kế tiếp theo. Nhìn chung:
- **Về mặt dữ liệu:** Đòi hỏi tính nhất quán, toàn vẹn dữ liệu và phương án tổ chức lưu trữ chặt chẽ, an toàn.
- **Về mặt nghiệp vụ:** Các luồng hoạt động được định nghĩa sát với thực tế, quy định rõ ràng giới hạn thao tác của từng nhóm người dùng trong hệ thống.
- **Về mặt kỹ thuật ứng dụng:** Hệ thống hướng đến kiến trúc dễ bảo trì, cho phép mở rộng quy mô trong tương lai, đồng thời ưu tiên trải nghiệm thân thiện và tính bảo mật cao đối với người dùng cuối.


#pagebreak()