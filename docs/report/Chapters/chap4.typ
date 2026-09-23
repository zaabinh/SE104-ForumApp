= CHƯƠNG 4. THIẾT KẾ VÀ MÔ HÌNH HÓA HỆ THỐNG

== 4.1. Tác nhân hệ thống

Hệ thống có ba tác nhân chính:

#table(
  columns: (auto, auto, 1fr),
  align: (center, left, left),
  table.header([*Tác nhân*], [*Loại*], [*Mô tả*]),
  table.hline(),
  [Khách], [Chính], [Người chưa đăng nhập. Có thể đăng ký, đăng nhập, xác minh email, gửi lại email xác minh, quên mật khẩu, đặt lại mật khẩu và đăng nhập bằng Google.],
  [Sinh viên], [Chính], [Người dùng đã đăng nhập, tài khoản đang hoạt động, đã xác minh email và hoàn thiện hồ sơ. Có thể sử dụng các chức năng bài viết, bảng tin, tương tác, hồ sơ và thông báo.],
  [Quản trị viên], [Chính], [Người dùng có vai trò quản trị viên. Kế thừa quyền của sinh viên và có thêm quyền quản lý người dùng, báo cáo, bài chờ duyệt, tag và thống kê hệ thống.],
)

Quản trị viên là một dạng mở rộng của Sinh viên. Vì vậy, các chức năng thông thường như xem bảng tin, đăng bài, thích bài, bình luận và theo dõi người dùng vẫn áp dụng cho quản trị viên. Các chức năng quản trị được bảo vệ bằng kiểm tra vai trò ở phía máy chủ.

== 4.2. Sơ đồ Use Case

=== 4.2.1. Use Case tổng quan

#figure(
  image("../Figures/uc_overview.png", width: 100%),
  caption: [Sơ đồ Use Case tổng quan - Hệ thống UITConnect]
)

Các nhóm chức năng chính của hệ thống:

#table(
  columns: (auto, 1fr, 1.6fr),
  align: (center, left, left),
  table.header([*STT*], [*Nhóm chức năng*], [*Use Case tiêu biểu*]),
  table.hline(),
  [1], [Quản lý xác thực], [Đăng ký, đăng nhập, đăng xuất, quên mật khẩu. Các luồng phụ gồm xác minh email, đăng nhập Google, làm mới mã xác thực và hoàn thiện hồ sơ.],
  [2], [Quản lý bài viết], [Tạo, chỉnh sửa, xóa, xem chi tiết và chia sẻ bài viết.],
  [3], [Quản lý bảng tin], [Xem bảng tin, tìm kiếm, lọc tag và sắp xếp bài viết. Hệ thống có thể hỗ trợ gợi ý nội dung trong phạm vi bảng tin.],
  [4], [Quản lý tương tác], [Thích bài, lưu bài, chia sẻ, bình luận, trả lời bình luận và báo cáo nội dung.],
  [5], [Quản lý hồ sơ \& xã hội], [Xem hồ sơ, chỉnh sửa hồ sơ, theo dõi/hủy theo dõi và xem thông báo.],
  [6], [Quản trị hệ thống], [Quản lý người dùng, kiểm duyệt nội dung và quản lý tag. Các thao tác quản trị có ghi nhật ký và thống kê hỗ trợ.],
)

=== 4.2.2. Use Case theo nhóm

#figure(
  image("../Figures/uc_baiviet.png", width: 78%),
  caption: [Sơ đồ Use Case - Nhóm Bài viết]
)

Nhóm Bài viết trong sơ đồ bao gồm tạo, chỉnh sửa, xóa và xem chi tiết bài viết. bài viết do sinh viên tạo hoặc chỉnh sửa sẽ ở trạng thái chờ duyệt (`pending`); quản trị viên có thể duyệt thành đang hiển thị (`active`) hoặc từ chối (`rejected`).
#line(length:100%)
#figure(
  image("../Figures/uc_newsfeed.png", width: 70%),
  caption: [Sơ đồ Use Case - Nhóm Bảng tin]
)

Nhóm Bảng tin hỗ trợ ba chế độ chính: dành cho bạn (`for-you`), đang theo dõi (`following`) và xu hướng (`trending`). Người dùng có thể tìm kiếm theo tiêu đề/nội dung, lọc tag và sắp xếp theo mới nhất, xu hướng, nhiều lượt thích hoặc nhiều bình luận.

#figure(
  image("../Figures/uc_tuongtac.png", width: 80%),
  caption: [Sơ đồ Use Case - Nhóm Tương tác]
)

Nhóm Tương tác gồm thích/hủy thích, lưu/hủy lưu, chia sẻ, bình luận, trả lời bình luận và báo cáo nội dung. Khi chia sẻ, hệ thống tạo một bài viết mới có `original_post_id` trỏ về bài gốc. Các thao tác tương tác có cơ chế chống trùng bằng khóa chính hoặc truy vấn kiểm tra dữ liệu đã tồn tại.
#line(length:100%)
#figure(
  image("../Figures/uc_hoso.png", width: 70%),
  caption: [Sơ đồ Use Case - Nhóm Hồ sơ và Xã hội]
)

Hồ sơ người dùng bao gồm thông tin công khai như tên đăng nhập, họ tên, ảnh đại diện, tiểu sử, chuyên ngành, năm học, mục tiêu nghề nghiệp và tag quan tâm. Quan hệ theo dõi được lưu trong bảng `follows` và được dùng cho bảng tin đang theo dõi cũng như hệ thống thông báo.
#line(length:100%)
#figure(
  image("../Figures/uc_quantri.png", width: 70%),
  caption: [Sơ đồ Use Case - Nhóm Quản trị]
)

