# Luồng Code Chính Của UITConnect

Tài liệu này dùng để học lại code theo luồng nghiệp vụ từ frontend đến backend. Mỗi chức năng có:

- Điểm bắt đầu ở giao diện.
- API client gọi backend.
- Router/service/model backend xử lý.
- Ghi chú theo file để đọc code nhanh hơn.

## 1. Bức Tranh Tổng Quan

```text
User thao tác UI
  -> React page/component
  -> frontend/lib/*Api.ts
  -> frontend/lib/axios.ts gắn JWT Bearer token
  -> FastAPI router
  -> service/model/schema
  -> SQL Server qua SQLAlchemy + pyodbc ODBC Driver 18
  -> JSON response
  -> UI cập nhật state/toast/redirect
```

### File nền tảng cần nắm

| File | Vai trò | Note học code |
| --- | --- | --- |
| `frontend/lib/axios.ts` | Tạo axios instance, gắn access token, refresh token khi 401 | Đọc request interceptor trước: mọi API đều đi qua đây nên nếu lỗi auth/CORS/API URL thường bắt đầu từ file này. |
| `frontend/lib/forumApi.ts` | Gom API cho post, like, bookmark, share, comment, report | Đây là lớp "client SDK" của frontend; component không gọi URL trực tiếp mà gọi hàm trong file này. |
| `frontend/lib/profileApi.ts` | API profile, follow, notification | Các chức năng social ngoài bài viết nằm ở đây. |
| `backend/main.py` | Khởi tạo FastAPI app, include router, CORS, health check | Nếu endpoint frontend gọi không chạy, kiểm tra router đã được include với prefix `/api` chưa. |
| `backend/database.py` | Tạo engine/session SQLAlchemy, chuẩn hóa `DATABASE_URL` | Repo dùng `mssql+pyodbc`, mặc định ODBC Driver 18; lỗi DB thường bắt đầu từ env hoặc driver ở đây. |
| `backend/dependencies/auth.py` | Dependency xác thực user hiện tại | Router dùng `Depends(require_active_verified_user)` để bắt buộc đăng nhập. |

## 2. Luồng Tạo Bài Viết

### Luồng chạy

```text
/create
  -> CreatePostPage
  -> PostEditor thu title/content/tags/cover_image
  -> createPost() trong frontend/lib/forumApi.ts
  -> POST /api/posts/
  -> backend/routers/post.py:create_post()
  -> Post model + PostTag/Tag sync
  -> commit DB
  -> trả PostResponse
  -> frontend toast + router.push(/post/{id})
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/app/create/page.tsx` | Page tạo bài, bọc layout Sidebar/Topbar, gọi `PostEditor` | Tập trung vào `onSubmit`: chuyển `draft` thành payload backend rồi gọi `createPost`. |
| `frontend/components/post/PostEditor.tsx` | Form dùng chung cho create/edit | State chính là `draft`; tag được thêm/xóa local trước khi submit. File này không tự gọi API, nó nhận `onSubmit` từ page. |
| `frontend/lib/forumApi.ts` | Hàm `createPost(payload)` | Gửi `POST /api/posts/`; payload dùng tên backend: `title`, `content`, `cover_image`, `tags`. |
| `backend/routers/post.py` | Hàm `create_post()` | User admin tạo bài `active`; user thường tạo bài `pending`. Tag mới của user thường được lưu trong `requested_new_tags` để admin duyệt. |
| `backend/services/post_service.py` | `slugify`, `split_known_and_new_tags`, `sync_post_tags`, `serialize_post` | Đây là file xử lý logic phụ: slug, tag, serialize response. Khi bài không hiện đúng tag, đọc file này. |
| `backend/models/post.py` | Bảng `posts` | Chú ý các cột `status`, `original_post_id`, `share_caption`, `requested_new_tags`. |
| `backend/schemas/post_schema.py` | Pydantic schema request/response | `PostCreate` validate input, `PostResponse` định dạng JSON trả frontend. |

### Điểm cần nhớ

- Bài user thường không public ngay, mà `status = pending`.
- Sau khi tạo, frontend vẫn redirect tới `/post/{id}`; backend cho owner xem bài pending.
- Nếu tag chưa tồn tại, user thường chỉ "request" tag, không tạo tag thật ngay.

