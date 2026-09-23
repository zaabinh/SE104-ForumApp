= CHƯƠNG 5. THIẾT KẾ CƠ SỞ DỮ LIỆU

== 5.1. Sơ đồ lớp

#figure(
  image("../Figures/data_schema_A4_portrait.svg", width: 92%),
  caption: [Sơ đồ lớp dữ liệu và quan hệ giữa các bảng]
)

Sơ đồ lớp thể hiện bốn nhóm dữ liệu chính:

- Nhóm tài khoản và xác thực: quản lý người dùng, phiên đăng nhập, xác minh email và đặt lại mật khẩu.
- Nhóm nội dung: quản lý bài viết, tag và liên kết bài viết-tag.
- Nhóm tương tác và xã hội: quản lý bình luận, thích, lưu bài, lượt xem, chia sẻ và quan hệ theo dõi.
- Nhóm quản trị và thông báo: quản lý báo cáo vi phạm, thông báo và nhật ký thao tác quản trị.

== 5.2. Danh sách các lớp đối tượng

#table(
  columns: (auto, auto, 1.7fr),
  align: (left, left, left),
  table.header([*Lớp đối tượng*], [*Bảng dữ liệu*], [*Vai trò*]),
  table.hline(),
  [`User`], [`users`], [Lưu tài khoản, hồ sơ, vai trò, trạng thái và thông tin cá nhân hóa của người dùng.],
  [`AuthSession`], [`auth_sessions`], [Lưu phiên đăng nhập và refresh token.],
  [`EmailVerificationToken`], [`email_verification_tokens`], [Lưu token xác minh email.],
  [`PasswordResetToken`], [`password_reset_tokens`], [Lưu token đặt lại mật khẩu.],
  [`Post`], [`posts`], [Lưu bài viết, trạng thái kiểm duyệt, bài chia sẻ và tag mới được đề xuất.],
  [`Tag`], [`tags`], [Lưu danh mục tag chuẩn hóa.],
  [`PostTag`], [`post_tags`], [Lớp trung gian biểu diễn quan hệ nhiều-nhiều giữa bài viết và tag.],
  [`Comment`], [`comments`], [Lưu bình luận và trả lời bình luận.],
  [`PostLike`], [`post_likes`], [Lưu lượt thích bài viết theo từng người dùng.],
  [`Bookmark`], [`bookmarks`], [Lưu bài viết đã được người dùng đánh dấu.],
  [`PostView`], [`post_views`], [Lưu lượt xem bài viết.],
  [`PostShare`], [`post_shares`], [Lưu lượt chia sẻ bài viết.],
  [`Follow`], [`follows`], [Lưu quan hệ theo dõi giữa người dùng.],
  [`Report`], [`reports`], [Lưu báo cáo vi phạm đối với bài viết hoặc bình luận.],
  [`Notification`], [`notifications`], [Lưu thông báo gửi đến người dùng.],
  [`AdminAuditLog`], [`admin_audit_logs`], [Lưu lịch sử thao tác quản trị.],
)

== 5.3. Danh sách các quan hệ