Nhóm Quản trị trong sơ đồ gồm quản lý người dùng, kiểm duyệt nội dung và quản lý tag. Phần kiểm duyệt nội dung bao gồm xử lý báo cáo và duyệt bài chờ kiểm duyệt. Ngoài các Use Case chính trên sơ đồ, hệ thống còn có thống kê tổng quan và ghi nhật ký quản trị vào bảng `admin_audit_logs` để truy vết.

== 4.3. Kiến trúc hệ thống

Hệ thống được thiết kế theo kiến trúc nhiều tầng:

#figure(
  image("../Figures/system_processing_architecture.svg", width: 100%),
  caption: [Sơ đồ kiến trúc xử lý hệ thống]
)

Sơ đồ kiến trúc xử lý thể hiện:

- Tầng giao diện dùng Next.js để hiển thị trang, quản lý thành phần giao diện và gọi API.
- Tầng tiếp nhận yêu cầu dùng FastAPI router để nhận request, kiểm tra quyền và kiểm tra dữ liệu.
- Tầng xử lý nghiệp vụ gom các xử lý dùng lại như xác thực, bài viết, thông báo và gợi ý nội dung.
- Tầng dữ liệu dùng SQLAlchemy model để thao tác với Microsoft SQL Server.
- Các dịch vụ phụ trợ như Google OAuth, email và upload được tách riêng để dễ thay thế hoặc mở rộng.

#table(
  columns: (auto, 1.8fr, 1.4fr),
  align: (left, left, left),
  table.header([*Tầng*], [*Thành phần*], [*Trách nhiệm*]),
  table.hline(),
  [Giao diện người dùng], [`frontend/app`,\ `frontend/components`], [Hiển thị giao diện, quản lý trạng thái và điều hướng trang.],
  [Lớp gọi API], [`frontend/lib/forumApi.ts`,\ `profileApi.ts`,\ `adminApi.ts`, `axios.ts`], [Gửi yêu cầu đến máy chủ, gắn mã xác thực và làm mới mã khi hết hạn.],
  [Bộ định tuyến API], [`backend/routers/*`], [Nhận yêu cầu, kiểm tra quyền, gọi service/model và trả kết quả.],
  [Lược đồ dữ liệu], [`backend/schemas/*`], [Kiểm tra dữ liệu vào và định dạng dữ liệu trả ra bằng Pydantic.],
  [Dịch vụ xử lý], [`backend/services/*`], [Xử lý nghiệp vụ dùng lại nhiều nơi: xác thực, email, đồng bộ tag, thông báo và gợi ý nội dung.],
  [Mô hình dữ liệu], [`backend/models/*`], [Định nghĩa bảng SQLAlchemy và quan hệ giữa các bảng.],
  [Cơ sở dữ liệu], [Microsoft SQL Server], [Lưu dữ liệu quan hệ và bảo đảm khóa chính/khóa ngoại.],
)


== 4.4. Đặc tả luồng xử lý và DFD

Phần này đặc tả 25 Use Case theo cùng một cấu trúc: ảnh DFD, tiền điều kiện, hậu điều kiện, luồng sự kiện chính và luồng phụ/ngoại lệ. Cách trình bày này giúp liên kết trực tiếp giữa sơ đồ DFD và quy trình xử lý nghiệp vụ của hệ thống.

=== 4.4.1. Nhóm quản lý xác thực

*UC-01. Đăng ký tài khoản*

#figure(image("../Figures/dfd_uc01.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-01: Đăng ký tài khoản])

*Tiền điều kiện:* Khách chưa đăng nhập và chưa có tài khoản trùng email/tên đăng nhập trong hệ thống.

*Hậu điều kiện:* Tài khoản mới được tạo ở trạng thái đang hoạt động nhưng chưa xác minh email; token xác minh được tạo.

*Luồng sự kiện chính:*
1. Khách nhập tên đăng nhập, email, họ tên và mật khẩu.
2. Hệ thống kiểm tra dữ liệu nhập và kiểm tra trùng email/tên đăng nhập.
3. Hệ thống băm mật khẩu bằng Argon2.
4. Hệ thống tạo tài khoản với vai trò Sinh viên.
5. Hệ thống tạo token xác minh email và lưu vào cơ sở dữ liệu.
6. Hệ thống thông báo đăng ký thành công và hướng dẫn xác minh email.

*Luồng phụ/ngoại lệ:*
- Email hoặc tên đăng nhập đã tồn tại: hệ thống báo lỗi và yêu cầu nhập lại.
- Dữ liệu không hợp lệ: hệ thống trả lỗi kiểm tra dữ liệu.

*UC-02. Đăng nhập*

#figure(image("../Figures/dfd_uc02.png", width: 70%), caption: [Sơ đồ luồng dữ liệu - UC-02: Đăng nhập])

*Tiền điều kiện:* Người dùng đã có tài khoản và đã xác minh email.

*Hậu điều kiện:* Người dùng nhận access token, refresh token và có thể truy cập các chức năng được bảo vệ.

*Luồng sự kiện chính:*
1. Người dùng nhập email/tên đăng nhập và mật khẩu.
2. Hệ thống tìm tài khoản tương ứng.
3. Hệ thống kiểm tra trạng thái tài khoản, trạng thái xác minh email và mật khẩu.
4. Hệ thống tạo access token và refresh token.
5. Hệ thống lưu refresh token vào bảng `auth_sessions`.
6. Giao diện lưu phiên đăng nhập và chuyển người dùng vào hệ thống.

*Luồng phụ/ngoại lệ:*
- Không tìm thấy tài khoản hoặc sai mật khẩu: hệ thống báo lỗi đăng nhập.
- Tài khoản bị khóa: hệ thống từ chối đăng nhập.
- Tài khoản chưa xác minh email: hệ thống yêu cầu xác minh email trước.

