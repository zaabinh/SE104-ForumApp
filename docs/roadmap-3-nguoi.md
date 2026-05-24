# Roadmap Triển Khai 3 Task Cho Nhóm 3 Người

## 1) Mục tiêu và phạm vi

Roadmap này tập trung vào 3 hướng:

1. Cá nhân hóa feed và đề xuất bài viết.
2. Deploy hệ thống web (backend + frontend + database) theo hướng production-ready.
3. Hoàn thiện admin features: thống kê, xử lý report, duyệt bài viết, ban/unban user.

Mục tiêu là hoàn thành theo thứ tự ưu tiên để giảm rủi ro:

1. Admin moderation flow hoàn chỉnh.
2. Deploy ổn định và có quy trình release.
3. Recommendation nâng cao dựa trên dữ liệu hành vi + hồ sơ người dùng.

## 2) Đề xuất timeline (6 tuần, 3 sprint)

## Sprint 1 (Tuần 1-2): Admin Core + Moderation Workflow

- Chuẩn hóa report flow: report bài viết/bình luận, trạng thái xử lý, tránh report trùng.
- Xây API + UI dashboard admin thật (không còn mock).
- Thêm duyệt bài viết theo trạng thái (`pending`, `approved`, `rejected`).
- Hoàn thiện ban/unban user với lý do và log cơ bản.

Definition of Done Sprint 1:

- Admin xem được danh sách users/reports/posts chờ duyệt, có filter/pagination.
- Mọi thao tác moderate đều ghi nhận `reviewed_by`, `reviewed_at`, trạng thái.
- Frontend admin gọi API thật, không còn hardcoded số liệu.

## Sprint 2 (Tuần 3-4): Deploy + Vận hành

- Sửa cấu hình Docker/backend startup để chạy đúng app hiện tại.
- Chuẩn hóa biến môi trường cho dev/staging/prod.
- Viết `docker-compose` cho local/staging đầy đủ 3 dịch vụ.
- Thêm healthcheck, logging cơ bản, backup/restore DB guideline.
- Thiết lập CI tối thiểu: lint/build/test smoke.

Definition of Done Sprint 2:

- Có thể deploy 1 lần bằng tài liệu rõ ràng.
- Có URL staging chạy ổn định, đăng nhập/tạo bài/report/admin hoạt động.
- Có checklist release + rollback cơ bản.

## Sprint 3 (Tuần 5-6): Recommendation & Personalization

- Mở rộng hồ sơ người dùng: ngành học, khóa, định hướng, sở thích tags.
- Thu thập tín hiệu hành vi: like/bookmark/view/share/comment theo user.
- Thiết kế scoring đề xuất v1 (rule-based + weighted score).
- Tạo endpoint feed cá nhân hóa có fallback sang `latest/trending`.
- A/B so sánh chất lượng feed v1 so với feed cũ (ở mức log/chỉ số nội bộ).

Definition of Done Sprint 3:

- User cập nhật được profile học tập/sở thích.
- Feed trả kết quả cá nhân hóa ổn định trong thời gian phản hồi chấp nhận được.
- Có metrics cơ bản: CTR, thời gian đọc, tỉ lệ tương tác.

## 3) Chia task cho 3 người

## Người A (Backend Lead: Admin + Recommendation Data)

Phạm vi chính:

- Thiết kế schema/migration cho:
  - `post.status` workflow duyệt bài (`pending`, `active`, `rejected`).
  - profile fields đề xuất: `major`, `academic_year`, `career_goal`.
  - bảng user-preference tags (nếu cần tách bảng trung gian).
- API admin:
  - danh sách reports/users/posts pending.
  - moderate report + approve/reject post + ban/unban có reason.
- API recommendation:
  - xây hàm tính điểm từ hành vi + tag + follow + độ phổ biến.
  - endpoint feed mode `for-you` dùng scoring mới.

Deliverables:

- PR `backend-admin-core`
- PR `backend-recommendation-v1`
- Tài liệu API cập nhật trong `API_ENDPOINTS.md` hoặc file tương đương.

## Người B (Frontend Lead: Admin UI + Profile/Feed UX)

Phạm vi chính:

- Xây trang admin dashboard thật:
  - số liệu tổng hợp.
  - bảng reports/users/posts pending.
  - action buttons (approve/reject/ban/unban/moderate).
- Tích hợp form profile mở rộng (ngành, khóa, định hướng, sở thích).
- Cập nhật UI feed:
  - hiển thị nhãn gợi ý (ví dụ: “vì bạn quan tâm AI”).
  - hỗ trợ sort/mode mượt, trạng thái loading/empty/error đầy đủ.