## 3. Luồng Sửa Bài Viết

### Luồng chạy

```text
/edit/[id]
  -> load getPost(id) + fetchCurrentUser()
  -> nếu không phải owner thì redirect /feed
  -> PostEditor mode="edit"
  -> updatePost(postId, payload)
  -> PUT /api/posts/{post_id}
  -> backend update_post()
  -> user thường sửa xong bài quay về pending
  -> toast + redirect /post/{id}
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/app/edit/[id]/page.tsx` | Page sửa bài | Đọc `useEffect`: vừa load bài vừa load current user để chặn sửa bài của người khác. |
| `frontend/components/post/PostEditor.tsx` | Reuse form edit | Nhận `initialValue` từ bài đang sửa. Nút delete chỉ hiện khi có `onDelete`. |
| `frontend/lib/forumApi.ts` | Hàm `getPost()`, `updatePost()` | `updatePost` gửi `PUT /api/posts/{id}` với partial payload. |
| `backend/routers/post.py` | Hàm `update_post()` | Chỉ author được sửa. User thường sửa xong bị đưa về `pending`; admin có thể set status. |
| `backend/services/post_service.py` | Sync tag sau khi sửa | Nếu sửa tags, backend sync lại bảng liên kết `post_tags`. |

### Điểm cần nhớ

- Frontend tự chặn bằng `postData.user_id !== currentUser.id`, nhưng backend vẫn là lớp bảo vệ thật.
- User thường không thể tự set `status = active` khi sửa.

## 4. Luồng Xóa Bài Viết

### Luồng chạy

```text
/edit/[id]
  -> click Delete post
  -> Modal xác nhận
  -> deletePost(postId)
  -> DELETE /api/posts/{post_id}
  -> backend delete_post()
  -> set post.status = "deleted"
  -> redirect /feed
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/app/edit/[id]/page.tsx` | Mở modal và gọi delete | Xem `onDelete` và `onConfirm` của `Modal`. |
| `frontend/components/ui/Modal.tsx` | Dialog xác nhận xóa | Component UI thuần, không biết nghiệp vụ xóa bài. |
| `frontend/lib/forumApi.ts` | Hàm `deletePost(postId)` | Gọi `DELETE /api/posts/{id}`. |
| `backend/routers/post.py` | Hàm `delete_post()` | Không xóa hard delete; chỉ set `status = deleted`. User không phải admin không được xóa bài đã có comment active. |
| `backend/models/post.py` | Cột `status` | Các trạng thái chính: `pending`, `active`, `rejected`, `deleted`. |

### Điểm cần nhớ

- Đây là soft delete.
- Admin xóa bài của người khác sẽ tạo notification `post_moderation`.

## 5. Luồng Like Bài Viết

### Luồng chạy

```text
PostDetail hoặc PostCard
  -> PostActions
  -> onLikeToggle(post.id)
  -> frontend optimistic update số like
  -> togglePostLike(postId)
  -> POST /api/posts/{post_id}/like
  -> backend toggle_like()
  -> thêm/xóa PostLike
  -> nếu like bài người khác thì create_notification("post_like")
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/post/PostActions.tsx` | Nút like/bookmark/share/report | `handleLike` không tự biết API; nó gọi callback `onLikeToggle`. |
| `frontend/app/post/[id]/page.tsx` | State `liked`, optimistic update | Đọc `handleToggleLike`: cập nhật UI trước, nếu API fail thì rollback. |
| `frontend/lib/forumApi.ts` | Hàm `togglePostLike()` | Gọi `POST /api/posts/{id}/like`. |
| `backend/routers/post.py` | Hàm `toggle_like()` | Nếu đã like thì delete record; nếu chưa thì insert `PostLike`. |
| `backend/models/post_like.py` | Bảng like | Composite key thường là `user_id + post_id`. |
| `backend/services/notification_service.py` | Tạo notification like | Không gửi notification nếu tự like bài của mình. |

### Điểm cần nhớ

- Like là toggle: cùng một endpoint cho like và unlike.
- Frontend dùng optimistic UI nên cảm giác nhanh, nhưng cần rollback khi API fail.

