# Student Forum System with AI – Frontend

## 1. Description
The Student Forum System is a web-based platform that allows students to create posts, comment, and interact with each other.  
The system also integrates AI features such as content suggestion, content moderation, and personalized feed.

This repository contains the **Frontend** of the system, built with **Next.js (ReactJS) and Tailwind CSS**.

---

## 2. Tech Stack
| Technology | Description |
|------------|-------------|
| ReactJS (Next.js) | Frontend framework |
| Tailwind CSS | Styling |
| FastAPI | Backend (separate service) |
| MySQL | Database |
| Python NLP | AI features |
| JWT | Authentication |

---

## 3. Features

### Authentication
- User registration
- User login
- Logout
- Protected routes (unauthenticated users cannot access Feed)

### Feed
- View posts
- Search posts
- Filter by tags
- Sort posts
- Infinite scroll

### Post System
- Create post
- Edit post
- Delete post
- Like post
- Bookmark post
- Share post
- Comment on post
- Reply to comment

### Profile
- View user profile
- View user's posts
- View bookmarked posts
- Follow users

### AI Features (Planned)
- Content recommendation
- Content moderation
- Personalized feed

---

## 4. Current Progress
- Implemented Landing Page, Login, and Register pages
- Built New Feed layout:
  - Left Sidebar
  - Topbar
  - Feed (Post cards)
  - Right Sidebar
- Feed features:
  - Search / Filter / Sort posts
  - Infinite scroll
- Post system:
  - Create / Edit / Delete post
- Post Detail Page:
  - Post content
  - Author information
  - Related posts
  - Interaction UI (like, comment/reply, share, save)
- Authentication flow:
  - Register → Login → Feed
- Profile page implemented

---

## 5. Frontend Setup Guide

### 5.1 Requirements
Make sure you have installed:
- Node.js (>= 18)
- npm
- Git

Check versions:
```bash
node -v
npm -v
```

---

### 5.2 Installation
Clone the repository:
```bash
git clone <repository-url>
cd SE104.ForumApp
```

Install dependencies:
```bash
npm install
```

---

### 5.3 Run the project
```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

---

### 5.4 Build for production
```bash
npm run build
npm start
```

---

### 5.5 Troubleshooting
If you encounter errors, try:
```bash
rm -rf .next
npm run dev
```

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

---

## 6. Project Structure
```
app/            # Pages (App Router)
components/     # UI Components
lib/            # Mock data, utilities
public/         # Images, icons
styles/         # Global styles
tailwind.config.ts
```

---

## 7. Main Pages
| Page | URL |
|------|-----|
| Landing | / |
| Login | /login |
| Register | /register |
| Feed | /feed |
| Post Detail | /post/[id] |
| Profile | /profile/[id] |

---

## 8. Future Development
In the next phase, the system will:
- Connect to Backend API (FastAPI)
- Implement JWT Authentication
- Store data in MySQL
- Integrate AI features:
  - Content recommendation
  - Content moderation
  - Personalized feed

---

## 9. Author
Student Forum System – Software Engineering Project – SE104