*UC-03. Đăng xuất*

#figure(image("../Figures/dfd_uc03.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-03: Đăng xuất])

*Tiền điều kiện:* Người dùng đang đăng nhập.

*Hậu điều kiện:* Phiên đăng nhập bị thu hồi; token phía trình duyệt được xóa.

*Luồng sự kiện chính:*
1. Người dùng chọn đăng xuất.
2. Giao diện gửi refresh token đến máy chủ.
3. Hệ thống tìm phiên đăng nhập tương ứng trong `auth_sessions`.
4. Hệ thống xóa phiên đăng nhập khỏi cơ sở dữ liệu.
5. Giao diện xóa dữ liệu đăng nhập khỏi trình duyệt.

*Luồng phụ/ngoại lệ:*
- Refresh token không tồn tại hoặc đã hết hạn: giao diện vẫn xóa dữ liệu đăng nhập cục bộ.

*UC-04. Quên mật khẩu*

#figure(image("../Figures/dfd_uc04.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-04: Quên mật khẩu])

*Tiền điều kiện:* Người dùng có tài khoản đã đăng ký bằng email.

*Hậu điều kiện:* Mật khẩu được cập nhật nếu token hợp lệ; các phiên đăng nhập cũ bị thu hồi.

*Luồng sự kiện chính:*
1. Người dùng nhập email để yêu cầu đặt lại mật khẩu.
2. Hệ thống kiểm tra email có tồn tại không.
3. Hệ thống tạo token đặt lại mật khẩu và lưu vào `password_reset_tokens`.
4. Người dùng mở đường dẫn đặt lại mật khẩu và nhập mật khẩu mới.
5. Hệ thống kiểm tra token còn hạn và chưa sử dụng.
6. Hệ thống băm mật khẩu mới, cập nhật tài khoản và thu hồi các phiên đăng nhập cũ.

*Luồng phụ/ngoại lệ:*
- Email không tồn tại: hệ thống thông báo phù hợp.
- Token hết hạn hoặc đã dùng: hệ thống từ chối đặt lại mật khẩu.

=== 4.4.2. Nhóm quản lý bài viết

*UC-05. Tạo bài viết*

#figure(image("../Figures/dfd_uc05.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-05: Tạo bài viết])

*Tiền điều kiện:* Người dùng đã đăng nhập, đã xác minh email và hoàn thiện hồ sơ.

*Hậu điều kiện:* Bài viết mới được lưu; bài của sinh viên ở trạng thái chờ duyệt, bài của quản trị viên có thể hiển thị ngay.

*Luồng sự kiện chính:*
1. Người dùng nhập tiêu đề, nội dung, ảnh bìa và tag.
2. Hệ thống kiểm tra dữ liệu bài viết.
3. Hệ thống tạo slug từ tiêu đề.
4. Hệ thống tạo bản ghi bài viết.
5. Hệ thống xử lý tag đã có và tag mới.
6. Hệ thống trả thông tin bài viết vừa tạo.

*Luồng phụ/ngoại lệ:*
- Tiêu đề hoặc nội dung không hợp lệ: hệ thống báo lỗi.
- Tag mới do sinh viên nhập: hệ thống lưu vào danh sách tag chờ duyệt.

*UC-06. Chỉnh sửa bài viết*

#figure(image("../Figures/dfd_uc06.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-06: Chỉnh sửa bài viết])

*Tiền điều kiện:* Bài viết tồn tại và người dùng hiện tại là tác giả.

*Hậu điều kiện:* Nội dung bài viết được cập nhật; bài của sinh viên chuyển về trạng thái chờ duyệt.

*Luồng sự kiện chính:*
1. Người dùng mở bài viết cần chỉnh sửa.
2. Người dùng cập nhật tiêu đề, nội dung, ảnh bìa hoặc tag.
3. Hệ thống kiểm tra quyền sở hữu bài viết.
4. Hệ thống cập nhật dữ liệu bài viết và đồng bộ tag.
5. Hệ thống trả bài viết sau khi cập nhật.

*Luồng phụ/ngoại lệ:*
- Không phải tác giả: hệ thống từ chối thao tác.
- Bài viết không tồn tại: hệ thống báo lỗi không tìm thấy.

*UC-07. Xóa bài viết*

#figure(image("../Figures/dfd_uc07.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-07: Xóa bài viết])

*Tiền điều kiện:* Bài viết tồn tại; người dùng là tác giả hoặc quản trị viên.

*Hậu điều kiện:* Bài viết và dữ liệu liên quan được xóa khỏi hệ thống.

*Luồng sự kiện chính:*
1. Người dùng chọn xóa bài viết.
2. Hệ thống kiểm tra bài viết tồn tại.
3. Hệ thống kiểm tra quyền xóa.
4. Hệ thống xóa bài viết và các dữ liệu liên quan.
5. Hệ thống thông báo xóa thành công.

*Luồng phụ/ngoại lệ:*
- Sinh viên xóa bài đã có bình luận: hệ thống từ chối.
- Người dùng không có quyền: hệ thống báo lỗi quyền truy cập.

*UC-08. Xem chi tiết bài viết*

#figure(image("../Figures/dfd_uc08.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-08: Xem chi tiết bài viết])

*Tiền điều kiện:* Người dùng đã đăng nhập; bài viết tồn tại.

*Hậu điều kiện:* Chi tiết bài viết được hiển thị; lượt xem được ghi nhận.

*Luồng sự kiện chính:*
1. Người dùng chọn một bài viết.
2. Hệ thống kiểm tra bài viết tồn tại và quyền xem.
3. Hệ thống ghi nhận lượt xem.
4. Hệ thống tính số lượt thích, bình luận, xem, chia sẻ.
5. Hệ thống trả chi tiết bài viết, tác giả, tag và trạng thái tương tác.

