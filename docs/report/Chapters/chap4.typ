= CHƯƠNG 4. THIẾT KẾ VÀ MÔ HÌNH HÓA YÊU CẦU

== 4.1. Xác định tác nhân (Actors)

Hệ thống Forum Sinh viên có ba tác nhân chính tương tác với hệ thống:

#table(
  columns: (auto, auto, 1fr),
  align: (center, left, left),
  table.header([*Tác nhân*], [*Loại*], [*Mô tả*]),
  table.hline(),
  [Khách (Guest)], [Primary], [Người truy cập chưa đăng nhập. Chỉ có thể đăng ký, đăng nhập và yêu cầu đặt lại mật khẩu.],
  table.hline(),
  [Sinh viên (Student)], [Primary], [Người dùng đã đăng nhập. Có thể đăng bài, tương tác, quản lý hồ sơ và xem thông báo.],
  table.hline(),
  [Quản trị viên (Admin)], [Primary], [Kế thừa toàn bộ quyền của Sinh viên, đồng thời có thêm quyền quản lý người dùng, kiểm duyệt nội dung và quản lý tag.],
)

Quan hệ giữa các tác nhân: *Admin kế thừa (generalization) từ Sinh viên*, nghĩa là Admin có thể thực hiện tất cả chức năng mà Sinh viên có, cộng thêm các chức năng quản trị riêng.

== 4.2. Sơ đồ Use Case

=== 4.2.1. Sơ đồ Use Case tổng quan

#figure(
  image("../Figures/uc_overview.png"),
  caption: [Sơ đồ Use Case tổng quan — Hệ thống Quản lý Forum Sinh viên]
)

Sơ đồ tổng quan mô tả mối quan hệ giữa ba tác nhân:
- Khách
- Sinh viên
- Admin
với các nhóm chức năng chính của hệ thống. Hệ thống được chia thành 5 package:

#table(
  columns: (auto, auto, auto, auto),
  align: (center, left, left, left),
  table.header([*STT*], [*Package*], [*Use Case*], [*Mô tả*]),
  table.hline(),
  [1], [Bài viết], [UC-05 → UC-08], [Quản lý CRUD bài viết],
  table.hline(),
  [2], [Bảng tin], [UC-09 → UC-12], [Xem feed, tìm kiếm, lọc, sắp xếp],
  table.hline(),
  [3], [Tương tác], [UC-13 → UC-18], [Like, bookmark, share, comment, reply, report],
  table.hline(),
  [4], [Hồ sơ \& Xã hội], [UC-19 → UC-21, UC-25], [Profile, follow, thông báo],
  table.hline(),
  [5], [Quản trị], [UC-22 → UC-24], [Quản lý user, kiểm duyệt, tags],
)

=== 4.2.2. Quan hệ giữa các Use Case

#table(
  columns: (auto, 1fr, 1fr, 1fr),
  align: (center, left, left, left),
  table.header([*Loại*], [*Use Case gốc*], [*Use Case liên quan*], [*Giải thích*]),
  table.hline(),
  [`«extend»`], [UC-02: Đăng nhập], [UC-04: Quên mật khẩu], [Quên mật khẩu là tùy chọn khi đăng nhập],
  table.hline(),
  [`«include»`], [UC-06: Chỉnh sửa bài viết], [UC-08: Xem chi tiết], [Phải xem bài trước khi sửa],
  table.hline(),
  [`«extend»`], [UC-09: Xem bảng tin], [UC-10: Tìm kiếm], [Tìm kiếm là tùy chọn khi xem feed],
  table.hline(),
  [`«extend»`], [UC-09: Xem bảng tin], [UC-11: Lọc theo tag], [Lọc tag là tùy chọn khi xem feed],
  table.hline(),
  [`«extend»`], [UC-09: Xem bảng tin], [UC-12: Sắp xếp], [Sắp xếp là tùy chọn khi xem feed],
  table.hline(),
  [`«include»`], [UC-17: Trả lời bình luận], [UC-16: Bình luận], [Trả lời bản chất là một bình luận],
  table.hline(),
  [Generalization], [Admin], [Sinh viên], [Admin kế thừa toàn bộ quyền của Sinh viên],
)

=== 4.2.3. Sơ đồ Use Case chi tiết

==== Nhóm Bài viết

#figure(
  image("../Figures/uc_baiviet.png", width: 100%),
  caption: [Sơ đồ Use Case chi tiết — Nhóm Bài viết]
)

- UC-05: Tạo bài viết mới
- UC-06: Chỉnh sửa bài viết
- UC-07: Xóa bài viết
- UC-08: Xem chi tiết bài viết
- Quan hệ `«include»`: Chỉnh sửa bài viết (UC-06) bao gồm việc xem chi tiết bài viết (UC-08) trước
- Admin kế thừa quyền từ Sinh viên và có thêm quyền xóa bất kỳ bài viết nào

==== Nhóm Bảng tin

#figure(
  image("../Figures/uc_newsfeed.png", width: 100%),
  caption: [Sơ đồ Use Case chi tiết — Nhóm Bảng tin]
)

- UC-09: Xem bảng tin (chức năng chính)
- UC-10: Tìm kiếm bài viết (`«extend»` từ UC-09)
- UC-11: Lọc bài viết theo tag (`«extend»` từ UC-09)
- UC-12: Sắp xếp bài viết (`«extend»` từ UC-09)
- Các chức năng tìm kiếm, lọc, sắp xếp là tùy chọn mở rộng khi xem bảng tin

==== Nhóm Tương tác

#figure(
  image("../Figures/uc_tuongtac.png", width: 100%),
  caption: [Sơ đồ Use Case chi tiết — Nhóm Tương tác]
)

- UC-13: Like bài viết
- UC-14: Bookmark bài viết
- UC-15: Chia sẻ bài viết
- UC-16: Bình luận bài viết
- UC-17: Trả lời bình luận
- UC-18: Báo cáo nội dung
- Quan hệ `«include»`: Trả lời bình luận (UC-17) bao gồm hành vi bình luận (UC-16)

==== Nhóm Hồ sơ \& Xã hội

#figure(
  image("../Figures/uc_hoso.png", width: 100%),
  caption: [Sơ đồ Use Case chi tiết — Nhóm Hồ sơ \& Xã hội]
)

