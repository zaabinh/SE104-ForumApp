= CHƯƠNG 6. THIẾT KẾ GIAO DIỆN

== 6.1. Danh sách các màn hình

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Màn hình*], [*Chức năng*]),
  table.hline(),
  [1], [Trang chủ], [Giới thiệu UITConnect và điều hướng người dùng đến đăng nhập hoặc đăng ký.],
  [2], [Đăng nhập/Đăng ký], [Cho phép người dùng tạo tài khoản, đăng nhập và truy cập các luồng hỗ trợ xác thực.],
  [3], [Hoàn thiện hồ sơ], [Thu thập thông tin học tập, mục tiêu nghề nghiệp và tag quan tâm sau khi người dùng xác thực.],
  [4], [Bảng tin], [Hiển thị danh sách bài viết, tìm kiếm, đổi tab bảng tin, lọc và sắp xếp nội dung.],
  [5], [Chi tiết bài viết], [Hiển thị nội dung bài viết, thông tin tác giả, bình luận và các thao tác tương tác.],
  [6], [Tạo bài viết], [Cho phép người dùng soạn nội dung, tải ảnh bìa, nhập tag, xem trước và gửi bài viết.],
  [7], [Hồ sơ người dùng], [Hiển thị thông tin cá nhân, hoạt động, bài viết và quan hệ theo dõi.],
  [8], [Quản trị], [Cung cấp thống kê, quản lý người dùng, xử lý báo cáo và duyệt bài viết chờ kiểm duyệt.],
)

== 6.2. Mô tả các màn hình

=== 6.2.1. Trang chủ

#figure(
  image("../Figures/landing.png", width: 100%),
  caption: [Màn hình Trang chủ]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Logo và tên hệ thống], [Hiển thị thương hiệu.],
  [2], [Khối giới thiệu], [Trình bày thông điệp chính của hệ thống.],
  [3], [Ảnh/khối minh họa], [Tạo cảm giác trực quan về môi trường học tập và cộng tác.],
  [4], [Khối xác thực nhanh], [Cho phép chuyển đến đăng nhập hoặc đăng ký.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Người dùng chọn đăng nhập], [Điều hướng đến `/login`.],
  [2], [Người dùng chọn đăng ký], [Điều hướng đến `/register`.],
)

=== 6.2.2. Đăng nhập/Đăng ký

#figure(
  image("../Figures/auth.png", width: 100%),
  caption: [Màn hình Đăng nhập/Đăng ký]
)

*Phần đăng nhập*

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Khối Sign in], [Khu vực đăng nhập vào UITConnect.],
  [2], [Tab Sign in], [Tab đang được chọn để hiển thị biểu mẫu đăng nhập.],
  [3], [Ô Email hoặc tên đăng nhập], [Nhập email hoặc username của tài khoản.],
  [4], [Ô Mật khẩu], [Nhập mật khẩu đăng nhập.],
  [5], [Nút Hiện mật khẩu], [Bật/tắt hiển thị nội dung mật khẩu.],
  [6], [Nút Đăng nhập], [Gửi thông tin đăng nhập đến hệ thống.],
  [7], [Liên kết Đặt lại], [Điều hướng đến màn hình quên mật khẩu/đặt lại mật khẩu.],
  [8], [Liên kết Đăng ký], [Chuyển sang biểu mẫu đăng ký tài khoản.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Người dùng nhập email/username và mật khẩu], [Cập nhật dữ liệu biểu mẫu đăng nhập trên giao diện.],
  [2], [Người dùng bấm Đăng nhập], [Gọi `POST /auth/login`; nếu hợp lệ thì lưu access token, refresh token và chuyển vào hệ thống.],
  [3], [Người dùng bấm Hiện mật khẩu], [Đổi ô mật khẩu giữa chế độ ẩn và hiện.],
  [4], [Người dùng chọn Đặt lại], [Điều hướng đến màn hình quên mật khẩu/đặt lại mật khẩu.],
  [5], [Đăng nhập thất bại], [Hiển thị lỗi từ backend như sai thông tin, chưa xác minh email hoặc tài khoản bị khóa.],
)