*Luồng phụ/ngoại lệ:*
- Bài viết chưa hiển thị và người xem không phải tác giả/quản trị viên: hệ thống từ chối.
- Bài viết không tồn tại: hệ thống báo lỗi.

=== 4.4.3. Nhóm quản lý bảng tin

*UC-09. Xem bảng tin*

#figure(image("../Figures/dfd_uc09.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-09: Xem bảng tin])

*Tiền điều kiện:* Người dùng đã đăng nhập và đủ điều kiện sử dụng hệ thống.

*Hậu điều kiện:* Danh sách bài viết phù hợp được hiển thị theo phân trang.

*Luồng sự kiện chính:*
1. Người dùng truy cập bảng tin.
2. Giao diện gửi chế độ xem và thông tin phân trang.
3. Hệ thống truy vấn các bài viết đang hiển thị.
4. Hệ thống tính thống kê tương tác và trạng thái đã thích/đã lưu.
5. Hệ thống trả danh sách bài viết và thông tin phân trang.

*Luồng phụ/ngoại lệ:*
- Không có bài phù hợp: hệ thống trả danh sách rỗng.

*UC-10. Tìm kiếm bài viết*

#figure(image("../Figures/dfd_uc10.png", width: 68%), caption: [Sơ đồ luồng dữ liệu - UC-10: Tìm kiếm bài viết])

*Tiền điều kiện:* Người dùng đang ở bảng tin.

*Hậu điều kiện:* Danh sách bài viết được lọc theo từ khóa.

*Luồng sự kiện chính:*
1. Người dùng nhập từ khóa tìm kiếm.
2. Giao diện chờ người dùng ngừng nhập rồi gửi yêu cầu.
3. Hệ thống tìm bài theo tiêu đề và nội dung.
4. Hệ thống chỉ lấy bài viết đang hiển thị.
5. Hệ thống trả kết quả tìm kiếm.

*Luồng phụ/ngoại lệ:*
- Từ khóa rỗng: hệ thống hiển thị lại danh sách mặc định.
- Không có kết quả: hệ thống trả danh sách rỗng.

*UC-11. Lọc bài viết theo tag*

#figure(image("../Figures/dfd_uc11.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-11: Lọc bài viết theo tag])

*Tiền điều kiện:* Người dùng đang ở bảng tin; tag tồn tại trong hệ thống.

*Hậu điều kiện:* Danh sách bài viết thuộc tag được chọn được hiển thị.

*Luồng sự kiện chính:*
1. Người dùng chọn tag.
2. Hệ thống tìm tag tương ứng.
3. Hệ thống lấy các bài viết gắn tag qua bảng `post_tags`.
4. Hệ thống trả danh sách bài viết đang hiển thị thuộc tag đó.

*Luồng phụ/ngoại lệ:*
- Tag không tồn tại: hệ thống trả danh sách rỗng hoặc bỏ điều kiện lọc.

*UC-12. Sắp xếp bài viết*

#figure(image("../Figures/dfd_uc12.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-12: Sắp xếp bài viết])

*Tiền điều kiện:* Người dùng đang xem bảng tin.

*Hậu điều kiện:* Danh sách bài viết được hiển thị theo thứ tự mới.

*Luồng sự kiện chính:*
1. Người dùng chọn tiêu chí sắp xếp.
2. Hệ thống tính các số liệu tương tác cần thiết.
3. Hệ thống sắp xếp theo mới nhất, xu hướng, nhiều lượt thích hoặc nhiều bình luận.
4. Hệ thống trả danh sách bài viết đã sắp xếp.

*Luồng phụ/ngoại lệ:*
- Tiêu chí không hợp lệ: hệ thống dùng tiêu chí mặc định là mới nhất.
#line(length: 100%)
- *Ghi chú xử lý: Cách tính điểm xu hướng*

Điểm xu hướng được dùng khi người dùng chọn chế độ xem xu hướng hoặc tiêu chí sắp xếp theo xu hướng. Điểm này không được lưu cố định trong bảng `posts`, mà được tính khi truy vấn từ các bảng tương tác như `post_likes`, `comments`, `post_views` và `post_shares`.

```text
điểm_xu_hướng = số_lượt_thích * 4 + số_bình_luận * 3 + số_lượt_xem
```

Với API gợi ý xu hướng chuyên biệt, hệ thống có thể dùng thêm lượt chia sẻ và hệ số thời gian:

```text
điểm_cơ_sở = số_lượt_thích * 4
            + số_bình_luận * 3
            + số_lượt_xem * 0.5
            + số_lượt_chia_sẻ * 2

điểm_xu_hướng = điểm_cơ_sở * hệ_số_thời_gian
```

=== 4.4.4. Nhóm quản lý tương tác

*UC-13. Like bài viết*

#figure(image("../Figures/dfd_uc13.png", width: 65%), caption: [Sơ đồ luồng dữ liệu - UC-13: Like bài viết])

*Tiền điều kiện:* Người dùng đã đăng nhập; bài viết tồn tại.

*Hậu điều kiện:* Trạng thái thích của người dùng đối với bài viết được thay đổi.

*Luồng sự kiện chính:*
1. Người dùng bấm thích bài viết.
2. Hệ thống kiểm tra bài viết tồn tại.
3. Nếu chưa thích, hệ thống thêm bản ghi lượt thích.
4. Hệ thống tạo thông báo cho tác giả nếu cần.
5. Hệ thống trả thông báo thao tác thành công.

*Luồng phụ/ngoại lệ:*
- Người dùng đã thích trước đó: hệ thống xóa lượt thích.

*UC-14. Bookmark bài viết*