## 6. Luồng Bookmark Bài Viết

### Luồng chạy

```text
PostActions
  -> handleBookmark()
  -> onBookmarkToggle(post.id)
  -> toggleBookmark(postId)
  -> POST /api/posts/{post_id}/bookmark
  -> backend toggle_bookmark()
  -> thêm/xóa Bookmark
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/post/PostActions.tsx` | Nút Save | UI đổi icon/text dựa trên `bookmarked`. |
| `frontend/app/post/[id]/page.tsx` | State `bookmarked` | `handleToggleBookmark` optimistic update đơn giản hơn like vì không cần tăng counter. |
| `frontend/lib/forumApi.ts` | Hàm `toggleBookmark()` | Gọi endpoint bookmark. |
| `backend/routers/post.py` | Hàm `toggle_bookmark()` | Tìm bookmark existing; có thì xóa, chưa có thì tạo. |
| `backend/models/bookmark.py` | Bảng bookmark | Liên kết user với post đã lưu. |
| `frontend/lib/profileApi.ts` | Hàm `getUserBookmarks()` | Profile page dùng để đọc danh sách bài đã lưu của chính user. |

### Điểm cần nhớ

- Bookmark không tạo notification.
- Người khác không xem được bookmark của bạn.

## 7. Luồng Share Bài Viết

### Luồng chạy

```text
PostActions Share
  -> router.push(/post/{id}/share)
  -> SharePostPage load bài gốc
  -> user nhập caption
  -> sharePostWithEdit(postId, { caption })
  -> POST /api/posts/{post_id}/share
  -> backend share_post()
  -> tạo record PostShare
  -> tạo một Post mới có original_post_id
  -> tạo notification post_share cho chủ bài gốc
  -> trả message="/post/{shared_post.id}"
  -> frontend redirect tới bài share
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/post/PostActions.tsx` | Nút Share | Chỉ điều hướng sang composer share, không gọi API ngay. |
| `frontend/app/post/[id]/share/page.tsx` | Page share | Load bài gốc read-only, cho nhập caption, submit tạo bài share. |
| `frontend/lib/forumApi.ts` | `sharePost()`, `sharePostWithEdit()` | Bản hiện dùng là `sharePostWithEdit` vì có caption. |
| `backend/routers/post.py` | Hàm `share_post()` | Tạo `PostShare` để đếm share và tạo một post mới dạng `Shared: ...`. |
| `backend/models/post.py` | `original_post_id`, `share_caption` | Hai cột này giúp phân biệt bài share với bài gốc. |
| `backend/models/post_share.py` | Bảng log share | Dùng để tính `shares_count`. |

### Điểm cần nhớ

- Share không chỉ tăng counter; backend tạo bài viết mới.
- User thường share xong bài share cũng có thể `pending`.

## 8. Luồng Comment Và Reply

### Luồng comment gốc

```text
PostDetail
  -> CommentSection
  -> createComment(postId, { content })
  -> POST /api/posts/{post_id}/comments/
  -> backend create_comment()
  -> tạo Comment(parent_id=null)
  -> notification "comment" cho chủ bài
  -> frontend loadComments() lại
```

### Luồng reply

```text
CommentItem
  -> Reply form
  -> onReply(parentId, content)
  -> createComment(postId, { content, parent_id })
  -> backend validate parent_comment thuộc cùng post
  -> tạo Comment(parent_id=parentId)
  -> notification "reply" cho chủ comment cha
  -> frontend loadComments() lại
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/post/CommentSection.tsx` | Load/list/create comment gốc | `loadComments` gọi backend rồi map response sang `CommentNode`. |
| `frontend/components/post/CommentItem.tsx` | Hiển thị comment đệ quy, reply, report comment | Component tự render replies bằng cách gọi lại chính nó. |
| `frontend/lib/forumApi.ts` | `getComments()`, `createComment()` | API dùng route nested dưới post. |
| `backend/routers/comment.py` | `create_comment()`, `get_comments()` | Backend build cây comment bằng `build_comment_tree`. |
| `backend/models/comment.py` | Bảng comments | `parent_id` tạo quan hệ reply; `status` dùng để ẩn comment bị report/moderate. |
| `backend/schemas/comment_schema.py` | Schema comment | Response có `replies: list[CommentResponse]`. |
| `backend/services/notification_service.py` | Notification comment/reply | Tạo notification cho chủ bài và chủ comment cha nếu không phải tự comment/reply. |