- UC-19: Xem hồ sơ người dùng
- UC-20: Chỉnh sửa hồ sơ cá nhân
- UC-21: Follow/Unfollow người dùng khác
- UC-25: Xem thông báo

==== Nhóm Quản trị

#figure(
  image("../Figures/uc_quantri.png", width: 80%),
  caption: [Sơ đồ Use Case chi tiết — Nhóm Quản trị]
)

- UC-22: Quản lý người dùng (khóa/mở khóa, xóa tài khoản)
- UC-23: Kiểm duyệt nội dung (duyệt báo cáo)
- UC-24: Quản lý tags (thêm/sửa/xóa)
- Chỉ Admin mới có quyền truy cập nhóm chức năng này

== 4.3. Đặc tả Use Case

=== 4.3.1. UC-01: Đăng ký tài khoản

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-01],
  [*Tên*], [Đăng ký tài khoản],
  [*Actor*], [Khách],
  [*Mô tả*], [Khách tạo tài khoản mới để tham gia diễn đàn],
  [*Điều kiện trước*], [Khách chưa có tài khoản, đang ở trang Đăng ký],
  [*Điều kiện sau*], [Tài khoản được tạo (role = Student, status = Active), chuyển về trang Đăng nhập],
  table.hline(),
  [*Luồng chính*], [
    1. Khách nhập username, email, full\_name, password \
    2. Hệ thống validate: username (3–50 ký tự), email (đúng định dạng), password (6–128 ký tự), full\_name (2–255 ký tự) \
    3. Chuẩn hóa email, xóa khoảng trắng username \
    4. Hash mật khẩu bằng Argon2 \
    5. Tạo tài khoản \
    6. Hiển thị thông báo thành công \
    7. Chuyển về trang Đăng nhập
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Email đã tồn tại → lỗi 400 \
    2b. Username đã tồn tại → lỗi 400 \
    2c. Dữ liệu không hợp lệ → lỗi validate
  ],
)

=== 4.3.2. UC-02: Đăng nhập

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-02],
  [*Tên*], [Đăng nhập],
  [*Actor*], [Khách],
  [*Mô tả*], [Khách xác thực để truy cập hệ thống],
  [*Điều kiện trước*], [Khách đã có tài khoản],
  [*Điều kiện sau*], [Được cấp access token (60 phút) và refresh token (7 ngày), chuyển đến Feed],
  table.hline(),
  [*Luồng chính*], [
    1. Nhập identifier (email hoặc username) và password \
    2. Tìm user theo email\/username \
    3. Kiểm tra tài khoản Active \
    4. Xác thực mật khẩu Argon2 \
    5. Tạo access token + refresh token \
    6. Lưu session (kèm IP, user agent) \
    7. Chuyển đến Feed
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Không tìm thấy user → lỗi 401 \
    3a. Tài khoản bị khóa → lỗi 403 \
    4a. Sai mật khẩu → lỗi 401
  ],
)

=== 4.3.3. UC-05: Tạo bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-05],
  [*Tên*], [Tạo bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Sinh viên đăng bài viết mới lên diễn đàn],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Bài viết xuất hiện trên Feed],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm "New Post" \
    2. Nhập tiêu đề, nội dung \
    3. (Tùy chọn) Upload ảnh bìa \
    4. (Tùy chọn) Thêm tags \
    5. Xem preview \
    6. Bấm "Publish" \
    7. Hệ thống tạo slug, lưu bài \
    8. Chuyển đến trang chi tiết bài
  ],
  table.hline(),
  [*Luồng thay thế*], [
    6a. Tiêu đề hoặc nội dung trống → nút Publish bị vô hiệu hóa
  ],
)

=== 4.3.4. UC-09: Xem bảng tin

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-09],
  [*Tên*], [Xem bảng tin],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Xem danh sách bài viết trên bảng tin chính],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Danh sách bài viết được hiển thị],
  table.hline(),
  [*Luồng chính*], [
    1. Truy cập \/feed \
    2. Hệ thống hiển thị bài viết theo tab "For You" \
    3. Cuộn xuống \
    4. Tự động tải thêm bài (infinite scroll)
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Chuyển tab "Following" → chỉ hiện bài từ người đang follow \
    2b. Chuyển tab "Trending" → hiện bài có trending score cao
  ],
)

=== 4.3.5. UC-13: Like bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-13],
  [*Tên*], [Like bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Bày tỏ sự thích đối với bài viết],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Số like cập nhật, trending score thay đổi],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm nút Like \
    2. Hệ thống tăng like +1, trending score +4 \
    3. Hiển thị toast "Post liked"
  ],
  table.hline(),
  [*Luồng thay thế*], [
    1a. Đã like rồi → bấm lại để bỏ like, toast "Post like removed"
  ],
)

=== 4.3.6. UC-16: Bình luận bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-16],
  [*Tên*], [Bình luận bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Viết bình luận trên bài viết],
  [*Điều kiện trước*], [Đang xem chi tiết bài viết],
  [*Điều kiện sau*], [Comment xuất hiện, số comment +1, trending score +3],
  table.hline(),
  [*Luồng chính*], [
    1. Nhập nội dung comment \
    2. Bấm "Post" \
    3. Hệ thống lưu comment (parent\_id = NULL) \
    4. Comment hiện lên, toast "Comment posted"
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Nội dung trống → không gửi
  ],
)

=== 4.3.7. UC-19: Xem hồ sơ người dùng

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-19],
  [*Tên*], [Xem hồ sơ người dùng],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Xem thông tin và hoạt động của một user],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Trang hồ sơ hiển thị],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm vào tên\/avatar user \
    2. Hiển thị: avatar, tên, username, bio, role, số followers\/following \
    3. Xem 4 tab: Posts \/ Comments \/ Bookmarks \/ Likes
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. User không tồn tại → hiển thị "Profile not found"
  ],
)

=== 4.3.8. UC-22: Quản lý người dùng

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-22],
  [*Tên*], [Quản lý người dùng],
  [*Actor*], [Admin],
  [*Mô tả*], [Xem danh sách, khóa\/mở khóa, xóa tài khoản người dùng],
  [*Điều kiện trước*], [Admin đã đăng nhập],
  [*Điều kiện sau*], [Trạng thái tài khoản được cập nhật],
  table.hline(),
  [*Luồng chính*], [
    1. Truy cập trang quản lý user \
    2. Xem danh sách user (tên, email, role, trạng thái) \
    3. Chọn khóa\/mở khóa\/xóa user \
    4. Hệ thống cập nhật
  ],
  table.hline(),
  [*Luồng thay thế*], [
    3a. Tự khóa chính mình → lỗi 403
  ],
)