#figure(image("../Figures/dfd_uc14.png", width: 65%), caption: [Sơ đồ luồng dữ liệu - UC-14: Bookmark bài viết])

*Tiền điều kiện:* Người dùng đã đăng nhập; bài viết tồn tại.

*Hậu điều kiện:* Trạng thái lưu bài của người dùng được thay đổi.

*Luồng sự kiện chính:*
1. Người dùng bấm lưu bài viết.
2. Hệ thống kiểm tra bài viết tồn tại.
3. Nếu chưa lưu, hệ thống thêm bản ghi vào `bookmarks`.
4. Hệ thống trả thông báo đã lưu bài.

*Luồng phụ/ngoại lệ:*
- Người dùng đã lưu trước đó: hệ thống xóa bản ghi lưu bài.

*UC-15. Chia sẻ bài viết*

#figure(image("../Figures/dfd_uc15.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-15: Chia sẻ bài viết])

*Tiền điều kiện:* Người dùng đã đăng nhập; bài viết gốc tồn tại.

*Hậu điều kiện:* Lượt chia sẻ được ghi nhận; bài chia sẻ mới được tạo.

*Luồng sự kiện chính:*
1. Người dùng chọn chia sẻ bài viết.
2. Hệ thống kiểm tra bài viết gốc tồn tại.
3. Hệ thống tạo bản ghi trong `post_shares`.
4. Hệ thống tạo bài viết chia sẻ có liên kết về bài gốc.
5. Hệ thống tạo thông báo cho tác giả bài gốc nếu cần.

*Luồng phụ/ngoại lệ:*
- Bài gốc không tồn tại: hệ thống báo lỗi.
- Người chia sẻ là sinh viên: bài chia sẻ ở trạng thái chờ duyệt.

*UC-16. Bình luận bài viết*

#figure(image("../Figures/dfd_uc16.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-16: Bình luận bài viết])

*Tiền điều kiện:* Người dùng đã đăng nhập; bài viết tồn tại.

*Hậu điều kiện:* Bình luận mới được lưu và hiển thị.

*Luồng sự kiện chính:*
1. Người dùng nhập nội dung bình luận.
2. Hệ thống kiểm tra nội dung không rỗng.
3. Hệ thống tạo bình luận cấp 1.
4. Hệ thống tạo thông báo cho tác giả bài viết nếu cần.
5. Hệ thống trả bình luận mới.

*Luồng phụ/ngoại lệ:*
- Nội dung rỗng: hệ thống báo lỗi.
- Bài viết không tồn tại: hệ thống báo lỗi.

*UC-17. Trả lời bình luận*

#figure(image("../Figures/dfd_uc17.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-17: Trả lời bình luận])

*Tiền điều kiện:* Người dùng đã đăng nhập; bài viết và bình luận cha tồn tại.

*Hậu điều kiện:* Bình luận trả lời được lưu dưới bình luận cha.

*Luồng sự kiện chính:*
1. Người dùng nhập nội dung trả lời.
2. Hệ thống kiểm tra bình luận cha tồn tại.
3. Hệ thống kiểm tra bình luận cha thuộc đúng bài viết.
4. Hệ thống tạo bình luận mới có `parent_id`.
5. Hệ thống tạo thông báo cho người liên quan nếu cần.

*Luồng phụ/ngoại lệ:*
- Bình luận cha không tồn tại: hệ thống báo lỗi.
- Nội dung rỗng: hệ thống báo lỗi.

*UC-18. Báo cáo nội dung*

#figure(image("../Figures/dfd_uc18.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-18: Báo cáo nội dung])

*Tiền điều kiện:* Người dùng đã đăng nhập; nội dung bị báo cáo tồn tại.

*Hậu điều kiện:* Báo cáo mới được lưu ở trạng thái chờ xử lý.

*Luồng sự kiện chính:*
1. Người dùng chọn nội dung cần báo cáo.
2. Người dùng nhập lý do và mô tả nếu có.
3. Hệ thống kiểm tra nội dung tồn tại.
4. Hệ thống kiểm tra người dùng đã báo cáo nội dung này chưa.
5. Hệ thống tạo báo cáo mới.

*Luồng phụ/ngoại lệ:*
- Người dùng đã báo cáo cùng nội dung: hệ thống từ chối tạo báo cáo trùng.

=== 4.4.5. Nhóm quản lý hồ sơ và xã hội

*UC-19. Xem hồ sơ người dùng*

#figure(image("../Figures/dfd_uc19.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-19: Xem hồ sơ người dùng])

*Tiền điều kiện:* Người dùng đã đăng nhập; hồ sơ cần xem tồn tại.

*Hậu điều kiện:* Hồ sơ công khai và thống kê cơ bản được hiển thị.

*Luồng sự kiện chính:*
1. Người dùng truy cập hồ sơ theo tên đăng nhập.
2. Hệ thống tìm tài khoản tương ứng.
3. Hệ thống tính số người theo dõi, số người đang theo dõi và số bài viết.
4. Hệ thống kiểm tra quan hệ theo dõi với người dùng hiện tại.
5. Hệ thống trả dữ liệu hồ sơ.

*Luồng phụ/ngoại lệ:*
- Không tìm thấy hồ sơ: hệ thống báo lỗi.

*UC-20. Chỉnh sửa hồ sơ*

#figure(image("../Figures/dfd_uc20.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-20: Chỉnh sửa hồ sơ])

*Tiền điều kiện:* Người dùng đã đăng nhập và chỉnh sửa hồ sơ của chính mình.

*Hậu điều kiện:* Thông tin hồ sơ được cập nhật.

*Luồng sự kiện chính:*
1. Người dùng nhập thông tin hồ sơ mới.
2. Hệ thống kiểm tra dữ liệu bắt buộc.
3. Hệ thống cập nhật bản ghi người dùng hiện tại.
4. Hệ thống trả hồ sơ mới nhất.