Deliverables:

- PR `frontend-admin-dashboard`
- PR `frontend-profile-personalization`
- PR `frontend-feed-personalized`

## Người C (DevOps + QA Lead: Deploy, CI/CD, Test)

Phạm vi chính:

- Chỉnh Dockerfile/backend startup và compose chuẩn.
- Viết tài liệu deploy cho local/staging/prod.
- Thiết lập CI pipeline:
  - backend lint + test API smoke.
  - frontend build + lint + type-check.
- Viết test regression cho flow quan trọng:
  - auth/login.
  - post create/feed/report.
  - admin moderate/ban.

Deliverables:

- PR `infra-deploy-hardening`
- PR `ci-cd-pipeline`
- PR `test-regression-core-flows`

## 4) Ma trận phụ thuộc công việc

1. Người A hoàn tất schema/API nền tảng trước để Người B tích hợp UI.
2. Người C chuẩn hóa môi trường sớm để A/B test trên staging ngay từ cuối Sprint 1.
3. Recommendation UI của Người B chỉ merge sau khi API scoring v1 của Người A ổn định.

## 5) Đánh giá hoàn thành theo % (tracking gợi ý)

Chia trọng số tổng:

1. Task 3 (Admin): 40%
2. Task 2 (Deploy): 30%
3. Task 1 (Recommendation): 30%

Chi tiết chấm theo checklist:

- 0%: chưa bắt đầu.
- 25%: có code nháp, chưa có test hoặc chưa end-to-end.
- 50%: backend/frontend chạy cục bộ, còn bug luồng chính.
- 75%: chạy staging ổn định, test pass phần lớn.
- 100%: pass acceptance + tài liệu cập nhật + demo end-to-end.

## 6) Hướng dẫn cách làm cho 3 người (workflow thực tế)

## Quy tắc nhánh và PR

1. Mỗi người dùng 1 nhánh chính theo vai trò:
   - `feature/admin-and-reco-backend` (A)
   - `feature/admin-and-feed-frontend` (B)
   - `feature/deploy-and-qa` (C)
2. Mỗi hạng mục nhỏ tách thành PR nhỏ (không quá lớn).
3. Merge theo thứ tự: schema/API trước, UI sau, deploy cuối cùng.

## Chu kỳ làm việc mỗi tuần

1. Thứ 2: chốt scope tuần + lock acceptance criteria.
2. Thứ 4: sync giữa A-B-C trên staging, xử lý mismatch API/UI.
3. Thứ 6: freeze code, chạy regression test, demo nội bộ.

## Chuẩn bàn giao mỗi PR

1. Mô tả thay đổi + lý do.
2. Cách test local.
3. Ảnh/chứng cứ test (API response, screenshot UI, CI pass).
4. Impact/rủi ro + rollback note ngắn.

## 7) Acceptance criteria gợi ý theo task

## Task 3: Admin

1. Admin xem/tìm/lọc user, report, post chờ duyệt.
2. Có thể moderate report và duyệt/từ chối bài viết.
3. Có thể ban/unban user, user bị ban không đăng nhập được.
4. Dashboard hiện số liệu tổng quan thật từ database.

## Task 2: Deploy

1. Có môi trường staging truy cập được từ team.
2. Build backend/frontend ổn định qua Docker.
3. Có tài liệu `.env` rõ ràng và script khởi động đồng nhất.
4. Có CI kiểm tra tự động trước merge.

## Task 1: Recommendation

1. Thu thập và lưu được dữ liệu hồ sơ + hành vi cần thiết.
2. Feed `for-you` trả kết quả khác nhau theo user.
3. Có fallback nếu thiếu dữ liệu user mới.
4. Có dashboard/chỉ số tối thiểu để theo dõi hiệu quả.

## 8) Rủi ro chính và cách giảm rủi ro

1. Scope recommendation quá lớn:
   - Chỉ làm v1 rule-based trước, chưa làm ML.
2. Admin workflow đổi nhiều:
   - Chốt enum trạng thái và quyền ngay đầu Sprint 1.
3. Deploy chậm do hạ tầng:
   - Dựng staging sớm từ Sprint 1 với cấu hình tối giản.
4. Thiếu test hồi quy:
   - Người C ưu tiên test cho luồng auth/post/admin trước.

## 9) Kết quả kỳ vọng cuối roadmap

1. Hệ thống có moderation flow hoàn chỉnh cho vận hành thực tế.
2. Có môi trường deploy ổn định, dễ bàn giao/dễ demo.
3. Có phiên bản recommendation v1 đủ dùng, đo lường được hiệu quả để tiếp tục cải tiến.

