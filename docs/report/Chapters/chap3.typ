= CHƯƠNG 3. ĐẶC TẢ VÀ PHÂN TÍCH YÊU CẦU

== 3.1. Yêu cầu chức năng

=== 3.1.1. Danh sách nghiệp vụ

#table(
  columns: (0.5fr, 1fr, 1fr, 0.5fr, 0.5fr, 1fr),
  align: (center, left, left, center, center, left),
  table.header([*STT*], [*Nghiệp vụ*], [*Thao tác cụ thể*], [*Biểu mẫu*], [*Quy định*], [*Ghi chú*]),
  table.hline(),
  [1], table.cell(rowspan: 4)[Quản lý xác thực], [Đăng ký tài khoản], [BM1], [QĐ 1.1, QĐ 1.2], [Tạo tài khoản và token xác minh email],
  [2], [Đăng nhập], [BM1], [QĐ 1.3, QĐ 1.4], [Hỗ trợ email\/username, JWT access token và refresh token],
  [3], [Đăng xuất], [], [], [Thu hồi refresh token trong `auth_sessions`],
  [4], [Quên mật khẩu], [BM1], [QĐ 1.5], [Gửi token đặt lại mật khẩu, dùng một lần],
  table.hline(),
  [5], table.cell(rowspan: 4)[Quản lý bài viết], [Tạo bài viết], [BM2], [QĐ 2.1, QĐ 2.2], [Sinh viên tạo bài `pending`; admin duyệt để hiển thị],
  [6], [Chỉnh sửa bài viết], [BM2], [QĐ 2.3], [Chỉ tác giả được sửa; sau khi sửa bài về `pending`],
  [7], [Xóa bài viết], [], [QĐ 2.4], [Tác giả hoặc admin; sinh viên không xóa bài đã có comment],
  [8], [Xem chi tiết bài viết], [], [QĐ 2.5], [Ghi nhận lượt xem và trả thống kê tương tác],
  table.hline(),
  [9], table.cell(rowspan: 4)[Quản lý bảng tin], [Xem bảng tin], [], [], [Hỗ trợ For You, Following, Trending và phân trang],
  [10], [Tìm kiếm bài viết], [], [], [Tìm theo tiêu đề và nội dung],
  [11], [Lọc bài viết theo tag], [], [], [Dựa trên bảng `post_tags`],
  [12], [Sắp xếp bài viết], [], [], [Latest, trending,\ most-liked,\ most-commented],
  table.hline(),
  [13], table.cell(rowspan: 6)[Quản lý tương tác], [Like bài viết], [], [QĐ 3.1, QĐ 3.2], [Toggle like, tạo notification nếu phù hợp],
  [14], [Bookmark bài viết], [], [QĐ 3.3], [Toggle bookmark cá nhân],
  [15], [Chia sẻ bài viết], [BM2], [], [Tạo bản ghi share và bài viết chia sẻ mới],
  [16], [Bình luận bài viết], [BM3], [QĐ 3.4], [Tạo comment cấp 1],
  [17], [Trả lời bình luận], [BM3], [QĐ 3.4, QĐ 3.5], [Tạo comment có `parent_id`],
  [18], [Báo cáo nội dung], [BM4], [QĐ 4.1, QĐ 4.2], [Báo cáo bài viết hoặc bình luận, chống trùng],
  table.hline(),
  [19], table.cell(rowspan: 3)[Quản lý hồ sơ \& xã hội], [Xem hồ sơ người dùng], [], [], [Hồ sơ công khai theo username],
  [20], [Chỉnh sửa hồ sơ], [BM1], [], [Cập nhật avatar, bio, chuyên ngành, năm học, mục tiêu, tag quan tâm],
  [21], [Follow\/Unfollow], [BM5], [QĐ 5.1, QĐ 5.2], [Không được tự follow],
  table.hline(),
  [22], table.cell(rowspan: 3)[Quản trị hệ thống], [Quản lý người dùng], [BM1], [QĐ 1.6], [Tìm kiếm, lọc, ban\/unban và ghi audit log],
  [23], [Kiểm duyệt nội dung], [BM2, BM4], [QĐ 2.6, QĐ 4.3], [Xử lý report và duyệt bài `pending`],
  [24], [Quản lý tags], [BM7], [QĐ 7.1, QĐ 7.2], [Thêm, sửa, xóa tag; hỗ trợ duyệt tag mới từ bài pending],
  table.hline(),
  [25], [Thông báo], [Xem thông báo], [BM6], [QĐ 6.1, QĐ 6.2], [Xem và đánh dấu đã đọc],
)