=== 4.3.9. UC-03: Đăng xuất

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-03],
  [*Tên*], [Đăng xuất],
  [*Actor*], [Sinh viên, Admin],
  [*Mô tả*], [Người dùng kết thúc phiên làm việc],
  [*Điều kiện trước*], [Người dùng đã đăng nhập],
  [*Điều kiện sau*], [Refresh token bị xóa khỏi database, chuyển về trang Đăng nhập],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm nút Đăng xuất \
    2. Gửi refresh token đến `POST /auth/logout` \
    3. Hệ thống xóa auth session tương ứng \
    4. Xóa token phía client \
    5. Chuyển về trang Đăng nhập
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Token không hợp lệ → vẫn trả thành công (logout luôn succeed)
  ],
)

=== 4.3.10. UC-04: Quên mật khẩu

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-04],
  [*Tên*], [Quên mật khẩu],
  [*Actor*], [Khách],
  [*Mô tả*], [Người dùng yêu cầu đặt lại mật khẩu khi quên],
  [*Điều kiện trước*], [Khách đã có tài khoản, đang ở trang Đăng nhập],
  [*Điều kiện sau*], [Mật khẩu được đặt lại],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm "Quên mật khẩu" tại trang Đăng nhập \
    2. Nhập email đã đăng ký \
    3. Hệ thống gửi link đặt lại mật khẩu qua email \
    4. Người dùng nhập mật khẩu mới \
    5. Hệ thống hash mật khẩu mới bằng Argon2 và cập nhật
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Email không tồn tại → thông báo lỗi
  ],
)

=== 4.3.11. UC-06: Chỉnh sửa bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-06],
  [*Tên*], [Chỉnh sửa bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Chỉnh sửa nội dung bài viết đã đăng],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập, là tác giả bài viết],
  [*Điều kiện sau*], [Bài viết được cập nhật nội dung mới],
  table.hline(),
  [*Luồng chính*], [
    1. Xem chi tiết bài viết (`«include»` UC-08) \
    2. Bấm nút "Edit" \
    3. Chuyển đến trang \/edit\/\[slug\] \
    4. Chỉnh sửa tiêu đề, nội dung, ảnh bìa, tags \
    5. Bấm "Update" \
    6. Hệ thống cập nhật bài viết \
    7. Chuyển về trang chi tiết bài
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Không phải tác giả → nút Edit bị ẩn \
    5a. Tiêu đề hoặc nội dung trống → nút Update bị vô hiệu hóa
  ],
)

=== 4.3.12. UC-07: Xóa bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-07],
  [*Tên*], [Xóa bài viết],
  [*Actor*], [Sinh viên, Admin],
  [*Mô tả*], [Xóa bài viết khỏi hệ thống],
  [*Điều kiện trước*], [Sinh viên là tác giả bài viết hoặc Admin],
  [*Điều kiện sau*], [Bài viết bị xóa, các tương tác liên quan bị xóa theo],
  table.hline(),
  [*Luồng chính*], [
    1. Xem chi tiết bài viết \
    2. Bấm nút "Delete" \
    3. Hệ thống hiển thị xác nhận \
    4. Xác nhận xóa \
    5. Hệ thống xóa bài viết và dữ liệu liên quan (comments, likes, bookmarks) \
    6. Chuyển về trang Feed
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Không phải tác giả và không phải Admin → nút Delete bị ẩn \
    4a. Hủy xác nhận → quay lại trang chi tiết
  ],
)

=== 4.3.13. UC-08: Xem chi tiết bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-08],
  [*Tên*], [Xem chi tiết bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Xem toàn bộ nội dung và tương tác của một bài viết],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Trang chi tiết bài viết hiển thị],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm vào tiêu đề\/card bài viết từ Feed \
    2. Chuyển đến trang \/post\/\[slug\] \
    3. Hiển thị: tiêu đề, nội dung, ảnh bìa, tags, tác giả, ngày đăng \
    4. Hiển thị các nút tương tác: Like, Bookmark, Share \
    5. Hiển thị danh sách bình luận
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Bài viết không tồn tại → hiển thị "Post not found"
  ],
)

=== 4.3.14. UC-10: Tìm kiếm bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-10],
  [*Tên*], [Tìm kiếm bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Tìm kiếm bài viết theo từ khóa],
  [*Điều kiện trước*], [Đang xem bảng tin (UC-09)],
  [*Điều kiện sau*], [Danh sách bài viết phù hợp được hiển thị],
  table.hline(),
  [*Luồng chính*], [
    1. Nhập từ khóa vào thanh tìm kiếm \
    2. Hệ thống áp dụng debounce (350ms) \
    3. Gửi request tìm kiếm theo tiêu đề \
    4. Hiển thị kết quả lọc theo từ khóa
  ],
  table.hline(),
  [*Luồng thay thế*], [
    4a. Không tìm thấy bài viết → hiển thị "No posts found"
  ],
)

=== 4.3.15. UC-11: Lọc bài viết theo tag

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-11],
  [*Tên*], [Lọc bài viết theo tag],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Lọc danh sách bài viết theo tag được chọn],
  [*Điều kiện trước*], [Đang xem bảng tin (UC-09)],
  [*Điều kiện sau*], [Chỉ hiển thị bài viết có tag được chọn],
  table.hline(),
  [*Luồng chính*], [
    1. Chọn tag từ danh sách tag trên sidebar \
    2. Hệ thống lọc bài viết có gắn tag tương ứng \
    3. Hiển thị kết quả lọc
  ],
  table.hline(),
  [*Luồng thay thế*], [
    1a. Bỏ chọn tag → hiển thị lại toàn bộ bài viết
  ],
)