*Luồng phụ/ngoại lệ:*
- Họ tên không hợp lệ: hệ thống báo lỗi.

*UC-21. Follow/Unfollow*

#figure(image("../Figures/dfd_uc21.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-21: Follow/Unfollow])

*Tiền điều kiện:* Người dùng đã đăng nhập; người dùng mục tiêu tồn tại.

*Hậu điều kiện:* Quan hệ theo dõi được tạo hoặc xóa.

*Luồng sự kiện chính:*
1. Người dùng chọn theo dõi hoặc hủy theo dõi.
2. Hệ thống kiểm tra người dùng mục tiêu tồn tại.
3. Hệ thống kiểm tra không tự theo dõi chính mình.
4. Hệ thống thêm hoặc xóa bản ghi trong `follows`.
5. Hệ thống trả trạng thái theo dõi mới.

*Luồng phụ/ngoại lệ:*
- Người dùng tự theo dõi chính mình: hệ thống báo lỗi.

*UC-25. Xem thông báo*

#figure(image("../Figures/dfd_uc25.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-25: Xem thông báo])

*Tiền điều kiện:* Người dùng đã đăng nhập.

*Hậu điều kiện:* Danh sách thông báo được hiển thị; thông báo được đánh dấu đã đọc nếu người dùng mở.

*Luồng sự kiện chính:*
1. Người dùng mở danh sách thông báo.
2. Hệ thống lấy thông báo thuộc người dùng hiện tại.
3. Hệ thống sắp xếp thông báo theo thời gian mới nhất.
4. Người dùng chọn một thông báo.
5. Hệ thống cập nhật `is_read = true`.

*Luồng phụ/ngoại lệ:*
- Thông báo không thuộc người dùng hiện tại: hệ thống từ chối cập nhật.

=== 4.4.6. Nhóm quản trị hệ thống

*UC-22. Quản lý người dùng*

#figure(image("../Figures/dfd_uc22.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-22: Quản lý người dùng])

*Tiền điều kiện:* Người dùng hiện tại là quản trị viên.

*Hậu điều kiện:* Danh sách người dùng được hiển thị hoặc trạng thái tài khoản được cập nhật.

*Luồng sự kiện chính:*
1. Quản trị viên mở danh sách người dùng.
2. Hệ thống kiểm tra vai trò quản trị viên.
3. Hệ thống áp dụng tìm kiếm, lọc, sắp xếp và phân trang.
4. Quản trị viên chọn khóa hoặc mở khóa tài khoản.
5. Hệ thống cập nhật trạng thái tài khoản, ghi nhật ký và tạo thông báo.

*Luồng phụ/ngoại lệ:*
- Quản trị viên tự khóa mình: hệ thống từ chối.
- Tài khoản mục tiêu là quản trị viên khác: hệ thống từ chối khóa.

*UC-23. Kiểm duyệt nội dung*

#figure(image("../Figures/dfd_uc23.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-23: Kiểm duyệt nội dung])

*Tiền điều kiện:* Người dùng hiện tại là quản trị viên.

*Hậu điều kiện:* Báo cáo hoặc bài chờ duyệt được cập nhật trạng thái; thao tác được ghi nhật ký.

*Luồng sự kiện chính:*
1. Quản trị viên mở danh sách báo cáo hoặc bài chờ duyệt.
2. Hệ thống kiểm tra vai trò quản trị viên.
3. Quản trị viên chọn báo cáo để xử lý hoặc bài viết để duyệt/từ chối.
4. Hệ thống cập nhật trạng thái đối tượng.
5. Hệ thống ghi nhật ký quản trị.
6. Hệ thống tạo thông báo cho người liên quan nếu cần.

*Luồng phụ/ngoại lệ:*
- Báo cáo hoặc bài viết không tồn tại: hệ thống báo lỗi.
- Trạng thái xử lý không hợp lệ: hệ thống từ chối cập nhật.

*UC-24. Quản lý tags*

#figure(image("../Figures/dfd_uc24.png", width: 80%), caption: [Sơ đồ luồng dữ liệu - UC-24: Quản lý tags])

*Tiền điều kiện:* Người dùng hiện tại là quản trị viên.

*Hậu điều kiện:* Danh mục tag được thêm, sửa hoặc xóa.

*Luồng sự kiện chính:*
1. Quản trị viên mở danh sách tag.
2. Hệ thống kiểm tra vai trò quản trị viên.
3. Quản trị viên thêm, sửa hoặc xóa tag.
4. Hệ thống chuẩn hóa tên tag và tạo slug.
5. Hệ thống kiểm tra trùng tên hoặc slug.
6. Hệ thống lưu thay đổi và trả kết quả.

*Luồng phụ/ngoại lệ:*
- Tag đã tồn tại: hệ thống báo lỗi.
- Tag không tồn tại khi sửa/xóa: hệ thống báo lỗi.
#line(length: 100%)
- *Chức năng hỗ trợ quản trị: Thống kê và nhật ký*

*Tiền điều kiện:* Người dùng hiện tại là quản trị viên.

*Hậu điều kiện:* Quản trị viên xem được số liệu tổng quan; thao tác quan trọng được lưu vết.

*Luồng sự kiện chính:*
1. Quản trị viên mở trang thống kê.
2. Hệ thống tính số người dùng, bài viết, bình luận, báo cáo trong 24 giờ và 7 ngày.
3. Hệ thống tính số báo cáo đang chờ xử lý và số bài đang chờ duyệt.
4. Khi quản trị viên thực hiện thao tác quan trọng, hệ thống lưu `admin_user_id`, `action_type`, `target_type`, `target_id`, `notes`, `created_at` vào `admin_audit_logs`.