### Điểm cần nhớ

- Sau khi tạo comment/reply, frontend reload toàn bộ comment tree thay vì tự nối local.
- Like comment hiện tại chủ yếu là UI local trong `CommentItem`, chưa có backend endpoint riêng như post like.

## 9. Luồng Report Bài Viết Và Comment

### Report bài viết

```text
PostActions Report
  -> ReportDialog
  -> reportPost(post.id, payload)
  -> POST /api/posts/{post_id}/report
  -> backend report_post()
  -> check duplicate report
  -> tạo Report
  -> notify_admins("post_report")
  -> notify chủ bài "post_reported"
```

### Report comment

```text
CommentItem Report
  -> ReportDialog
  -> reportComment(postId, commentId, payload)
  -> POST /api/posts/{post_id}/comments/{comment_id}/report
  -> backend report_comment()
  -> check duplicate report
  -> tạo Report
  -> notify_admins("comment_report")
  -> notify chủ comment "comment_reported"
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/report/ReportDialog.tsx` | Modal chọn lý do report | Dialog nhận `onSubmit`; không biết report bài hay comment. |
| `frontend/components/post/PostActions.tsx` | Mở report dialog cho post | Xử lý lỗi 409 để báo user đã report trước đó. |
| `frontend/components/post/CommentItem.tsx` | Mở report dialog cho comment | Gọi `reportComment` và xử lý lỗi duplicate tương tự. |
| `frontend/lib/forumApi.ts` | `reportPost()`, `reportComment()` | Convert payload `reason/details` sang API backend. |
| `backend/routers/post.py` | `report_post()` | Tạo report target post, không cho user report trùng cùng bài. |
| `backend/routers/comment.py` | `report_comment()` | Tạo report target comment, không cho report trùng cùng comment. |
| `backend/routers/admin.py` | `moderate_report()` | Admin xử lý report: reviewed/dismissed/resolved, hide post/comment, ban author. |
| `backend/models/report.py` | Bảng reports | Lưu `reporter_id`, `post_id`, `comment_id`, `reason`, `status`, reviewer. |
| `backend/services/report_service.py` | Chuẩn hóa reason | Đảm bảo reason hợp lệ trước khi lưu. |

### Điểm cần nhớ

- User report xong chưa tự ẩn bài/comment; admin xử lý sau.
- Report tạo notification cho admin và người bị report.
- Khi admin xử lý report, notification `report_update` gửi về người report.

## 10. Luồng Follow

### Luồng chạy

```text
Profile/AuthorCard
  -> FollowButton
  -> followUser(userId) hoặc unfollowUser(userId)
  -> POST /follow/{user_id} hoặc DELETE /follow/{user_id}
  -> backend follow.py
  -> thêm/xóa Follow
  -> nếu follow thì notification "follow" cho target user
  -> frontend cập nhật isFollowing
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/profile/FollowButton.tsx` | Nút follow/unfollow | Chặn double click bằng `loading`; response backend quyết định trạng thái cuối. |
| `frontend/components/post/AuthorCard.tsx` | Card tác giả ở trang chi tiết bài | Thường chứa FollowButton khi người xem không phải tác giả. |
| `frontend/components/profile/ProfileHeader.tsx` | Header profile | Hiển thị follow count và nút follow ở trang profile. |
| `frontend/lib/profileApi.ts` | `followUser()`, `unfollowUser()` | Gọi `/follow/{user_id}`. |
| `backend/routers/follow.py` | `follow_user()`, `unfollow_user()` | Không cho tự follow; follow trùng trả `following=True`. |
| `backend/models/follow.py` | Bảng follows | Lưu quan hệ follower/following. |
| `backend/routers/user.py` | `build_profile_response()` | Tính `followers_count`, `following_count`, `is_following`. |

### Điểm cần nhớ

- Follow tạo notification, unfollow không tạo notification.
- Profile response tính trạng thái follow theo current user đang đăng nhập.

## 11. Luồng Notification

