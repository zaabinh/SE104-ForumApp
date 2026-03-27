# Student Forum System with AI – Frontend

## 1. Giới thiệu
Đây là hệ thống diễn đàn sinh viên (Student Forum System) cho phép sinh viên đăng bài, bình luận và tương tác với nhau.  
Hệ thống tích hợp các tính năng AI như gợi ý nội dung, kiểm duyệt nội dung và cá nhân hóa bảng tin.

Frontend được xây dựng bằng **ReactJS (Next.js) + Tailwind CSS**.

---

## 2. Công nghệ sử dụng
| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | ReactJS (Next.js) |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | MySQL |
| AI | Python NLP |
| Authentication | JWT |

---

## 3. Các chức năng chính

### Authentication
- Đăng ký tài khoản
- Đăng nhập
- Đăng xuất
- Bảo vệ route (chưa đăng nhập không vào được Feed)

### Feed
- Xem danh sách bài viết
- Tìm kiếm bài viết
- Lọc theo tag
- Sắp xếp bài viết
- Infinite scroll

### Post
- Tạo bài viết
- Chỉnh sửa bài viết
- Xóa bài viết
- Like bài viết
- Bookmark bài viết
- Share bài viết
- Bình luận
- Trả lời bình luận

### Profile
- Xem thông tin cá nhân
- Xem bài viết đã đăng
- Xem bài đã bookmark
- Follow user

### AI Features (định hướng)
- Gợi ý nội dung
- Kiểm duyệt nội dung
- Cá nhân hóa feed

---

## 4. Current Progress
- Implemented Landing Page, Login, Register pages
- Built New Feed layout with: Left sidebar, Topbar, Feed, Right sidebar
- Feed features: Search / Filter / Sort posts, Infinite scroll
- Post system: Create / Edit / Delete post
- Implemented Post Detail Page: Post content, Author information, Related posts, Interaction UI (like, comment/reply, share, save)
- Implemented authentication flow: Register → Login → Feed
- Profile page

---

## 5. Hướng dẫn chạy Frontend

### 5.1. Yêu cầu hệ thống
Cài đặt trước:
- Node.js (>= 18)
- npm
- Git

Kiểm tra phiên bản:
```bash
node -v
npm -v
```

---

### 5.2. Cài đặt project
Clone project:
```bash
git clone <repository-url>
cd SE104.ForumApp
```

Cài dependencies:
```bash
npm install
```

---

### 5.3. Chạy project
```bash
npm run dev
```

Mở trình duyệt:
```
http://localhost:3000
```

---

### 5.4. Build production
```bash
npm run build
npm start
```

---

### 5.5. Nếu gặp lỗi
Xóa cache và chạy lại:
```bash
rm -rf .next
npm run dev
```

Nếu port 3000 bị trùng:
```bash
npm run dev -- -p 3001
```

---

## 6. Cấu trúc thư mục chính
```
app/            # Pages (App Router)
components/     # UI Components
lib/            # Mock data, utilities
public/         # Images, icons
styles.css      # Global styles
tailwind.config.ts
```

---

## 7. Các trang chính
| Trang | URL |
|------|-----|
| Landing | / |
| Login | /login |
| Register | /register |
| Feed | /feed |
| Post Detail | /post/[id] |
| Profile | /profile/[id] |

---

## 8. Định hướng phát triển
Trong giai đoạn tiếp theo, hệ thống sẽ:
- Kết nối Backend API (FastAPI)
- Sử dụng JWT Authentication
- Lưu dữ liệu MySQL
- Tích hợp AI:
  - Content recommendation
  - Content moderation
  - Personalized feed

---

## 9. Tác giả
Student Forum System – Software Engineering Project – SE104