=== 3.1.2. Biểu mẫu và quy định

*BM1. Tài khoản, xác thực và hồ sơ người dùng*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`id`], [`UNIQUEIDENTIFIER`], [Định danh người dùng], [Khóa chính, tự sinh],
  [`username`], [`VARCHAR(50)`], [Tên định danh công khai], [Duy nhất, 3-50 ký tự, bắt buộc khi complete profile],
  [`email`], [`VARCHAR(255)`], [Email đăng nhập], [Duy nhất, đúng định dạng],
  [`password_hash`], [`TEXT`], [Mật khẩu đã hash], [Argon2, không lưu plaintext],
  [`full_name`], [`NVARCHAR(255)`], [Tên hiển thị], [2-255 ký tự],
  [`avatar_url`], [`NVARCHAR(MAX)`], [Ảnh đại diện], [Tùy chọn],
  [`bio`], [`NVARCHAR(MAX)`], [Tiểu sử], [Tùy chọn],
  [`major`], [`NVARCHAR(120)`], [Chuyên ngành], [Tùy chọn],
  [`academic_year`], [`VARCHAR(30)`], [Năm học], [Tùy chọn],
  [`career_goal`], [`NVARCHAR(200)`], [Mục tiêu nghề nghiệp], [Tùy chọn],
  [`interest_tags`], [`TEXT`], [Tag quan tâm], [Tối đa 20 tag từ request complete profile],
  [`role`], [`VARCHAR(50)`], [Vai trò], [`Student` hoặc `Admin`, mặc định `Student`],
  [`status`], [`VARCHAR(50)`], [Trạng thái tài khoản], [`active`, `banned`, `deleted`; mặc định `active`],
  [`provider`], [`VARCHAR(50)`], [Nguồn xác thực], [`local` hoặc `google`],
  [`is_verified`], [`BIT`], [Đã xác minh email], [Mặc định false],
)

*Quy định BM1:*
- _QĐ 1.1:_ Username và email không được trùng lặp. Hệ thống chuẩn hóa dữ liệu trước khi kiểm tra.
- _QĐ 1.2:_ Khi đăng ký thành công, hệ thống tạo token xác minh email. Tài khoản chỉ được đăng nhập đầy đủ sau khi `is_verified = true`.
- _QĐ 1.3:_ Người dùng có thể đăng nhập bằng email hoặc username. Nếu hợp lệ, hệ thống cấp access token và refresh token.
- _QĐ 1.4:_ Tài khoản `banned` hoặc `deleted` không được đăng nhập hoặc gọi API bảo vệ.
- _QĐ 1.5:_ Token đặt lại mật khẩu dùng một lần và có thời hạn. Sau khi reset mật khẩu thành công, các phiên đăng nhập cũ bị thu hồi.
- _QĐ 1.6:_ Admin có thể khóa/mở khóa tài khoản người dùng thường, nhưng không được tự khóa tài khoản của mình và không được khóa tài khoản admin khác.

*Dữ liệu xác thực liên quan:*
- Đăng nhập sử dụng `identifier` và `password`.
- Refresh token và logout sử dụng `refresh_token`.
- Xác minh email sử dụng `token` xác minh.
- Quên mật khẩu sử dụng `email`; đặt lại mật khẩu sử dụng `token` và `password` mới.
- Hoàn thiện hồ sơ sử dụng `username`, `full_name`, `avatar_url`, `bio`, `major`, `academic_year`, `career_goal`, `interest_tags`.