### Luồng tạo notification

```text
Backend event xảy ra
  -> create_notification() hoặc notify_admins()
  -> insert Notification
  -> frontend Topbar mở dropdown
  -> getMyNotifications()
  -> GET /users/me/notifications
  -> click notification
  -> markNotificationRead()
  -> POST /users/me/notifications/{id}/read
  -> nếu đã đọc thì có nút xóa
  -> DELETE /users/me/notifications/{id}
```

### Event đang tạo notification

| Event | Nơi tạo | Type |
| --- | --- | --- |
| Bài được like | `backend/routers/post.py:toggle_like()` | `post_like` |
| Bài được share | `backend/routers/post.py:share_post()` | `post_share` |
| Bài có comment mới | `backend/routers/comment.py:create_comment()` | `comment` |
| Comment có reply mới | `backend/routers/comment.py:create_comment()` | `reply` |
| User follow người khác | `backend/routers/follow.py:follow_user()` | `follow` |
| Bài bị report | `backend/routers/post.py:report_post()` | `post_report`, `post_reported` |
| Comment bị report | `backend/routers/comment.py:report_comment()` | `comment_report`, `comment_reported` |
| Admin xóa/ẩn bài/comment | `backend/routers/post.py`, `backend/routers/admin.py` | `post_moderation`, `comment_moderation` |
| Admin duyệt/từ chối bài | `backend/routers/admin.py` | `post_approved`, `post_rejected` |
| Report được xử lý | `backend/routers/admin.py:moderate_report()` | `report_update` |

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/components/layout/Topbar.tsx` | Dropdown notification | Mở dropdown thì fetch notifications. Click item chỉ mark read, không redirect. Notification đã đọc có nút xóa. |
| `frontend/lib/profileApi.ts` | `getMyNotifications`, `markNotificationRead`, `deleteReadNotification` | Đây là API client cho notification frontend. |
| `backend/routers/user.py` | Endpoint list/read/delete notification | Xóa chỉ cho notification đã đọc để tránh user vô tình mất thông báo mới. |
| `backend/services/notification_service.py` | Helper tạo notification | `create_notification` chỉ add vào session; router chịu trách nhiệm `commit`. |
| `backend/models/notification.py` | Bảng notifications | Có `user_id`, `actor_id`, `type`, `is_read`, optional `post_id/comment_id/report_id`. |
| `backend/schemas/notification_schema.py` | Response schema | Định dạng dữ liệu trả về cho frontend. |

### Điểm cần nhớ

- Notification hiện là pull-based: frontend chỉ fetch khi mở dropdown, chưa realtime websocket.
- Click notification không điều hướng để tránh redirect sai/nhạy cảm.
- Delete notification chỉ dùng để dọn thông báo đã đọc.

## 12. Luồng Deploy

### Frontend Vercel

```text
Push repo
  -> Vercel project root = frontend
  -> npm ci
  -> npm run build
  -> env NEXT_PUBLIC_API_URL trỏ Render backend
  -> deploy static/SSR Next.js
```

### Backend Render

```text
Render Blueprint render.yaml
  -> runtime docker
  -> dockerfilePath backend/Dockerfile
  -> dockerContext backend
  -> install ODBC Driver 18 trong image
  -> start FastAPI
  -> connect Azure SQL / SQL Server qua DATABASE_URL