#table(
  columns: (0.5fr, 0.5fr, 1.5fr, 1.8fr),
  align: (left, center, left, left),
  table.header([*Lớp A*], [*Quan hệ*], [*Lớp B*], [*Ý nghĩa*]),
  table.hline(),
  [`User`], [1-N], [`Post`], [Một người dùng có thể tạo nhiều bài viết.],
  [`User`], [1-N], [`AuthSession`], [Một người dùng có nhiều phiên đăng nhập.],
  [`User`], [1-N], [`EmailVerificationToken`], [Một người dùng có thể có nhiều token xác minh email theo thời gian.],
  [`User`], [1-N], [`PasswordResetToken`], [Một người dùng có thể có nhiều token đặt lại mật khẩu theo thời gian.],
  [`Post`], [1-N], [`Comment`], [Một bài viết có nhiều bình luận.],
  [`User`], [1-N], [`Comment`], [Một người dùng có thể viết nhiều bình luận.],
  [`Comment`], [1-N], [`Comment`], [Một bình luận có thể có nhiều trả lời qua `parent_id`.],
  [`Post`], [N-N], [`Tag`], [Thông qua lớp trung gian `PostTag`.],
  [`User`], [N-N], [`Post`], [Thông qua `PostLike`, mỗi người dùng chỉ thích một bài viết một lần.],
  [`User`], [N-N], [`Post`], [Thông qua `Bookmark`, mỗi người dùng chỉ lưu một bài viết một lần.],
  [`User`], [1-N], [`PostView`], [Một người dùng có thể tạo nhiều lượt xem; `user_id` nullable.],
  [`Post`], [1-N], [`PostView`], [Một bài viết có nhiều lượt xem.],
  [`User`], [1-N], [`PostShare`], [Một người dùng có thể chia sẻ nhiều bài viết; `user_id` nullable.],
  [`Post`], [1-N], [`PostShare`], [Một bài viết có nhiều lượt chia sẻ.],
  [`User`], [N-N], [`User`], [Thông qua `Follow` với `follower_id` và `following_id`.],
  [`Post`], [1-N], [`Post`], [Bài chia sẻ tham chiếu bài gốc qua `original_post_id`.],
  [`User`], [1-N], [`Report`], [Một người dùng có thể gửi nhiều báo cáo qua `reporter_id`.],
  [`Post`], [1-N], [`Report`], [Một bài viết có thể bị báo cáo nhiều lần.],
  [`Comment`], [1-N], [`Report`], [Một bình luận có thể bị báo cáo nhiều lần.],
  [`User`], [1-N], [`Report`], [Quản trị viên xử lý báo cáo qua `reviewed_by`.],
  [`User`], [1-N], [`Notification`], [Một người dùng nhận nhiều thông báo qua `user_id`.],
  [`User`], [1-N], [`Notification`], [Người tạo sự kiện thông báo được lưu qua `actor_id`.],
  [`Post`], [1-N], [`Notification`], [Thông báo có thể liên kết đến bài viết.],
  [`Comment`], [1-N], [`Notification`], [Thông báo có thể liên kết đến bình luận.],
  [`Report`], [1-N], [`Notification`], [Thông báo có thể liên kết đến báo cáo.],
  [`User`], [1-N], [`AdminAuditLog`], [Một quản trị viên có nhiều bản ghi nhật ký thao tác.],
)

== 5.4. Mô tả từng lớp đối tượng

- *`User`*

#table(
  columns: (auto, 1.2fr, 1.4fr, 1.2fr, 1fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`UNIQUEIDENTIFIER`], [Primary key,\ auto-generated], [Mã định danh người dùng.],
  [2], [`username`], [`String(50)`], [Unique,\ nullable], [Tên đăng nhập.],
  [3], [`email`], [`String(255)`], [Unique,\ not null], [Email đăng nhập.],
  [4], [`password_hash`], [`Text`], [Not null], [Mật khẩu đã băm.],
  [5], [`full_name`], [`Unicode(255)`], [Not null], [Họ tên hiển thị.],
  [6], [`avatar_url`], [`UnicodeText`], [Nullable], [Đường dẫn ảnh đại diện.],
  [7], [`bio`], [`UnicodeText`], [Nullable], [Tiểu sử cá nhân.],
  [8], [`major`], [`Unicode(120)`], [Nullable], [Chuyên ngành.],
  [9], [`academic_year`], [`String(30)`], [Nullable], [Năm học.],
  [10], [`career_goal`], [`Unicode(200)`], [Nullable], [Mục tiêu nghề nghiệp.],
  [11], [`interest_tags`], [`Text`], [Nullable], [Tag quan tâm phục vụ cá nhân hóa.],
  [12], [`role`], [`String(50)`], [Not null,\ default `Student`], [Vai trò người dùng.],
  [13], [`status`], [`String(50)`], [Not null,\ default `active`], [Trạng thái tài khoản.],
  [14], [`provider`], [`String(50)`], [Not null,\ default `local`], [Nguồn đăng nhập.],
  [15], [`is_verified`], [`Boolean`], [Not null,\ default `false`], [Trạng thái xác minh email.],
  [16], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo tài khoản.],
)

- *`AuthSession`*