*BM2. Bài viết*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`id`], [`INT`], [Định danh bài viết], [Khóa chính, tự tăng],
  [`user_id`], [`UNIQUEIDENTIFIER`], [Tác giả], [FK tới `users.id`],
  [`title`], [`NVARCHAR(255)`], [Tiêu đề], [5-255 ký tự],
  [`slug`], [`VARCHAR(255)`], [Slug từ tiêu đề], [Tự tạo, duy nhất],
  [`content`], [`NVARCHAR(MAX)`], [Nội dung bài viết], [Bắt buộc],
  [`cover_image`], [`TEXT`], [Ảnh bìa], [Tùy chọn],
  [`status`], [`VARCHAR(20)`], [Trạng thái kiểm duyệt], [`pending`, `active`, `rejected`],
  [`original_post_id`], [`INT`], [Bài gốc khi chia sẻ], [Tùy chọn, FK tới `posts.id`],
  [`share_caption`], [`NVARCHAR(MAX)`], [Chú thích khi share], [Tối đa 2000 ký tự ở request],
  [`requested_new_tags`], [`NVARCHAR(MAX)`], [Tag mới sinh viên đề xuất], [Lưu JSON array],
  [`created_at`], [`DATETIME`], [Thời điểm tạo], [Tự động],
)

*Quy định BM2:*
- _QĐ 2.1:_ Mỗi bài viết có thể gắn nhiều tag; mỗi tag có thể thuộc nhiều bài viết thông qua bảng `post_tags`.
- _QĐ 2.2:_ Sinh viên tạo bài ở trạng thái `pending`; admin tạo bài ở trạng thái `active`.
- _QĐ 2.3:_ Chỉ tác giả được chỉnh sửa bài viết của mình. Khi sinh viên chỉnh sửa, bài viết chuyển về `pending` để chờ duyệt lại.
- _QĐ 2.4:_ Sinh viên chỉ được xóa bài viết của mình và không được xóa bài đã có bình luận. Admin có thể xóa bất kỳ bài viết nào.
- _QĐ 2.5:_ Khi xem chi tiết bài viết, hệ thống ghi nhận lượt xem bằng bảng `post_views` và trả về thống kê tương tác.
- _QĐ 2.6:_ Admin duyệt bài `pending` thành `active` hoặc từ chối thành `rejected`. Nếu bài có tag mới, tag được lưu trong `requested_new_tags` và chỉ được tạo chính thức khi admin duyệt.
- _QĐ 2.7:_ Feed chỉ hiển thị bài viết có trạng thái `active`.
- _QĐ 2.8:_ Chia sẻ bài viết tạo bản ghi `post_shares` và tạo một bài viết mới có `original_post_id` trỏ về bài gốc.

*BM3. Bình luận*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`id`], [`INT`], [Định danh bình luận], [Khóa chính, tự tăng],
  [`post_id`], [`INT`], [Bài viết], [FK tới `posts.id`],
  [`user_id`], [`UNIQUEIDENTIFIER`], [Người bình luận], [FK tới `users.id`],
  [`parent_id`], [`INT`], [Bình luận cha], [Tùy chọn, FK tới `comments.id`],
  [`content`], [`NVARCHAR(MAX)`], [Nội dung], [Không được trống],
  [`created_at`], [`DATETIME`], [Thời điểm tạo], [Tự động],
)

*Quy định BM3:*
- _QĐ 3.4:_ Bình luận gốc có `parent_id = NULL`; trả lời bình luận có `parent_id` trỏ đến bình luận cha.
- _QĐ 3.5:_ Trả lời bình luận phải tham chiếu bình luận cha tồn tại trong cùng bài viết.
- Khi có comment/reply, hệ thống tạo notification cho tác giả bài viết hoặc tác giả comment cha nếu không phải tự tương tác.

*Quy định tương tác không có biểu mẫu riêng:*
- _QĐ 3.1:_ Mỗi người dùng chỉ được like một bài viết một lần; bấm lại sẽ hủy like.
- _QĐ 3.2:_ Like của chính tác giả vẫn được ghi nhận nhưng không tạo notification cho bản thân.
- _QĐ 3.3:_ Mỗi người dùng chỉ được bookmark một bài viết một lần; bấm lại sẽ hủy bookmark.