```

### File liên quan

| File | Chức năng | Note học code |
| --- | --- | --- |
| `frontend/vercel.json` | Config rewrite/build cho Vercel frontend | Đảm bảo route Next.js không bị 404 khi refresh. |
| `frontend/package.json` | Script frontend | `npm run build` là command Vercel dùng. |
| `frontend/next.config.ts` | Config Next.js | Kiểm tra khi lỗi build/image/redirect. |
| `render.yaml` | Blueprint Render backend | Khai báo Docker service, health check `/health`, env required. |
| `backend/Dockerfile` | Image backend | Quan trọng nhất là cài Microsoft ODBC Driver 18 và Python dependencies. |
| `backend/render_start.py` | Start script deploy | Có thể chạy setup/upgrade DB trước khi start app tùy env. |
| `backend/database.py` | Kết nối DB deploy | Validate driver ODBC 18 có trong container. |
| `docker-compose.yml` | Chạy local bằng Docker | Dùng khi muốn local đồng bộ backend/frontend/db. |
| `docs/deploy.md` | Hướng dẫn deploy chi tiết | Đọc khi cần thao tác trên Vercel/Render/Azure. |

### Env cần nhớ

Backend Render:

```env
DATABASE_URL=mssql+pyodbc://USER:PASSWORD@SERVER.database.windows.net:1433/StudentForum?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
PUBLIC_API_URL=https://your-backend.onrender.com
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
RUN_DB_SETUP_ON_START=false
```

Frontend Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Checklist deploy an toàn

- Backend `/health` trả OK trước khi test frontend.
- Azure SQL firewall cho phép Render outbound IP hoặc cấu hình networking phù hợp.
- `DATABASE_URL` dùng `ODBC Driver 18 for SQL Server`, không dùng raw ODBC string.
- `NEXT_PUBLIC_API_URL` chỉ là origin backend, không thêm `/api`.
- `CORS_ALLOWED_ORIGINS` chứa đúng domain Vercel production.
- Sau khi deploy backend mới, kiểm tra Swagger `/docs` và thử login/feed.

## 13. Bảng Tóm Tắt Endpoint Chính

| Chức năng | Frontend function | Endpoint backend | Backend function |
| --- | --- | --- | --- |
| Tạo bài | `createPost` | `POST /api/posts/` | `post.py:create_post` |
| Xem bài | `getPost` | `GET /api/posts/{post_id}` | `post.py:get_post_detail` |
| Sửa bài | `updatePost` | `PUT /api/posts/{post_id}` | `post.py:update_post` |
| Xóa bài | `deletePost` | `DELETE /api/posts/{post_id}` | `post.py:delete_post` |
| Like bài | `togglePostLike` | `POST /api/posts/{post_id}/like` | `post.py:toggle_like` |
| Bookmark | `toggleBookmark` | `POST /api/posts/{post_id}/bookmark` | `post.py:toggle_bookmark` |
| Share | `sharePostWithEdit` | `POST /api/posts/{post_id}/share` | `post.py:share_post` |
| List comment | `getComments` | `GET /api/posts/{post_id}/comments/` | `comment.py:get_comments` |
| Comment/reply | `createComment` | `POST /api/posts/{post_id}/comments/` | `comment.py:create_comment` |
| Report bài | `reportPost` | `POST /api/posts/{post_id}/report` | `post.py:report_post` |
| Report comment | `reportComment` | `POST /api/posts/{post_id}/comments/{comment_id}/report` | `comment.py:report_comment` |
| Follow | `followUser` | `POST /follow/{user_id}` | `follow.py:follow_user` |
| Unfollow | `unfollowUser` | `DELETE /follow/{user_id}` | `follow.py:unfollow_user` |
| List notification | `getMyNotifications` | `GET /users/me/notifications` | `user.py:get_my_notifications` |
| Mark read | `markNotificationRead` | `POST /users/me/notifications/{id}/read` | `user.py:mark_notification_read` |
| Xóa notification đã đọc | `deleteReadNotification` | `DELETE /users/me/notifications/{id}` | `user.py:delete_read_notification` |

## 14. Thứ Tự Học Code Đề Xuất

1. Đọc `frontend/lib/axios.ts` để hiểu token/API base URL.
2. Đọc `frontend/lib/forumApi.ts` và `frontend/lib/profileApi.ts` để nắm toàn bộ endpoint frontend gọi.
3. Đọc page theo luồng: `create/page.tsx`, `edit/[id]/page.tsx`, `post/[id]/page.tsx`, `post/[id]/share/page.tsx`.
4. Đọc component dùng chung: `PostEditor`, `PostActions`, `CommentSection`, `CommentItem`, `ReportDialog`, `FollowButton`, `Topbar`.
5. Đọc backend router: `post.py`, `comment.py`, `follow.py`, `user.py`, `admin.py`.
6. Đọc service/model/schema tương ứng để hiểu DB và response.
7. Cuối cùng đọc deploy: `render.yaml`, `backend/Dockerfile`, `frontend/vercel.json`, `docs/deploy.md`.