=== 4.3.16. UC-12: Sắp xếp bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-12],
  [*Tên*], [Sắp xếp bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Sắp xếp danh sách bài viết theo tiêu chí],
  [*Điều kiện trước*], [Đang xem bảng tin (UC-09)],
  [*Điều kiện sau*], [Danh sách bài viết hiển thị theo thứ tự mới],
  table.hline(),
  [*Luồng chính*], [
    1. Chọn tab sắp xếp: "For You" \/ "Following" \/ "Trending" \
    2. Hệ thống truy vấn và sắp xếp theo tiêu chí tương ứng \
    3. Hiển thị kết quả
  ],
  table.hline(),
  [*Luồng thay thế*], [
    1a. Tab mặc định là "For You" (bài mới nhất)
  ],
)

=== 4.3.17. UC-14: Bookmark bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-14],
  [*Tên*], [Bookmark bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Lưu bài viết vào danh sách bookmark cá nhân],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Bài viết được thêm\/xóa khỏi danh sách bookmark],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm nút Bookmark \
    2. Hệ thống lưu bài vào danh sách bookmark \
    3. Hiển thị toast "Post bookmarked"
  ],
  table.hline(),
  [*Luồng thay thế*], [
    1a. Đã bookmark rồi → bấm lại để bỏ bookmark, toast "Bookmark removed"
  ],
)

=== 4.3.18. UC-15: Chia sẻ bài viết

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-15],
  [*Tên*], [Chia sẻ bài viết],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Chia sẻ link bài viết],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Link bài viết được sao chép vào clipboard],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm nút Share \
    2. Hệ thống sao chép URL bài viết vào clipboard \
    3. Tăng số lượt share +1 \
    4. Hiển thị toast "Link copied"
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Trình duyệt không hỗ trợ clipboard API → hiển thị URL để copy thủ công
  ],
)

=== 4.3.19. UC-17: Trả lời bình luận

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-17],
  [*Tên*], [Trả lời bình luận],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Trả lời một bình luận đã có trên bài viết],
  [*Điều kiện trước*], [Đang xem bình luận trên trang chi tiết bài viết],
  [*Điều kiện sau*], [Reply xuất hiện dưới bình luận cha, số comment +1],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm "Reply" trên một bình luận \
    2. Nhập nội dung trả lời \
    3. Bấm "Post" \
    4. Hệ thống lưu comment với parent\_id = ID bình luận cha (`«include»` UC-16) \
    5. Reply hiện dưới bình luận cha
  ],
  table.hline(),
  [*Luồng thay thế*], [
    3a. Nội dung trống → không gửi
  ],
)

=== 4.3.20. UC-18: Báo cáo nội dung

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-18],
  [*Tên*], [Báo cáo nội dung],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Báo cáo bài viết vi phạm],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập, đang xem bài viết],
  [*Điều kiện sau*], [Báo cáo được tạo (status = Pending), Admin nhận thông báo],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm nút "Report" trên bài viết \
    2. Chọn lý do báo cáo \
    3. (Tùy chọn) Nhập mô tả chi tiết \
    4. Bấm "Submit Report" \
    5. Hệ thống tạo report với status = Pending \
    6. Hiển thị toast "Report submitted"
  ],
  table.hline(),
  [*Luồng thay thế*], [
    4a. Đã báo cáo bài này rồi → thông báo "Already reported"
  ],
)

=== 4.3.21. UC-20: Chỉnh sửa hồ sơ

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-20],
  [*Tên*], [Chỉnh sửa hồ sơ],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Cập nhật thông tin cá nhân],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập, đang xem hồ sơ của mình],
  [*Điều kiện sau*], [Hồ sơ được cập nhật],
  table.hline(),
  [*Luồng chính*], [
    1. Truy cập trang \/settings \
    2. Chỉnh sửa full\_name, bio, avatar\_url \
    3. Bấm "Save" \
    4. Gửi `PUT /users/me` \
    5. Hệ thống cập nhật thông tin \
    6. Hiển thị toast thành công
  ],
  table.hline(),
  [*Luồng thay thế*], [
    3a. full\_name trống → lỗi validate
  ],
)

=== 4.3.22. UC-21: Follow\/Unfollow

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-21],
  [*Tên*], [Follow\/Unfollow người dùng],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Theo dõi hoặc bỏ theo dõi người dùng khác],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập, đang xem hồ sơ người khác],
  [*Điều kiện sau*], [Trạng thái follow được cập nhật],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm nút "Follow" trên trang hồ sơ \
    2. Gửi `POST /follow/\{user\_id\}` \
    3. Hệ thống tạo bản ghi follow \
    4. Nút chuyển thành "Unfollow" \
    5. Số followers của người được follow +1
  ],
  table.hline(),
  [*Luồng thay thế*], [
    1a. Đã follow → bấm "Unfollow", gửi `DELETE /follow/\{user\_id\}` \
    1b. Follow chính mình → lỗi 400 "You cannot follow yourself"
  ],
)

=== 4.3.23. UC-23: Kiểm duyệt nội dung

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-23],
  [*Tên*], [Kiểm duyệt nội dung],
  [*Actor*], [Admin],
  [*Mô tả*], [Xem và xử lý các báo cáo vi phạm nội dung],
  [*Điều kiện trước*], [Admin đã đăng nhập],
  [*Điều kiện sau*], [Báo cáo được xử lý (Resolved\/Dismissed)],
  table.hline(),
  [*Luồng chính*], [
    1. Truy cập trang Dashboard \
    2. Xem danh sách báo cáo (Pending) \
    3. Xem chi tiết báo cáo: bài viết vi phạm, lý do, người báo cáo \
    4. Chọn hành động: Resolve (xóa bài viết) hoặc Dismiss (bỏ qua) \
    5. Hệ thống cập nhật trạng thái báo cáo
  ],
  table.hline(),
  [*Luồng thay thế*], [
    4a. Không còn báo cáo → hiển thị "No pending reports"
  ],
)

=== 4.3.24. UC-24: Quản lý tags

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-24],
  [*Tên*], [Quản lý tags],
  [*Actor*], [Admin],
  [*Mô tả*], [Thêm, sửa, xóa tag phân loại bài viết],
  [*Điều kiện trước*], [Admin đã đăng nhập],
  [*Điều kiện sau*], [Danh sách tag được cập nhật],
  table.hline(),
  [*Luồng chính*], [
    1. Truy cập trang quản lý tags \
    2. Xem danh sách tag hiện có \
    3. Thêm tag mới: nhập tên, hệ thống tạo slug tự động \
    4. Sửa tag: thay đổi tên tag \
    5. Xóa tag: xác nhận và xóa
  ],
  table.hline(),
  [*Luồng thay thế*], [
    3a. Tên tag đã tồn tại → lỗi trùng lặp \
    5a. Tag đang được sử dụng → xóa liên kết post\_tags trước
  ],
)