*BM4. Báo cáo vi phạm*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`id`], [`INT`], [Định danh báo cáo], [Khóa chính],
  [`reporter_id`], [`UNIQUEIDENTIFIER`], [Người báo cáo], [FK tới users],
  [`post_id`], [`INT`], [Bài bị báo cáo], [Tùy chọn],
  [`comment_id`], [`INT`], [Bình luận bị báo cáo], [Tùy chọn],
  [`reason`], [`VARCHAR(100)`], [Lý do], [`spam`, `harassment`, `hate_speech`, `violence`, `misinformation`, `other`],
  [`details`], [`TEXT`], [Mô tả chi tiết], [Tối đa 2000 ký tự],
  [`status`], [`VARCHAR(30)`], [Trạng thái xử lý], [`pending`, `reviewed`, `dismissed`, `resolved`],
  [`reviewed_by`], [`UNIQUEIDENTIFIER`], [Admin xử lý], [Tùy chọn],
  [`reviewed_at`], [`DATETIME`], [Thời điểm xử lý], [Tùy chọn],
)

*Quy định BM4:*
- _QĐ 4.1:_ Mỗi report nhắm vào một bài viết hoặc một bình luận.
- _QĐ 4.2:_ Một người dùng không được báo cáo trùng cùng một nội dung.
- _QĐ 4.3:_ Khi admin xử lý report, hệ thống cập nhật trạng thái, lưu người xử lý, thời điểm xử lý, tạo audit log và notification.

*BM5. Quan hệ theo dõi*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`follower_id`], [`UNIQUEIDENTIFIER`], [Người thực hiện theo dõi], [FK tới `users.id`],
  [`following_id`], [`UNIQUEIDENTIFIER`], [Người được theo dõi], [FK tới `users.id`],
  [`created_at`], [`DATETIME`], [Thời điểm tạo quan hệ], [Tự động],
)

*Quy định BM5:*

- _QĐ 5.1:_ Người dùng không được follow chính mình.
- _QĐ 5.2:_ Mỗi cặp `follower_id` và `following_id` chỉ tồn tại một quan hệ follow; thao tác follow/unfollow hoạt động theo cơ chế toggle.

*BM6. Thông báo*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`id`], [`INT`], [Định danh thông báo], [Khóa chính],
  [`user_id`], [`UNIQUEIDENTIFIER`], [Người nhận], [Bắt buộc],
  [`actor_id`], [`UNIQUEIDENTIFIER`], [Người tạo sự kiện], [Tùy chọn],
  [`type`], [`VARCHAR(50)`], [Loại thông báo], [Ví dụ: `post_like`, `post_comment`, `comment_reply`, `post_share`, `report_update`, `account_status`],
  [`title`], [`VARCHAR(255)`], [Tiêu đề], [Bắt buộc],
  [`message`], [`TEXT`], [Nội dung], [Tùy chọn],
  [`is_read`], [`BIT`], [Đã đọc], [Mặc định false],
  [`post_id`], [`INT`], [Bài liên quan], [Tùy chọn],
  [`comment_id`], [`INT`], [Bình luận liên quan], [Tùy chọn],
  [`report_id`], [`INT`], [Report liên quan], [Tùy chọn],
)

BM6 là cấu trúc dữ liệu trả về khi người dùng xem thông báo, không phải form nhập liệu trực tiếp.

*Quy định BM6:*
- _QĐ 6.1:_ Thông báo được tạo tự động khi có tương tác hoặc thao tác quản trị liên quan đến người dùng.
- _QĐ 6.2:_ Người dùng có thể đánh dấu thông báo là đã đọc bằng cách cập nhật `is_read = true`.

*BM7. Tag*

#table(
  columns: (auto, auto, 1.4fr, 1.4fr),
  align: (left, left, left, left),
  table.header([*Trường*], [*Kiểu dữ liệu*], [*Mô tả*], [*Ràng buộc*]),
  table.hline(),
  [`id`], [`INT`], [Định danh tag], [Khóa chính, tự tăng],
  [`name`], [`NVARCHAR(100)`], [Tên tag], [Duy nhất, chuẩn hóa chữ thường],
  [`slug`], [`VARCHAR(120)`], [Slug của tag], [Tự tạo, duy nhất],
  [`created_at`], [`DATETIME`], [Thời điểm tạo tag], [Tự động],
)