*Phần đăng ký*

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Khối Register], [Khu vực tạo tài khoản mới.],
  [2], [Tab Register], [Tab đang được chọn để hiển thị biểu mẫu đăng ký.],
  [3], [Ô Username], [Nhập tên đăng nhập duy nhất.],
  [4], [Ô Email], [Nhập email dùng để xác minh và đăng nhập.],
  [5], [Ô Full name], [Nhập họ tên hiển thị của người dùng.],
  [6], [Ô Password], [Nhập mật khẩu tài khoản.],
  [7], [Ô Confirm Password], [Nhập lại mật khẩu để kiểm tra khớp.],
  [8], [Nút Show password], [Bật/tắt hiển thị mật khẩu.],
  [9], [Nút Register], [Gửi thông tin đăng ký đến hệ thống.],
  [10], [Liên kết Login], [Chuyển về biểu mẫu đăng nhập.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Người dùng nhập thông tin đăng ký], [Cập nhật dữ liệu username, email, full name và mật khẩu trên giao diện.],
  [2], [Người dùng bấm Register], [Gọi `POST /auth/register`; nếu hợp lệ thì tạo tài khoản và yêu cầu xác minh email.],
  [3], [Mật khẩu xác nhận không khớp], [Hiển thị lỗi kiểm tra biểu mẫu và không gửi yêu cầu đăng ký.],
  [4], [Email hoặc username đã tồn tại], [Hiển thị lỗi từ backend để người dùng nhập thông tin khác.],
  [5], [Người dùng chọn Login], [Chuyển về biểu mẫu đăng nhập.],
)

=== 6.2.3. Hoàn thiện hồ sơ

#figure(
  image("../Figures/completepf.png", width: 89%),
  caption: [Màn hình Hoàn thiện hồ sơ]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Thông tin cá nhân], [Nhập họ tên và thông tin cơ bản.],
  [2], [Thông tin học tập], [Chọn năm học, chuyên ngành và mục tiêu nghề nghiệp.],
  [3], [Tag quan tâm], [Chọn chủ đề yêu thích để phục vụ gợi ý nội dung.],
  [4], [Nút lưu hồ sơ], [Gửi dữ liệu hoàn thiện hồ sơ.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Người dùng chọn tag], [Cập nhật danh sách `interest_tags` trên giao diện.],
  [2], [Người dùng lưu hồ sơ], [Gọi API hoàn thiện/cập nhật hồ sơ và chuyển đến bảng tin hoặc hồ sơ.],
  [3], [Thiếu thông tin bắt buộc], [Hiển thị lỗi để người dùng bổ sung.],
)

=== 6.2.4. Bảng tin

#figure(
  image("../Figures/feed.png", width: 100%),
  caption: [Màn hình Bảng tin]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Sidebar], [Điều hướng đến bảng tin, hồ sơ, bài đã lưu, cài đặt và quản trị nếu có quyền.],
  [2], [Topbar tìm kiếm], [Nhập từ khóa để tìm bài viết.],
  [3], [Tab bảng tin], [Chuyển giữa For You, Following và Trending.],
  [4], [Danh sách bài viết], [Hiển thị các PostCard kèm tag, tác giả và số liệu tương tác.],
  [5], [Bộ lọc/sắp xếp], [Lọc theo tag và sắp xếp theo mới nhất, xu hướng, nhiều like hoặc nhiều bình luận.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Nhập từ khóa], [Debounce từ khóa rồi gọi API feed với tham số tìm kiếm.],
  [2], [Đổi tab bảng tin], [Gọi API theo chế độ For You, Following hoặc Trending.],
  [3], [Chọn tag/sắp xếp], [Cập nhật tham số truy vấn và tải lại danh sách bài viết.],
  [4], [Chọn bài viết], [Điều hướng đến trang chi tiết bài viết.],
  [5], [Cuộn danh sách], [Tải thêm trang dữ liệu nếu còn nội dung.],
)

=== 6.2.5. Chi tiết bài viết