#table(
  columns: (auto, 1.2fr, 1.4fr, 1.2fr, 1.2fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`UNIQUEIDENTIFIER`], [Primary key,\ auto-generated], [Mã phiên đăng nhập.],
  [2], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Người dùng sở hữu phiên.],
  [3], [`refresh_token`], [`String(512)`], [Unique,\ not null], [Token dùng để làm mới phiên.],
  [4], [`ip_address`], [`String(100)`], [Nullable], [Địa chỉ IP khi đăng nhập.],
  [5], [`user_agent`], [`String(500)`], [Nullable], [Thông tin trình duyệt/thiết bị.],
  [6], [`expires_at`], [`DateTime`], [Not null], [Thời điểm hết hạn phiên.],
  [7], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo phiên.],
)

- *`EmailVerificationToken`*

#table(
  columns: (auto, 1fr, 1.4fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`UNIQUEIDENTIFIER`], [Primary key,\ auto-generated], [Mã token xác minh email.],
  [2], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Tài khoản cần xác minh.],
  [3], [`token`], [`String(255)`], [Unique,\ not null], [Chuỗi token gửi qua email.],
  [4], [`expires_at`], [`DateTime`], [Not null], [Thời điểm hết hạn token.],
  [5], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo token.],
)

- *`PasswordResetToken`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`UNIQUEIDENTIFIER`], [Primary key,\ auto-generated], [Mã token đặt lại mật khẩu.],
  [2], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Tài khoản yêu cầu đặt lại mật khẩu.],
  [3], [`token`], [`String(255)`], [Unique,\ not null], [Chuỗi token trong liên kết đặt lại mật khẩu.],
  [4], [`expires_at`], [`DateTime`], [Not null], [Thời điểm hết hạn token.],
  [5], [`used_at`], [`DateTime`], [Nullable], [Thời điểm token đã được sử dụng.],
  [6], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo token.],
)

- *`Post`*

#table(
  columns: (0.4fr, 1.4fr, 1.3fr, 1fr, 1.1fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã bài viết.],
  [2], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Tác giả bài viết.],
  [3], [`title`], [`Unicode(255)`], [Not null], [Tiêu đề bài viết.],
  [4], [`slug`], [`String(255)`], [Unique, \ nullable], [Đường dẫn thân thiện.],
  [5], [`content`], [`UnicodeText`], [Not null], [Nội dung bài viết.],
  [6], [`cover_image`], [`Text`], [Nullable], [Ảnh bìa bài viết.],
  [7], [`status`], [`String(20)`], [Not null,\ default `pending`], [Trạng thái kiểm duyệt.],
  [8], [`original_post_id`], [`Integer`], [Foreign key to `posts`,\ nullable], [Bài gốc khi chia sẻ.],
  [9], [`share_caption`], [`UnicodeText`], [Nullable], [Chú thích khi chia sẻ bài.],
  [10], [`requested_new_tags`], [`UnicodeText`], [Nullable], [Tag mới do sinh viên đề xuất.],
  [11], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo bài viết.],
)

- *`Tag`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã tag.],
  [2], [`name`], [`String(100)`], [Unique,\ not null], [Tên tag.],
  [3], [`slug`], [`String(120)`], [Unique,\ not null], [Slug của tag.],
  [4], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo tag.],
)

- *`PostTag`*

#table(
  columns: (auto, 1fr, 1.1fr, 1.2fr, 1.8fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`post_id`], [`Integer`], [Composite primary key,\ foreign key to `posts`], [Bài viết được gắn tag.],
  [2], [`tag_id`], [`Integer`], [Composite primary key,\ foreign key to `tags`], [Tag được gắn với bài viết.],
)

- *`Comment`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã bình luận.],
  [2], [`post_id`], [`Integer`], [Foreign key to `posts`,\ not null], [Bài viết chứa bình luận.],
  [3], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Người viết bình luận.],
  [4], [`parent_id`], [`Integer`], [Foreign key to `comments`,\ nullable], [Bình luận cha khi trả lời.],
  [5], [`content`], [`UnicodeText`], [Not null], [Nội dung bình luận.],
  [6], [`created_at`], [`DateTime`], [Not null,\  default current timestamp], [Thời điểm tạo bình luận.],
)

- *`PostLike`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`user_id`], [`UNIQUEIDENTIFIER`], [Composite primary key,\ foreign key to `users`], [Người thích bài viết.],
  [2], [`post_id`], [`Integer`], [Composite primary key,\ foreign key to `posts`], [Bài viết được thích.],
  [3], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm thích bài viết.],
)