*Quy định BM7:*
- _QĐ 7.1:_ Tên tag không được trùng lặp trong hệ thống. Hệ thống chuẩn hóa tên tag về chữ thường.
- _QĐ 7.2:_ Chỉ admin mới có quyền thêm, sửa, xóa tag.

== 3.2. Yêu cầu phi chức năng

=== 3.2.1. Hiệu năng

#table(
  columns: (auto, 1.2fr, 1.8fr),
  align: (center, left, left),
  table.header([*STT*], [*Yêu cầu*], [*Mô tả*]),
  table.hline(),
  [1], [Phản hồi nhanh], [Các thao tác đăng nhập, đăng bài, tương tác và cập nhật hồ sơ nên phản hồi trong 2-3 giây ở môi trường phát triển hoặc thử nghiệm.],
  [2], [Phân trang], [Bảng tin, danh sách người dùng quản trị, báo cáo và bài chờ duyệt dùng `page`, `page_size` để tránh trả dữ liệu quá lớn trong một lần.],
  [3], [Giảm số lần tìm kiếm], [Ô tìm kiếm chờ 350ms sau khi người dùng ngừng nhập rồi mới gửi yêu cầu, giúp giảm số lần gọi máy chủ.],
  [4], [Tính số liệu khi truy vấn], [Số lượt thích, bình luận, xem và chia sẻ được tính từ các bảng tương tác thay vì lưu dư thừa trong bảng bài viết.],
)

=== 3.2.2. Bảo mật

#table(
  columns: (auto, 1.2fr, 1.8fr),
  align: (center, left, left),
  table.header([*STT*], [*Yêu cầu*], [*Mô tả*]),
  table.hline(),
  [1], [Mã hóa mật khẩu], [Mật khẩu được băm bằng Argon2, không lưu mật khẩu dạng văn bản gốc.],
  [2], [Mã xác thực và phiên đăng nhập], [Access token dùng để xác thực yêu cầu; refresh token được lưu trong cơ sở dữ liệu để có thể thu hồi khi đăng xuất hoặc đặt lại mật khẩu.],
  [3], [Xác minh email], [Tài khoản đăng ký bằng email phải xác minh email trước khi sử dụng đầy đủ chức năng.],
  [4], [Phân quyền], [Các đường dẫn API quản trị yêu cầu vai trò admin; các đường dẫn nghiệp vụ yêu cầu người dùng đang hoạt động, đã xác minh email và đã hoàn thiện hồ sơ.],
  [5], [Kiểm tra quyền sở hữu], [Sửa/xóa bài viết và xem danh sách bài đã lưu phải kiểm tra quyền của người dùng hiện tại.],
  [6], [Kiểm soát nguồn truy cập], [Backend chỉ cho phép các nguồn frontend được khai báo trong biến môi trường `CORS_ALLOWED_ORIGINS`.],
)

=== 3.2.3. Tiện dụng

- Giao diện web tự thích nghi với nhiều kích thước màn hình, hỗ trợ máy tính và điện thoại.
- Thanh điều hướng bên có trạng thái thu gọn và lưu lựa chọn của người dùng trên trình duyệt.
- Bảng tin hỗ trợ tìm kiếm, lọc, sắp xếp và tải thêm bài khi cuộn trang.
- Người dùng nhận được thông báo phản hồi sau các thao tác như thích bài, lưu bài, báo cáo nội dung hoặc cập nhật hồ sơ.
- Trang quản trị cung cấp bảng dữ liệu, bộ lọc và thống kê tổng quan.

=== 3.2.4. Tương thích và triển khai

- Giao diện người dùng chạy trên các trình duyệt hiện đại như Chrome, Edge, Firefox.
- Máy chủ cung cấp API dạng REST để giao diện web hiện tại hoặc các ứng dụng khác trong tương lai có thể sử dụng lại.
- Hệ thống có tệp Docker cho frontend/backend và cấu hình Docker Compose để chạy cùng SQL Server.
- Các biến môi trường bắt buộc gồm `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`.