=== 4.3.25. UC-25: Xem thông báo

#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Mục*], [*Nội dung*]),
  table.hline(),
  [*Mã Use Case*], [UC-25],
  [*Tên*], [Xem thông báo],
  [*Actor*], [Sinh viên],
  [*Mô tả*], [Xem danh sách thông báo về các hoạt động liên quan],
  [*Điều kiện trước*], [Sinh viên đã đăng nhập],
  [*Điều kiện sau*], [Thông báo được hiển thị, đánh dấu đã đọc],
  table.hline(),
  [*Luồng chính*], [
    1. Bấm biểu tượng thông báo trên thanh điều hướng \
    2. Hiển thị danh sách thông báo (like, comment, follow, report) \
    3. Bấm vào thông báo → chuyển đến nội dung liên quan \
    4. Thông báo được đánh dấu đã đọc (is\_read = true)
  ],
  table.hline(),
  [*Luồng thay thế*], [
    2a. Không có thông báo → hiển thị "No notifications"
  ],
)


== 4.4. Mô hình hóa yêu cầu bằng DFD (Data Flow Diagram)

Sử dụng DFD để mô hình hóa chi tiết các nghiệp vụ cốt lõi của hệ thống Forum Sinh viên.

=== 4.4.1. Nhóm Quản lý xác thực
==== 4.4.1.1. Đăng ký tài khoản (UC-01)

*Kho dữ liệu:* Users

#figure(
  image("../Figures/dfd_uc01.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Đăng ký tài khoản]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Username, email, full\_name, password],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách email\/username đã tồn tại],
  [*D4*], [Lưu tài khoản mới (password\_hash Argon2, role=Student, status=Active)],
  [*D5*], [D4],
  [*D6*], [Thông báo "Đăng ký thành công" hoặc "Email\/Username đã tồn tại"],
)

*Thuật toán xử lý:*
+ Nhận username, email, full\_name, password từ form đăng ký
+ Chuẩn hóa email (lowercase, trim), trim username
+ Truy vấn kho Users kiểm tra email hoặc username đã tồn tại
+ NẾU email đã tồn tại → Trả lỗi "Email already exists" \
  NẾU username đã tồn tại → Trả lỗi "Username already exists"
+ Hash mật khẩu bằng Argon2
+ Tạo bản ghi User (role=Student, status=Active, provider=local)
+ Lưu vào kho Users
+ Trả thông báo "User registered successfully"

==== 4.4.1.2. Đăng nhập hệ thống (UC-02)

*Kho dữ liệu:* Users, Auth Sessions


#figure(
  image("../Figures/dfd_uc02.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Đăng nhập hệ thống]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Email\/username + password],
  [*D2*], [_Không có_],
  [*D3*], [Thông tin tài khoản (password\_hash, status, role)],
  [*D4*], [Lưu auth session (refresh\_token, IP, user\_agent, expires\_at)],
  [*D5*], [Access token + Refresh token],
  [*D6*], [Thông báo "Đăng nhập thành công" hoặc lỗi xác thực],
)

*Thuật toán xử lý:*
+ Nhận identifier (email hoặc username) + password
+ Chuẩn hóa identifier (lowercase, trim)
+ Truy vấn kho Users theo email hoặc username
+ NẾU không tìm thấy → Trả lỗi 401 "User not found"
+ NẾU status ≠ "Active" → Trả lỗi 403 "Account is not active"
+ Xác thực password bằng Argon2 verify
+ NẾU sai mật khẩu → Trả lỗi 401 "Invalid password"
+ Tạo access\_token (JWT, hết hạn 60 phút)
+ Tạo refresh\_token (JWT, hết hạn 7 ngày)
+ Lưu auth session (kèm IP, user\_agent) vào kho Auth Sessions
+ Trả access\_token + refresh\_token cho client

==== 4.4.1.3. Đăng xuất (UC-03)

*Kho dữ liệu:* Auth Sessions


#figure(
  image("../Figures/dfd_uc03.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Đăng xuất]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Refresh token],
  [*D2*], [_Không có_],
  [*D3*], [Session tương ứng với refresh token],
  [*D4*], [Xóa session khỏi kho],
  [*D5*], [_Không có_],
  [*D6*], [Thông báo "Logged out successfully"],
)

*Thuật toán xử lý:*
+ Nhận refresh\_token từ client
+ Truy vấn kho Auth Sessions theo refresh\_token
+ NẾU tìm thấy → Xóa session
+ Trả thông báo "Logged out successfully" (luôn thành công)

==== 4.4.1.4. Quên mật khẩu (UC-04)

*Kho dữ liệu:* Users


#figure(
  image("../Figures/dfd_uc04.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Quên mật khẩu]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Email đã đăng ký],
  [*D2*], [_Không có_],
  [*D3*], [Kiểm tra email có tồn tại],
  [*D4*], [Cập nhật password\_hash mới],
  [*D5*], [Link đặt lại mật khẩu (qua email)],
  [*D6*], [Thông báo "Kiểm tra email để đặt lại mật khẩu"],
)

*Thuật toán xử lý:*
+ Nhận email từ form
+ Truy vấn kho Users kiểm tra email tồn tại
+ NẾU không tồn tại → Trả lỗi "Email not found"
+ Tạo token reset password (có thời hạn)
+ Gửi link reset qua email
+ Người dùng nhập mật khẩu mới
+ Hash mật khẩu mới bằng Argon2
+ Cập nhật password\_hash trong kho Users
+ Trả thông báo "Password reset successfully"

=== 4.4.2. Nhóm Quản lý bài viết
==== 4.4.2.1. Tạo bài viết (UC-05)

*Kho dữ liệu:* Posts, Tags, Post\_Tags


#figure(
  image("../Figures/dfd_uc05.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Tạo bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Tiêu đề, nội dung, ảnh bìa],
  [*D2*], [Danh sách tags được chọn],
  [*D3*], [Danh sách tags hiện có],
  [*D4*], [Lưu bài viết mới (kèm slug tự động) + liên kết post\_tags],
  [*D5*], [D4],
  [*D6*], [Chuyển đến trang chi tiết bài viết],
)