#figure(
  image("../Figures/post.png", width: 80%),
  caption: [Màn hình Chi tiết bài viết]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Nội dung bài viết], [Hiển thị tiêu đề, tác giả, tag, nội dung và ảnh bìa.],
  [2], [Cụm hành động], [Thích, lưu, chia sẻ và báo cáo bài viết.],
  [3], [Khối tác giả], [Hiển thị thông tin tác giả và liên kết đến hồ sơ.],
  [4], [Khu vực bình luận], [Hiển thị bình luận, trả lời bình luận và ô nhập bình luận mới.],
  [5], [Bài viết liên quan], [Gợi ý các bài viết có nội dung hoặc tag tương tự.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Thích/lưu bài], [Gọi API toggle like hoặc bookmark và cập nhật trạng thái hiển thị.],
  [2], [Gửi bình luận], [Gọi API tạo bình luận, sau đó thêm bình luận vào danh sách.],
  [3], [Trả lời bình luận], [Tạo bình luận có `parent_id`.],
  [4], [Báo cáo nội dung], [Mở biểu mẫu báo cáo và gửi lý do vi phạm.],
  [5], [Chia sẻ bài viết], [Điều hướng đến màn hình chia sẻ bài.],
)

=== 6.2.6. Tạo bài viết

#figure(
  image("../Figures/createpost.png", width: 90%),
  caption: [Màn hình Tạo bài viết]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Tiêu đề màn hình], [Hiển thị tên chức năng `Create post` và mô tả ngắn về việc soạn bài.],
  [2], [Ô Title], [Nhập tiêu đề bài viết.],
  [3], [Ô Content], [Nhập nội dung chính của bài viết.],
  [4], [Khu vực Cover image], [Tải ảnh bìa từ máy người dùng để hiển thị trong phần xem trước.],
  [5], [Ô Tags và nút Add tag], [Nhập tag và thêm tag vào bài viết.],
  [6], [Khối Recommendations], [Gợi ý các tag có sẵn để người dùng chọn nhanh.],
  [7], [Khối Preview post], [Hiển thị bản xem trước gồm tag, tiêu đề, ảnh bìa và nội dung.],
  [8], [Nút Publish post], [Gửi bài viết mới đến hệ thống.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Người dùng nhập tiêu đề hoặc nội dung], [Cập nhật dữ liệu bản nháp và đồng bộ phần Preview post.],
  [2], [Người dùng tải ảnh bìa], [Đọc ảnh cục bộ và hiển thị ảnh trong khung preview.],
  [3], [Người dùng nhập tag và bấm Add tag], [Thêm tag vào danh sách tag của bài viết và cập nhật preview.],
  [4], [Người dùng chọn tag gợi ý], [Đưa tag được chọn từ Recommendations vào danh sách tag.],
  [5], [Người dùng bấm Publish post], [Gọi API tạo bài viết với `title`, `content`, `cover_image`, `tags`; nếu là sinh viên, bài được gửi vào trạng thái `pending`.],
  [6], [Thiếu tiêu đề hoặc nội dung], [Không gửi bài và yêu cầu người dùng bổ sung dữ liệu bắt buộc.],
  [7], [Tạo bài thất bại], [Hiển thị thông báo lỗi `Failed to publish post`.],
)

=== 6.2.7. Hồ sơ người dùng