== 3.3. Phân tích trách nhiệm

Sau khi xác định danh sách nghiệp vụ, biểu mẫu và quy định, bảng sau phân chia trách nhiệm giữa người dùng và phần mềm theo từng nhóm chức năng chính. Cách phân chia này giúp làm rõ dữ liệu nào do người dùng cung cấp và phần nào do hệ thống tự kiểm tra, xử lý, lưu trữ.

#table(
  columns: (auto, 1.1fr, 1.6fr, 1.8fr),
  align: (center, left, left, left),
  table.header([*STT*], [*Nhóm*], [*Người dùng*], [*Phần mềm*]),
  table.hline(),
  [1], [Quản lý xác thực], [Cung cấp email, tên đăng nhập, mật khẩu hoặc tài khoản Google.], [Kiểm tra dữ liệu, băm mật khẩu, tạo mã xác thực, lưu phiên đăng nhập và kiểm tra trạng thái tài khoản.],
  [2], [Quản lý bài viết], [Nhập tiêu đề, nội dung, ảnh bìa, tag hoặc chú thích khi chia sẻ.], [Tạo đường dẫn thân thiện, xác định trạng thái kiểm duyệt, đồng bộ tag và kiểm tra quyền sửa/xóa.],
  [3], [Quản lý bảng tin], [Chọn chế độ xem, nhập từ khóa, chọn tag và tiêu chí sắp xếp.], [Truy vấn bài viết đang hiển thị, phân trang, tính thống kê tương tác và trạng thái đã thích/đã lưu của người dùng hiện tại.],
  [4], [Quản lý tương tác], [Thực hiện thích bài, lưu bài, chia sẻ, bình luận, trả lời, báo cáo và theo dõi người dùng.], [Ghi nhận tương tác, chống thao tác trùng, tạo thông báo và cập nhật dữ liệu liên quan.],
  [5], [Quản lý hồ sơ \& xã hội], [Cập nhật hồ sơ, xem hồ sơ người khác, theo dõi/hủy theo dõi và xem thông báo.], [Lưu thông tin hồ sơ, kiểm tra quan hệ theo dõi, trả dữ liệu hoạt động cá nhân và đánh dấu thông báo đã đọc.],
  [6], [Quản trị hệ thống], [Lọc dữ liệu, khóa/mở khóa tài khoản, xử lý báo cáo, duyệt bài chờ kiểm duyệt và quản lý tag.], [Kiểm tra vai trò quản trị viên, cập nhật cơ sở dữ liệu, ghi nhật ký quản trị và tạo thông báo cho người dùng liên quan.],
)

== 3.4. Tổng kết yêu cầu

#table(
  columns: (1.2fr, auto, 2fr),
  align: (left, center, left),
  table.header([*Loại yêu cầu*], [*Số lượng*], [*Ghi chú*]),
  table.hline(),
  [Nghiệp vụ chức năng], [25], [Giữ theo danh sách nghiệp vụ chính của hệ thống; các luồng bổ sung như xác minh email, đăng nhập Google, duyệt bài và gợi ý nội dung được mô tả trong ghi chú, quy định hoặc phần mở rộng.],
  [Biểu mẫu chính], [7], [Tài khoản/hồ sơ, bài viết, bình luận, báo cáo, quan hệ theo dõi, thông báo và tag.],
  [Nhóm phi chức năng], [4], [Hiệu năng, bảo mật, tiện dụng, tương thích và triển khai.],
  [Vai trò người dùng], [3], [Khách, Sinh viên, Quản trị viên.],
)

Như vậy, chương 3 đã xác định đầy đủ phạm vi yêu cầu của hệ thống ở mức nghiệp vụ, dữ liệu nhập/xuất, quy định xử lý và yêu cầu chất lượng. Đây là cơ sở để chuyển sang chương thiết kế hệ thống, nơi các yêu cầu được cụ thể hóa thành kiến trúc, mô hình dữ liệu và luồng xử lý.

#pagebreak()