*Thuật toán xử lý:*
+ Nhận tiêu đề, nội dung, ảnh bìa, danh sách tags
+ Validate: tiêu đề và nội dung không được trống
+ Tạo slug từ tiêu đề (lowercase, thay dấu cách bằng '-')
+ Lưu bài viết vào kho Posts (user\_id, title, content, slug, cover\_image)
+ VỚI MỖI tag được chọn: \
  - Truy vấn kho Tags lấy tag\_id \
  - Tạo liên kết post\_tags (post\_id, tag\_id)
+ Chuyển hướng đến trang \/post\/\[slug\]

==== 4.4.2.2. Chỉnh sửa bài viết (UC-06)

*Kho dữ liệu:* Posts, Tags, Post\_Tags


#figure(
  image("../Figures/dfd_uc06.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Chỉnh sửa bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Nội dung chỉnh sửa (tiêu đề, nội dung, ảnh bìa, tags)],
  [*D2*], [_Không có_],
  [*D3*], [Dữ liệu bài viết hiện tại + tags hiện tại],
  [*D4*], [Cập nhật bài viết + cập nhật liên kết tags],
  [*D5*], [D4],
  [*D6*], [Thông báo "Cập nhật thành công"],
)

*Thuật toán xử lý:*
+ Nhận slug bài viết, load dữ liệu hiện tại từ kho Posts
+ Kiểm tra user hiện tại có phải tác giả không
+ NẾU không phải tác giả → Trả lỗi 403
+ Nhận nội dung chỉnh sửa từ form
+ Validate: tiêu đề và nội dung không được trống
+ Cập nhật bản ghi trong kho Posts
+ Xóa liên kết post\_tags cũ, tạo liên kết mới
+ Trả phản hồi cập nhật thành công

==== 4.4.2.3. Xóa bài viết (UC-07)

*Kho dữ liệu:* Posts, Comments, Likes, Bookmarks, Post\_Tags


#figure(
  image("../Figures/dfd_uc07.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Xóa bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Post ID cần xóa],
  [*D2*], [_Không có_],
  [*D3*], [Dữ liệu bài viết (kiểm tra quyền sở hữu)],
  [*D4*], [Xóa bài viết + xóa comments, likes, bookmarks liên quan],
  [*D5*], [_Không có_],
  [*D6*], [Thông báo "Xóa thành công", chuyển về Feed],
)

*Thuật toán xử lý:*
+ Nhận post\_id
+ Truy vấn kho Posts lấy bài viết
+ NẾU không tìm thấy → Trả lỗi 404
+ Kiểm tra quyền: user là tác giả HOẶC là Admin
+ NẾU không có quyền → Trả lỗi 403
+ Xóa tất cả comments, likes, bookmarks, post\_tags liên quan
+ Xóa bài viết khỏi kho Posts
+ Trả thông báo thành công, chuyển hướng về \/feed

==== 4.4.2.4. Xem chi tiết bài viết (UC-08)

*Kho dữ liệu:* Posts, Comments, Likes, Bookmarks