*Luồng phụ/ngoại lệ:*
- Người dùng không có vai trò quản trị viên: hệ thống từ chối truy cập.


== 4.5. Các sơ đồ mô hình hóa bổ sung

Ngoài Use Case và DFD, hệ thống còn được mô hình hóa thêm bằng Sequence Diagram, Collaboration Diagram, State Diagram và Activity Diagram. Các sơ đồ này giúp làm rõ thứ tự tương tác, quan hệ phối hợp giữa các thành phần, trạng thái của đối tượng chính và dòng hoạt động của một nghiệp vụ tiêu biểu.

=== 4.5.1. Sequence Diagram

Sequence Diagram được thiết kế cho các nghiệp vụ phức tạp, có nhiều bước xử lý và nhiều thành phần tham gia. Trong phạm vi báo cáo, nhóm chọn các luồng tiêu biểu gồm đăng nhập, xem bảng tin, tạo bài viết và kiểm duyệt, bình luận và thông báo, báo cáo và kiểm duyệt nội dung.

#figure(
  image("../Figures/seq_login.svg", width: 100%),
  caption: [Sequence Diagram - Đăng nhập]
)

Sơ đồ tuần tự này mô tả riêng nghiệp vụ đăng nhập. Người dùng nhập email hoặc tên đăng nhập và mật khẩu, giao diện gửi yêu cầu đến API xác thực, máy chủ tìm tài khoản trong cơ sở dữ liệu, kiểm tra trạng thái tài khoản, xác minh email và mật khẩu. Nếu hợp lệ, hệ thống tạo access token, refresh token, lưu phiên đăng nhập vào `auth_sessions` và trả kết quả về giao diện.

#figure(
  image("../Figures/seq_feed.svg", width: 100%),
  caption: [Sequence Diagram - Xem bảng tin]
)

Sơ đồ tuần tự này mô tả riêng nghiệp vụ xem bảng tin sau khi người dùng đã đăng nhập. Giao diện gửi yêu cầu lấy bảng tin kèm access token, máy chủ kiểm tra người dùng đủ điều kiện sử dụng hệ thống, truy vấn bài viết đang hiển thị theo chế độ xem và tiêu chí sắp xếp, tính số lượt thích, bình luận, lượt xem và trạng thái đã lưu, sau đó trả danh sách bài viết cùng thông tin phân trang.

#figure(
  image("../Figures/seq_create_post_moderation.svg", width: 90%),
  caption: [Sequence Diagram - Tạo bài viết và kiểm duyệt]
)

Sơ đồ tuần tự này mô tả luồng tạo bài viết có kiểm duyệt. Sinh viên nhập nội dung bài viết và gửi yêu cầu tạo bài. Hệ thống tạo slug, xử lý tag, lưu bài ở trạng thái chờ duyệt và trả kết quả cho giao diện. Sau đó quản trị viên xem danh sách bài chờ duyệt, chọn duyệt hoặc từ chối, hệ thống cập nhật trạng thái bài viết, tạo tag mới nếu cần và ghi nhật ký quản trị.

#figure(
  image("../Figures/seq_comment_notification.svg", width: 90%),
  caption: [Sequence Diagram - Bình luận và thông báo]
)

Sơ đồ tuần tự này mô tả luồng bình luận bài viết và phát sinh thông báo. Người dùng nhập nội dung bình luận, giao diện gửi yêu cầu đến API bình luận, máy chủ kiểm tra bài viết tồn tại, lưu bình luận vào cơ sở dữ liệu và tạo thông báo cho tác giả bài viết nếu người bình luận không phải chính tác giả. Kết quả bình luận mới được trả về giao diện để hiển thị ngay trong trang chi tiết bài viết.

#figure(
  image("../Figures/seq_report_moderation.svg", width: 100%),
  caption: [Sequence Diagram - Báo cáo và kiểm duyệt nội dung]
)

Sơ đồ tuần tự này mô tả luồng báo cáo nội dung và xử lý bởi quản trị viên. Người dùng gửi lý do báo cáo, hệ thống kiểm tra nội dung bị báo cáo và chống báo cáo trùng, sau đó lưu báo cáo ở trạng thái chờ xử lý. Quản trị viên xem danh sách báo cáo, cập nhật trạng thái xử lý, hệ thống ghi nhật ký quản trị và tạo thông báo cho người đã gửi báo cáo.

=== 4.5.2. Collaboration Diagram

Nhóm chọn hai nghiệp vụ *Tạo bài viết và duyệt bài* và *Báo cáo, kiểm duyệt nội dung* để vẽ Collaboration Diagram vì đây là các luồng có nhiều thành phần phối hợp. Hai luồng này không chỉ có thao tác từ người dùng cuối mà còn có xử lý nghiệp vụ, cập nhật nhiều bảng dữ liệu, thao tác của quản trị viên và ghi nhận nhật ký quản trị.

#figure(
  image("../Figures/collab_post_moderation.svg", width: 100%),
  caption: [Collaboration Diagram - Tạo bài viết và duyệt bài]
)

Sơ đồ tạo bài viết và duyệt bài thể hiện các điểm chính:

- Sinh viên nhập nội dung trên giao diện và gửi yêu cầu tạo bài qua Post API.
- Post service lưu bài vào `posts` với trạng thái `pending`.
- Hệ thống chỉ gắn các tag đã tồn tại vào `post_tags`; tag mới được lưu tạm trong `requested_new_tags`.
- Khi quản trị viên duyệt bài, Admin API tạo tag mới nếu cần, gắn thêm vào `post_tags` và đổi bài sang `active`.
- Khi quản trị viên từ chối bài, hệ thống đổi bài sang `rejected` và xóa danh sách tag đề xuất.
- Mọi thao tác duyệt hoặc từ chối đều được ghi vào `admin_audit_logs`.