#figure(
  image("../Figures/pf.png", width: 100%),
  caption: [Màn hình Hồ sơ người dùng]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Ảnh bìa hồ sơ], [Hiển thị vùng nền lớn ở đầu trang hồ sơ.],
  [2], [Ảnh đại diện], [Hiển thị avatar hoặc chữ viết tắt của người dùng.],
  [3], [Tên và username], [Hiển thị tên người dùng và định danh như `@admin`.],
  [4], [Tiểu sử], [Hiển thị mô tả cá nhân; nếu chưa có thì hiển thị trạng thái chưa nhập bio.],
  [5], [Thông tin học tập/nghề nghiệp], [Hiển thị Major, Academic year và Career goal.],
  [6], [Interests], [Hiển thị các tag quan tâm của người dùng.],
  [7], [Thống kê hồ sơ], [Hiển thị số bài viết, followers và following.],
  [8], [Nút Edit profile], [Cho phép chủ hồ sơ chuyển đến màn hình chỉnh sửa hồ sơ.],
  [9], [Thanh tab], [Chuyển giữa Posts, About, Activity và Saved posts.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Mở màn hình hồ sơ], [Gọi API lấy thông tin người dùng, thống kê và dữ liệu tab mặc định.],
  [2], [Chọn Edit profile], [Điều hướng đến `/profile/edit` để cập nhật thông tin cá nhân.],
  [3], [Chọn tab Posts], [Hiển thị danh sách bài viết của người dùng.],
  [4], [Chọn tab About], [Hiển thị thông tin giới thiệu, học tập, mục tiêu nghề nghiệp và tag quan tâm.],
  [5], [Chọn tab Activity], [Hiển thị hoạt động gần đây của người dùng.],
  [6], [Chọn tab Saved posts], [Hiển thị danh sách bài viết đã lưu của chính người dùng.],
  [7], [Chọn một bài viết trong tab], [Điều hướng đến màn hình chi tiết bài viết.],
)

=== 6.2.8. Quản trị

#figure(
  image("../Figures/admin.png", width: 100%),
  caption: [Màn hình Quản trị]
)

#table(
  columns: (auto, 1.2fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Đối tượng*], [*Mô tả*]),
  table.hline(),
  [1], [Sidebar quản trị], [Hiển thị các mục điều hướng như New post, For You, Following, Trending, Bookmarks, Settings, Admin và Logout.],
  [2], [Topbar], [Hiển thị ô tìm kiếm, nút đổi ngôn ngữ, biểu tượng ứng dụng, thông báo và tài khoản admin.],
  [3], [Thẻ thống kê], [Hiển thị Users (7d), Posts (7d), Comments (7d), Reports pending và Posts pending.],
  [4], [Khu vực Users], [Cho phép tìm kiếm username/email, lọc trạng thái, áp dụng bộ lọc và xem danh sách người dùng.],
  [5], [Bảng Users], [Hiển thị Username, Email, Status và Action cho từng tài khoản.],
  [6], [Nút Ban/Unban], [Khóa hoặc mở khóa tài khoản người dùng.],
  [7], [Khu vực Reports], [Lọc báo cáo theo trạng thái và hiển thị các cột ID, Target, Reason, Details, Status, Action.],
  [8], [Khu vực Pending Post Moderation], [Hiển thị bài viết chờ duyệt với Post ID, Title, New tags, Status và Action.],
  [9], [Phân trang], [Di chuyển giữa các trang dữ liệu của Users, Reports và Pending Post Moderation.],
)

#table(
  columns: (auto, 1.4fr, 2fr),
  align: (center, left, left),
  table.header([*STT*], [*Biến cố*], [*Xử lý*]),
  table.hline(),
  [1], [Mở màn hình Admin], [Gọi song song API thống kê, danh sách người dùng, danh sách báo cáo và bài viết chờ duyệt.],
  [2], [Nhập từ khóa tìm user], [Cập nhật ô tìm kiếm username/email trong khu vực Users.],
  [3], [Chọn trạng thái user và bấm Apply], [Gọi lại API danh sách người dùng theo từ khóa và trạng thái đã chọn.],
  [4], [Bấm Ban/Unban], [Gọi API khóa hoặc mở khóa tài khoản, sau đó tải lại bảng Users; backend ghi audit log và tạo notification.],
  [5], [Chọn trạng thái report và bấm Apply], [Gọi lại API danh sách báo cáo theo trạng thái đã chọn.],
  [6], [Bấm Resolve/Dismiss report], [Cập nhật trạng thái report, ghi audit log và thông báo cho người gửi báo cáo.],
  [7], [Bấm Approve bài pending], [Duyệt bài viết, tạo tag mới nếu cần, đổi trạng thái bài sang `active` và ghi nhật ký quản trị.],
  [8], [Bấm Reject bài pending], [Từ chối bài viết, đổi trạng thái bài sang `rejected` và ghi nhật ký quản trị.],
  [9], [Bấm Prev/Next], [Thay đổi trang dữ liệu và tải lại danh sách tương ứng.],
)

#pagebreak()