#figure(
  image("../Figures/dfd_uc08.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Xem chi tiết bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Slug bài viết],
  [*D2*], [_Không có_],
  [*D3*], [Dữ liệu bài viết (tiêu đề, nội dung, tags, tác giả) + tương tác (likes, comments)],
  [*D4*], [_Không có_],
  [*D5*], [Trang chi tiết bài viết đầy đủ],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận slug từ URL
+ Truy vấn kho Posts theo slug (kèm JOIN tags, tác giả)
+ NẾU không tìm thấy → Hiển thị "Post not found"
+ Truy vấn kho Interactions: số like, danh sách comments
+ Kiểm tra trạng thái like\/bookmark của user hiện tại
+ Render trang chi tiết (tiêu đề, nội dung, ảnh bìa, tags, tác giả, likes, comments)

=== 4.4.3. Nhóm Quản lý bảng tin
==== 4.4.3.1. Xem bảng tin (UC-09)

*Kho dữ liệu:* Posts, Tags, Follows


#figure(
  image("../Figures/dfd_uc09.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Xem bảng tin]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Tab được chọn (For You \/ Following \/ Trending)],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách bài viết (phân trang) + danh sách tags],
  [*D4*], [_Không có_],
  [*D5*], [Bảng tin (danh sách card bài viết + sidebar tags)],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận tab (mặc định "For You") và số trang
+ NẾU tab = "For You" → Truy vấn bài viết mới nhất \
  NẾU tab = "Following" → Truy vấn bài viết từ người đang follow \
  NẾU tab = "Trending" → Truy vấn theo trending\_score giảm dần
+ Phân trang kết quả (infinite scroll)
+ Truy vấn danh sách tags cho sidebar
+ Render bảng tin + sidebar

==== 4.4.3.2. Tìm kiếm bài viết (UC-10)

*Kho dữ liệu:* Posts


#figure(
  image("../Figures/dfd_uc10.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Tìm kiếm bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Từ khóa tìm kiếm],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách bài viết khớp từ khóa],
  [*D4*], [_Không có_],
  [*D5*], [Kết quả tìm kiếm],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận từ khóa từ thanh tìm kiếm
+ Áp dụng debounce (350ms) — chỉ gửi request sau khi ngừng gõ
+ Truy vấn kho Posts: WHERE title LIKE '%keyword%'
+ NẾU không có kết quả → Hiển thị "No posts found"
+ Hiển thị danh sách bài viết khớp

==== 4.4.3.3. Lọc bài viết theo tag (UC-11)

*Kho dữ liệu:* Posts, Post\_Tags


#figure(
  image("../Figures/dfd_uc11.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Lọc bài viết theo tag]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Tag được chọn],
  [*D2*], [_Không có_],
  [*D3*], [Bài viết có gắn tag tương ứng (qua bảng post\_tags)],
  [*D4*], [_Không có_],
  [*D5*], [Danh sách bài viết đã lọc],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận tag\_id từ sidebar
+ Truy vấn kho Post\_Tags: lấy post\_id có tag\_id tương ứng
+ Truy vấn kho Posts theo danh sách post\_id
+ Hiển thị danh sách bài viết đã lọc

==== 4.4.3.4. Sắp xếp bài viết (UC-12)

*Kho dữ liệu:* Posts


#figure(
  image("../Figures/dfd_uc12.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Sắp xếp bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Tiêu chí sắp xếp (For You \/ Following \/ Trending)],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách bài viết sắp xếp theo tiêu chí],
  [*D4*], [_Không có_],
  [*D5*], [Danh sách bài viết đã sắp xếp],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận tiêu chí sắp xếp
+ NẾU "For You" → ORDER BY created\_at DESC \
  NẾU "Following" → WHERE user\_id IN (following\_ids) ORDER BY created\_at DESC \
  NẾU "Trending" → ORDER BY trending\_score DESC
+ Hiển thị kết quả

=== 4.4.4. Nhóm Quản lý tương tác
==== 4.4.4.1. Like bài viết (UC-13)

*Kho dữ liệu:* Likes, Posts


#figure(
  image("../Figures/dfd_uc13.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Like bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Post ID],
  [*D2*], [_Không có_],
  [*D3*], [Kiểm tra đã like chưa (bảng likes)],
  [*D4*], [Thêm\/xóa like + cập nhật trending\_score (+4 hoặc -4)],
  [*D5*], [_Không có_],
  [*D6*], [Toast "Post liked" hoặc "Post like removed"],
)

*Thuật toán xử lý:*
+ Nhận post\_id
+ Truy vấn kho Likes: kiểm tra user đã like bài này chưa
+ NẾU chưa like: \
  - Thêm bản ghi Like (user\_id, post\_id) \
  - Cập nhật posts: trending\_score += 4 \
  - Trả toast "Post liked"
+ NẾU đã like: \
  - Xóa bản ghi Like \
  - Cập nhật posts: trending\_score -= 4 \
  - Trả toast "Post like removed"

==== 4.4.4.2. Bookmark bài viết (UC-14)

*Kho dữ liệu:* Bookmarks


#figure(
  image("../Figures/dfd_uc14.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Bookmark bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Post ID],
  [*D2*], [_Không có_],
  [*D3*], [Kiểm tra đã bookmark chưa],
  [*D4*], [Thêm\/xóa bookmark],
  [*D5*], [_Không có_],
  [*D6*], [Toast "Post bookmarked" hoặc "Bookmark removed"],
)

*Thuật toán xử lý:*
+ Nhận post\_id
+ Truy vấn kho Bookmarks: kiểm tra user đã bookmark chưa
+ NẾU chưa → Thêm bản ghi Bookmark, toast "Post bookmarked"
+ NẾU rồi → Xóa bản ghi, toast "Bookmark removed"

==== 4.4.4.3. Chia sẻ bài viết (UC-15)

*Kho dữ liệu:* Posts


#figure(
  image("../Figures/dfd_uc15.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Chia sẻ bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Post ID],
  [*D2*], [_Không có_],
  [*D3*], [URL bài viết (slug)],
  [*D4*], [Cập nhật shares +1],
  [*D5*], [URL bài viết (clipboard)],
  [*D6*], [Toast "Link copied"],
)

*Thuật toán xử lý:*
+ Nhận post\_id
+ Lấy slug bài viết từ kho Posts
+ Tạo URL đầy đủ: domain\/post\/\[slug\]
+ Sao chép URL vào clipboard (Web API)
+ Cập nhật kho Posts: shares += 1
+ Hiển thị toast "Link copied"

==== 4.4.4.4. Bình luận bài viết (UC-16)

*Kho dữ liệu:* Comments, Posts


#figure(
  image("../Figures/dfd_uc16.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Bình luận bài viết]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Nội dung comment + post\_id],
  [*D2*], [_Không có_],
  [*D3*], [_Không có_],
  [*D4*], [Lưu comment (parent\_id=NULL) + cập nhật trending\_score +3],
  [*D5*], [Comment mới hiển thị],
  [*D6*], [Toast "Comment posted"],
)

*Thuật toán xử lý:*
+ Nhận nội dung comment và post\_id
+ Validate: nội dung không được trống
+ Tạo bản ghi Comment (user\_id, post\_id, content, parent\_id=NULL)
+ Lưu vào kho Comments
+ Cập nhật kho Posts: trending\_score += 3
+ Render comment mới + toast "Comment posted"

==== 4.4.4.5. Trả lời bình luận (UC-17)

*Kho dữ liệu:* Comments


#figure(
  image("../Figures/dfd_uc17.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Trả lời bình luận]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Nội dung reply + comment\_id cha],
  [*D2*], [_Không có_],
  [*D3*], [Thông tin comment cha (post\_id)],
  [*D4*], [Lưu reply (parent\_id = comment\_id cha)],
  [*D5*], [Reply hiển thị dưới comment cha],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận nội dung reply và comment\_id cha
+ Truy vấn kho Comments: lấy post\_id từ comment cha
+ Tạo bản ghi Comment (user\_id, post\_id, content, parent\_id=comment\_id)
+ Lưu vào kho Comments
+ Render reply dưới comment cha

==== 4.4.4.6. Báo cáo nội dung (UC-18)

*Kho dữ liệu:* Reports, Notifications


#figure(
  image("../Figures/dfd_uc18.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Báo cáo nội dung]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Post ID + lý do + mô tả],
  [*D2*], [_Không có_],
  [*D3*], [_Không có_],
  [*D4*], [Lưu report (status=Pending) + tạo notification cho Admin],
  [*D5*], [_Không có_],
  [*D6*], [Toast "Report submitted"],
)

*Thuật toán xử lý:*
+ Nhận post\_id, lý do, mô tả từ form report
+ Kiểm tra user đã report bài này chưa
+ NẾU đã report → Trả "Already reported"
+ Tạo bản ghi Report (reporter\_id, target\_type, target\_id, reason, status=Pending)
+ Tạo notification cho Admin
+ Toast "Report submitted"

=== 4.4.5. Nhóm Quản lý hồ sơ \& Xã hội
==== 4.4.5.1. Xem hồ sơ (UC-19)

*Kho dữ liệu:* Users, Follows, Posts


#figure(
  image("../Figures/dfd_uc19.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Xem hồ sơ]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Username],
  [*D2*], [_Không có_],
  [*D3*], [Thông tin user + số followers\/following + bài viết],
  [*D4*], [_Không có_],
  [*D5*], [Trang hồ sơ (4 tab: Posts, Comments, Bookmarks, Likes)],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Nhận username từ URL
+ Truy vấn kho Users theo username
+ NẾU không tìm thấy → Hiển thị "Profile not found"
+ Đếm followers\/following từ kho Follows
+ Đếm số bài viết từ kho Posts
+ Kiểm tra user hiện tại có đang follow không
+ Render hồ sơ với 4 tab

==== 4.4.5.2. Chỉnh sửa hồ sơ (UC-20)

*Kho dữ liệu:* Users


#figure(
  image("../Figures/dfd_uc20.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Chỉnh sửa hồ sơ]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [full\_name, bio, avatar\_url mới],
  [*D2*], [_Không có_],
  [*D3*], [Thông tin hồ sơ hiện tại],
  [*D4*], [Cập nhật thông tin mới],
  [*D5*], [Hồ sơ đã cập nhật],
  [*D6*], [Toast "Profile updated"],
)

*Thuật toán xử lý:*
+ Load thông tin hồ sơ hiện tại từ kho Users
+ Nhận dữ liệu chỉnh sửa (full\_name, bio, avatar\_url)
+ Validate: full\_name không được trống
+ Trim dữ liệu
+ Cập nhật bản ghi trong kho Users
+ Trả hồ sơ đã cập nhật + toast

==== 4.4.5.3. Follow \/ Unfollow (UC-21)

*Kho dữ liệu:* Follows, Users


#figure(
  image("../Figures/dfd_uc21.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Follow\/Unfollow]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [User ID cần follow\/unfollow],
  [*D2*], [_Không có_],
  [*D3*], [Kiểm tra đã follow chưa + kiểm tra tự follow],
  [*D4*], [Thêm\/xóa bản ghi follow],
  [*D5*], [_Không có_],
  [*D6*], [Toast "Followed"\/"Unfollowed" + cập nhật trạng thái nút],
)

*Thuật toán xử lý:*
+ Nhận user\_id mục tiêu
+ NẾU user\_id = current\_user → Trả lỗi 400 "Cannot follow yourself"
+ Kiểm tra user mục tiêu tồn tại trong kho Users
+ Truy vấn kho Follows: kiểm tra đã follow chưa
+ NẾU chưa follow → Thêm bản ghi Follow (follower\_id, following\_id), toast "Followed"
+ NẾU đã follow → Xóa bản ghi, toast "Unfollowed"

==== 4.4.5.4. Xem thông báo (UC-25)

*Kho dữ liệu:* Notifications


#figure(
  image("../Figures/dfd_uc25.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Xem thông báo]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Yêu cầu xem thông báo],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách thông báo (like, comment, follow, report)],
  [*D4*], [Đánh dấu đã đọc (is\_read = true)],
  [*D5*], [Danh sách thông báo hiển thị],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Truy vấn kho Notifications WHERE receiver\_id = current\_user
+ Sắp xếp theo created\_at DESC
+ NẾU không có → Hiển thị "No notifications"
+ Hiển thị danh sách thông báo
+ Khi bấm vào thông báo → Cập nhật is\_read = true
+ Chuyển đến nội dung liên quan (bài viết, hồ sơ)

=== 4.4.6. Nhóm Quản trị hệ thống
==== 4.4.6.1. Quản lý người dùng (UC-22)

*Kho dữ liệu:* Users


#figure(
  image("../Figures/dfd_uc22.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Quản lý người dùng]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Yêu cầu xem\/khóa\/mở\/xóa user],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách user (tên, email, role, status)],
  [*D4*], [Cập nhật status (Active\/Banned) hoặc xóa user],
  [*D5*], [Danh sách user đã cập nhật],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Truy vấn kho Users: lấy danh sách toàn bộ user
+ Hiển thị bảng user (username, email, role, status)
+ Admin chọn hành động: \
  NẾU "Ban" → Cập nhật status = "Banned" \
  NẾU "Unban" → Cập nhật status = "Active" \
  NẾU "Delete" → Xóa user (cascade)
+ NẾU Admin tự ban\/xóa chính mình → Trả lỗi 403
+ Lưu thay đổi vào kho Users
+ Refresh danh sách

==== 4.4.6.2. Kiểm duyệt nội dung (UC-23)

*Kho dữ liệu:* Reports, Posts


#figure(
  image("../Figures/dfd_uc23.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Kiểm duyệt nội dung]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Yêu cầu xem\/xử lý báo cáo],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách báo cáo Pending + thông tin bài viết vi phạm],
  [*D4*], [Cập nhật status báo cáo (Resolved\/Dismissed) + xóa bài viết nếu cần],
  [*D5*], [Kết quả xử lý],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Truy vấn kho Reports WHERE status = "Pending"
+ Hiển thị danh sách báo cáo kèm thông tin bài viết
+ Admin chọn hành động: \
  NẾU "Resolve" → Cập nhật report status = "Resolved" + Xóa bài viết \
  NẾU "Dismiss" → Cập nhật report status = "Dismissed"
+ Lưu thay đổi
+ Refresh danh sách

==== 4.4.6.3. Quản lý tags (UC-24)

*Kho dữ liệu:* Tags, Post\_Tags


#figure(
  image("../Figures/dfd_uc24.png", width: 80%),
  caption: [Sơ đồ luồng dữ liệu — Quản lý tags]
)


*Mô tả các luồng dữ liệu:*
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Luồng*], [*Mô tả*]),
  table.hline(),
  [*D1*], [Yêu cầu thêm\/sửa\/xóa tag],
  [*D2*], [_Không có_],
  [*D3*], [Danh sách tags hiện có],
  [*D4*], [Thêm\/sửa\/xóa tag + xóa liên kết post\_tags nếu xóa tag],
  [*D5*], [Danh sách tags đã cập nhật],
  [*D6*], [D5],
)

*Thuật toán xử lý:*
+ Truy vấn kho Tags: lấy danh sách hiện có
+ Admin chọn hành động: \
  NẾU "Thêm" → Nhập tên tag, tạo slug tự động, lưu kho Tags \
  NẾU "Sửa" → Cập nhật tag\_name + slug \
  NẾU "Xóa" → Xóa liên kết post\_tags trước, sau đó xóa tag
+ NẾU tên tag trùng → Trả lỗi "Tag already exists"
+ Lưu thay đổi
+ Refresh danh sách

#pagebreak()