#figure(
  image("../Figures/collab_report_moderation.svg", width: 100%),
  caption: [Collaboration Diagram - Báo cáo và kiểm duyệt nội dung]
)

Sơ đồ báo cáo và kiểm duyệt nội dung thể hiện các điểm chính:

- Người dùng chọn bài viết hoặc bình luận vi phạm và gửi lý do báo cáo.
- Report API kiểm tra nội dung được báo cáo còn tồn tại.
- Hệ thống chống báo cáo trùng từ cùng một người dùng.
- Báo cáo được lưu vào `reports` với trạng thái `pending`.
- Quản trị viên xem danh sách báo cáo và cập nhật trạng thái xử lý qua Admin API.
- Hệ thống ghi thao tác vào `admin_audit_logs` và tạo thông báo trong `notifications` cho người báo cáo.
- Theo mã nguồn hiện tại, bước xử lý báo cáo chưa tự ẩn hoặc xóa trực tiếp bài viết/bình luận bị báo cáo.

=== 4.5.3. State Diagram

Nhóm minh họa các State Diagram cho những đối tượng và thuộc tính trạng thái quan trọng nhất trong hệ thống: bài viết, báo cáo, tài khoản người dùng và vai trò người dùng.

#figure(
  image("../Figures/state_post_lifecycle.svg", width: 95%),
  caption: [State Diagram - Vòng đời bài viết]
)

Sơ đồ vòng đời bài viết thể hiện:

- Sinh viên tạo hoặc chỉnh sửa bài viết: bài ở trạng thái `pending`.
- Quản trị viên duyệt bài: bài chuyển sang `active`.
- Quản trị viên từ chối bài: bài chuyển sang `rejected`.
- Nếu bài bị sửa lại sau khi bị từ chối, hệ thống đưa bài về `pending`.
- Quản trị viên tạo bài thì bài có thể ở trạng thái `active` ngay.

#figure(
  image("../Figures/state_report_lifecycle.svg", width: 95%),
  caption: [State Diagram - Vòng đời báo cáo]
)

Sơ đồ vòng đời báo cáo thể hiện:

- Người dùng gửi báo cáo: báo cáo được lưu với trạng thái `pending`.
- Quản trị viên xử lý báo cáo và cập nhật trạng thái sang `reviewed`, `dismissed` hoặc `resolved`.
- Mỗi lần cập nhật trạng thái, hệ thống ghi `admin_audit_logs`.
- Nếu báo cáo có người gửi, hệ thống tạo thông báo `report_update` cho người báo cáo.

#figure(
  image("../Figures/state_user_account.svg", width: 100%),
  caption: [State Diagram - Trạng thái tài khoản người dùng]
)

Sơ đồ trạng thái tài khoản người dùng thể hiện:

- Tài khoản đăng ký bằng email được tạo với `status = active` nhưng `is_verified = false`.
- Sau khi xác minh email, tài khoản đủ điều kiện sử dụng các chức năng yêu cầu đăng nhập.
- Quản trị viên có thể khóa tài khoản bằng cách chuyển `status` sang `banned`.
- Khi được mở khóa, tài khoản quay lại `active`.
- Mã nguồn cũng xử lý trạng thái `deleted` khi đăng nhập hoặc truy cập hệ thống.

=== 4.5.4. Activity Diagram

Nhóm chọn hai nghiệp vụ *Tạo bài viết* và *Báo cáo, xử lý báo cáo* để minh họa bằng Activity Diagram vì đây là các quy trình có nhiều bước xử lý, có nhánh rẽ và thể hiện rõ trách nhiệm giữa người dùng, hệ thống và quản trị viên. Hai sơ đồ này giúp bổ sung góc nhìn về dòng hoạt động, bên cạnh Sequence Diagram và Collaboration Diagram đã mô tả thứ tự tương tác và quan hệ phối hợp.

#figure(
  image("../Figures/activity_create_post.svg", width: 100%),
  caption: [Activity Diagram - Quy trình tạo bài viết]
)

Sơ đồ quy trình tạo bài viết thể hiện:

- Người dùng nhập tiêu đề, nội dung và tag.
- Hệ thống kiểm tra dữ liệu đầu vào.
- Nếu dữ liệu không hợp lệ, hệ thống hiển thị lỗi để người dùng chỉnh sửa.
- Nếu dữ liệu hợp lệ, hệ thống tạo slug và bản ghi bài viết.
- Nếu người tạo là quản trị viên, bài viết có thể được đặt trạng thái `active`.
- Nếu người tạo là sinh viên, bài viết được đặt trạng thái `pending`.
- Hệ thống lưu tag liên quan và trả kết quả về giao diện.

#figure(
  image("../Figures/activity_report_moderation.svg", width: 100%),
  caption: [Activity Diagram - Quy trình báo cáo và xử lý báo cáo]
)

Sơ đồ quy trình báo cáo và xử lý báo cáo thể hiện:

- Người dùng chọn bài viết hoặc bình luận vi phạm và gửi lý do báo cáo.
- Hệ thống kiểm tra nội dung được báo cáo còn tồn tại.
- Nếu nội dung không tồn tại, hệ thống trả lỗi.
- Nếu người dùng đã báo cáo nội dung đó trước đó, hệ thống trả lỗi báo cáo trùng.
- Nếu hợp lệ, hệ thống lưu báo cáo với trạng thái `pending`.
- Quản trị viên xem danh sách báo cáo và chọn trạng thái xử lý.
- Hệ thống cập nhật báo cáo, ghi nhật ký quản trị và tạo thông báo cho người báo cáo.



#pagebreak()