- *`Bookmark`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`user_id`], [`UNIQUEIDENTIFIER`], [Composite primary key,\ foreign key to `users`], [Người lưu bài viết.],
  [2], [`post_id`], [`Integer`], [Composite primary key,\ foreign key to `posts`], [Bài viết được lưu.],
  [3], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm lưu bài viết.],
)

- *`PostView`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã lượt xem.],
  [2], [`post_id`], [`Integer`], [Foreign key to `posts`,\ not null], [Bài viết được xem.],
  [3], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ nullable], [Người xem bài viết.],
  [4], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm xem bài viết.],
)

- *`PostShare`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã lượt chia sẻ.],
  [2], [`post_id`], [`Integer`], [Foreign key to `posts`,\ not null], [Bài viết được chia sẻ.],
  [3], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ nullable], [Người chia sẻ bài viết.],
  [4], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm chia sẻ.],
)

- *`Follow`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`follower_id`], [`UNIQUEIDENTIFIER`], [Composite primary key,\ foreign key to `users`], [Người theo dõi.],
  [2], [`following_id`], [`UNIQUEIDENTIFIER`], [Composite primary key,\ foreign key to `users`], [Người được theo dõi.],
  [3], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo quan hệ theo dõi.],
)

- *`Report`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã báo cáo.],
  [2], [`reporter_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ nullable], [Người gửi báo cáo.],
  [3], [`post_id`], [`Integer`], [Foreign key to `posts`,\ nullable], [Bài viết bị báo cáo.],
  [4], [`comment_id`], [`Integer`], [Foreign key to `comments`,\ nullable], [Bình luận bị báo cáo.],
  [5], [`reason`], [`String(100)`], [Not null], [Lý do báo cáo.],
  [6], [`details`], [`Text`], [Nullable], [Mô tả chi tiết.],
  [7], [`status`], [`String(30)`], [Not null,\ default `pending`], [Trạng thái xử lý báo cáo.],
  [8], [`reviewed_by`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ nullable], [Quản trị viên xử lý.],
  [9], [`reviewed_at`], [`DateTime`], [Nullable], [Thời điểm xử lý báo cáo.],
  [10], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo báo cáo.],
)

- *`Notification`*

#table(
  columns: (auto, 1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã thông báo.],
  [2], [`user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Người nhận thông báo.],
  [3], [`actor_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ nullable], [Người tạo sự kiện thông báo.],
  [4], [`type`], [`String(50)`], [Not null], [Loại thông báo.],
  [5], [`title`], [`String(255)`], [Not null], [Tiêu đề thông báo.],
  [6], [`message`], [`Text`], [Nullable], [Nội dung thông báo.],
  [7], [`is_read`], [`Boolean`], [Not null,\ default `false`], [Trạng thái đã đọc.],
  [8], [`post_id`], [`Integer`], [Foreign key to `posts`,\ nullable], [Bài viết liên quan.],
  [9], [`comment_id`], [`Integer`], [Foreign key to `comments`,\ nullable], [Bình luận liên quan.],
  [10], [`report_id`], [`Integer`], [Foreign key to `reports`,\ nullable], [Báo cáo liên quan.],
  [11], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm tạo thông báo.],
)

- *`AdminAuditLog`*

#table(
  columns: (auto, 1.1fr, 1.3fr, 1.2fr, 1.3fr),
  align: (center, left, left, left, left),
  table.header([*STT*], [*Thuộc tính*], [*Kiểu dữ liệu*], [*Ràng buộc*], [*Mô tả*]),
  table.hline(),
  [1], [`id`], [`Integer`], [Primary key,\ auto-increment], [Mã nhật ký quản trị.],
  [2], [`admin_user_id`], [`UNIQUEIDENTIFIER`], [Foreign key to `users`,\ not null], [Quản trị viên thực hiện thao tác.],
  [3], [`action_type`], [`String(50)`], [Not null], [Loại thao tác.],
  [4], [`target_type`], [`String(50)`], [Not null], [Loại đối tượng bị tác động.],
  [5], [`target_id`], [`String(100)`], [Not null], [Mã đối tượng bị tác động.],
  [6], [`notes`], [`Text`], [Nullable], [Ghi chú bổ sung.],
  [7], [`created_at`], [`DateTime`], [Not null,\ default current timestamp], [Thời điểm ghi nhật ký.],
)

#pagebreak()

