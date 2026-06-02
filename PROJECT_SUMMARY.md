# UITConnect - Student Forum System
## Complete Project Summary

**Version:** 1.0.0  
**Last Updated:** June 2, 2026  
**Tech Stack:** Next.js 15, FastAPI, SQLAlchemy 2.0, SQL Server, TypeScript, React 19, Tailwind CSS

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend API Documentation](#backend-api-documentation)
4. [Database Models](#database-models)
5. [Frontend Pages & Components](#frontend-pages--components)
6. [Services & Utilities](#services--utilities)
7. [Authentication & Security](#authentication--security)
8. [Key Features](#key-features)
9. [Project Structure](#project-structure)

---

## 🎯 Project Overview

**UITConnect** is a full-stack student forum application designed specifically for University of Information Technology (UIT) students. The platform enables students to:
- Create and share posts about projects, internships, job opportunities
- Collaborate through comments and discussions
- Connect with peers by following other users
- Discover trending content and personalized recommendations
- Report inappropriate content for moderation

**Target Users:**
- UIT Students
- UIT Administrators
- Content Moderators

---

## 🏗️ System Architecture

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Next.js 15 (React 19) |
| **Frontend Language** | TypeScript |
| **Frontend Styling** | Tailwind CSS 3.4 |
| **Frontend Build Tools** | PostCSS, Autoprefixer |
| **Backend Framework** | FastAPI |
| **Backend Language** | Python 3.10+ |
| **ORM** | SQLAlchemy 2.0 |
| **Database** | Microsoft SQL Server (via pyodbc) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | Passlib (bcrypt) |
| **Email Service** | SMTP with email verification tokens |
| **OAuth** | Google OAuth 2.0 |
| **API Documentation** | Swagger/OpenAPI (FastAPI built-in) |

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Landing Page | Auth Pages | Feed | Post | Profile  │   │
│  │  ├─ React Components (TSX)                           │   │
│  │  ├─ Tailwind CSS Styling                             │   │
│  │  ├─ TypeScript Type Safety                           │   │
│  │  └─ Axios HTTP Client                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routers (8 modules)                             │   │
│  │  ├─ auth.py (Authentication & OAuth)                 │   │
│  │  ├─ post.py (Posts, Likes, Shares, Views)            │   │
│  │  ├─ comment.py (Nested Comments & Reporting)         │   │
│  │  ├─ user.py (Profiles, Bookmarks, Notifications)     │   │
│  │  ├─ follow.py (Social Graph)                         │   │
│  │  ├─ admin.py (Moderation & Analytics)                │   │
│  │  ├─ tag.py (Tag Management)                          │   │
│  │  └─ upload.py (File Upload Service)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Business Logic (Services)                           │   │
│  │  ├─ auth_service.py (User Auth Flow)                 │   │
│  │  ├─ post_service.py (Post Operations & Queries)      │   │
│  │  ├─ notification_service.py (Event Notifications)    │   │
│  │  ├─ trending_service.py (Trending Algorithms)        │   │
│  │  ├─ collaborative_filtering_service.py (Recommendations) │
│  │  ├─ profile_analysis_service.py (User Profiles)      │   │
│  │  ├─ email_service.py (Email Delivery)                │   │
│  │  ├─ google_oauth_service.py (OAuth Integration)      │   │
│  │  └─ report_service.py (Content Moderation)           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data Layer (SQLAlchemy ORM)                         │   │
│  │  ├─ Models (16 tables)                               │   │
│  │  ├─ Schemas (Pydantic Validation)                    │   │
│  │  ├─ Dependencies (JWT Auth)                          │   │
│  │  └─ Utils (Hash, JWT, Helpers)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│           DATABASE (Microsoft SQL Server 2019+)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  16 Tables with Relationships & Constraints          │   │
│  │  ├─ users, posts, comments, tags                     │   │
│  │  ├─ follows, bookmarks, post_likes                   │   │
│  │  ├─ post_shares, post_views, post_tags               │   │
│  │  ├─ notifications, reports                           │   │
│  │  ├─ auth_sessions, email_verification_tokens        │   │
│  │  ├─ password_reset_tokens, admin_audit_logs         │   │
│  │  └─ Indexed for Performance                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Backend API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
All protected endpoints require `Authorization: Bearer {access_token}` header

---

### 🔐 **Auth Router** (`/auth`)

#### **POST** `/auth/register`
Create a new user account
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "email": "user@uit.edu.vn",
    "username": "student123",
    "password": "SecurePass123!",
    "full_name": "Nguyễn Văn A"
  }
  ```
- **Response:** Verification token sent to email
- **Validations:**
  - Email must be unique
  - Username must be unique
  - Password must meet strength requirements
- **Side Effects:** Sends verification email

#### **POST** `/auth/login`
Authenticate user with email/username and password
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "identifier": "student123", // email or username
    "password": "SecurePass123!"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
  ```
- **Validations:**
  - User must exist
  - User email must be verified
  - User status must not be "banned" or "deleted"
  - Password must match

#### **GET** `/auth/google/login`
Redirect to Google OAuth consent screen
- **Query Params:** None
- **Redirects to:** Google OAuth URL
- **Response:** `302 Found` with location header

#### **GET** `/auth/google/callback`
Handle Google OAuth callback and create/update user
- **Query Params:**
  - `code` (string): OAuth authorization code
- **Response:** `302 Found` redirecting to frontend with tokens
- **Side Effects:** Creates user if doesn't exist, sends verification email

#### **POST** `/auth/refresh`
Generate new access token from refresh token
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "refresh_token": "eyJhbGc..."
  }
  ```
- **Response:** New access token (refresh token reused)
- **Validations:**
  - Refresh token must exist in database
  - Token must not be expired
  - User must not be banned

#### **POST** `/auth/logout`
Invalidate refresh token (session cleanup)
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "refresh_token": "eyJhbGc..."
  }
  ```
- **Response:** Success message

#### **POST** `/auth/verify-email`
Mark user email as verified
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "token": "verification_token_string"
  }
  ```
- **Response:** Success message
- **Validations:**
  - Token must exist and not expired
  - User must exist

#### **POST** `/auth/resend-verification`
Send new verification email to user
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "email": "user@uit.edu.vn"
  }
  ```
- **Response:** Success message (no error if email doesn't exist)

#### **POST** `/auth/forgot-password`
Initiate password reset flow
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "email": "user@uit.edu.vn"
  }
  ```
- **Response:** Success message
- **Side Effects:** Sends password reset email with token

#### **POST** `/auth/reset-password`
Complete password reset with token
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "token": "reset_token_string",
    "new_password": "NewSecurePass456!"
  }
  ```
- **Response:** Success message
- **Validations:**
  - Token must exist and not expired

#### **POST** `/auth/complete-profile`
Fill out user profile after registration/OAuth
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "full_name": "Nguyễn Văn A",
    "bio": "CS student interested in AI",
    "avatar_url": "https://...",
    "major": "Computer Science",
    "academic_year": "3",
    "career_goal": "AI Engineer",
    "interest_tags": ["AI", "Machine Learning", "Web Dev"]
  }
  ```
- **Response:** Updated user profile
- **Auth:** Requires access token

#### **GET** `/auth/me`
Get current logged-in user info
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "id": "uuid-string",
    "username": "student123",
    "email": "user@uit.edu.vn",
    "full_name": "Nguyễn Văn A",
    "avatar_url": "https://...",
    "bio": "CS student",
    "role": "Student",
    "status": "active",
    "is_verified": true,
    "profile_completed": true
  }
  ```
- **Auth:** Requires access token

---

### 📝 **Post Router** (`/api/posts`)

#### **POST** `/api/posts/`
Create a new post
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "title": "My First Post About Web Dev",
    "content": "This is the post content with details...",
    "cover_image": "https://example.com/image.jpg",
    "tags": ["web-dev", "javascript", "react"]
  }
  ```
- **Response:** Created post object with ID
- **Validations:**
  - Title: 5-255 characters
  - Content: required, non-empty
  - Tags: validated or marked as "pending approval"
- **Auth:** Requires access token + verified email
- **Notes:** Admin posts auto-approved; student posts go to "pending" status

#### **GET** `/api/posts/feed`
Get personalized feed of posts
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `page` (int): Page number (default: 1)
  - `page_size` (int): Items per page (default: 10, max: 50)
  - `search` (string): Search query in title/content
  - `tag` (string): Filter by tag name
  - `mode` (string): "for-you" | "following" | "trending" (default: "for-you")
  - `sort` (string): "latest" | "trending" | "most-liked" | "most-commented" (default: "latest")
- **Response:**
  ```json
  {
    "items": [
      {
        "id": 1,
        "title": "Post Title",
        "content": "Post content...",
        "author": { "id": "...", "username": "..." },
        "likes_count": 5,
        "comments_count": 2,
        "views_count": 45,
        "is_liked": false,
        "is_bookmarked": true,
        "tags": ["web-dev"],
        "created_at": "2026-06-02T10:30:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "page_size": 10,
      "total": 150,
      "total_pages": 15
    }
  }
  ```
- **Auth:** Optional (more personalized with auth)
- **Performance:** Uses optimized queries for fast path on "latest" mode

#### **GET** `/api/posts/{id}`
Get single post with details
- **Status Code:** `200 OK`
- **Response:** Full post object with author, comments, stats
- **Auth:** Optional

#### **PUT** `/api/posts/{id}`
Update existing post
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content...",
    "cover_image": "https://...",
    "tags": ["updated-tags"],
    "status": "active"
  }
  ```
- **Response:** Updated post object
- **Auth:** Requires ownership (same user_id)
- **Validations:** All create validations apply

#### **DELETE** `/api/posts/{id}`
Delete a post
- **Status Code:** `204 No Content`
- **Response:** Empty response
- **Auth:** Requires ownership or admin role
- **Cascades:** Deletes all comments, likes, bookmarks

#### **POST** `/api/posts/{id}/like`
Like a post
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "message": "Post liked successfully",
    "liked": true
  }
  ```
- **Auth:** Requires access token
- **Notes:** Idempotent (liking twice = no duplicates)

#### **DELETE** `/api/posts/{id}/like`
Unlike a post
- **Status Code:** `200 OK`
- **Response:** Unlike success message
- **Auth:** Requires access token

#### **POST** `/api/posts/{id}/bookmark`
Bookmark a post
- **Status Code:** `201 Created`
- **Response:** Success message
- **Auth:** Requires access token

#### **DELETE** `/api/posts/{id}/bookmark`
Remove bookmark
- **Status Code:** `204 No Content`
- **Auth:** Requires access token

#### **POST** `/api/posts/{id}/share`
Share a post (create a share record)
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "caption": "Check out this great post!"
  }
  ```
- **Response:** Share record with share_id
- **Auth:** Requires access token

#### **POST** `/api/posts/{id}/report`
Report inappropriate post
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "reason": "inappropriate",
    "details": "Specific details about why..."
  }
  ```
- **Response:** Report record
- **Auth:** Requires access token
- **Validations:** Reason must be valid; no duplicate reports per user

#### **POST** `/api/posts/trending`
Get trending posts (algorithmic ranking)
- **Status Code:** `200 OK`
- **Query Parameters:** Same as feed endpoint
- **Response:** Ranked posts by engagement
- **Ranking Formula:** `likes * 4 + comments * 3 + views`

#### **POST** `/api/posts/similar`
Get posts similar to target post
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `post_id` (int): Post to find similarities for
  - `limit` (int): Number of results (default: 5)
- **Response:** Similar posts list
- **Algorithm:** Tag-based similarity matching

#### **POST** `/api/posts/recommendations/collaborative`
Get posts recommended by collaborative filtering
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `limit` (int): Number of recommendations (default: 10)
- **Response:** Recommended posts
- **Auth:** Requires access token
- **Algorithm:** User-user collaborative filtering based on likes/interactions

#### **POST** `/api/posts/recommendations/profile-based`
Get posts recommended by user profile analysis
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `limit` (int): Default 10
- **Response:** Profile-matched recommendations
- **Auth:** Requires access token
- **Algorithm:** Interest tags and engagement patterns matching

---

### 💬 **Comment Router** (`/api/posts/{post_id}/comments`)

#### **POST** `/api/posts/{post_id}/comments/`
Create comment on post
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "content": "Great post! I agree with your points.",
    "parent_id": null  // null for top-level, int for replies
  }
  ```
- **Response:** Comment object with author nested
- **Auth:** Requires access token
- **Notifications:** Sends notification to post author and parent commenter

#### **GET** `/api/posts/{post_id}/comments/`
Get all comments for post (threaded)
- **Status Code:** `200 OK`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "content": "Top-level comment",
      "author": { "id": "...", "username": "..." },
      "created_at": "2026-06-02T...",
      "replies": [
        {
          "id": 2,
          "content": "Reply to comment 1",
          "author": {...},
          "replies": []
        }
      ]
    }
  ]
  ```
- **Structure:** Tree structure with nested replies

#### **DELETE** `/api/posts/{post_id}/comments/{comment_id}`
Delete comment
- **Status Code:** `204 No Content`
- **Auth:** Requires ownership or admin
- **Cascades:** Deletes replies to this comment

#### **POST** `/api/posts/{post_id}/comments/{comment_id}/report`
Report inappropriate comment
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "reason": "spam",
    "details": "This is spam content"
  }
  ```
- **Response:** Report record
- **Auth:** Requires access token

---

### 👥 **User Router** (`/users`)

#### **GET** `/users/me/profile`
Get current user's full profile
- **Status Code:** `200 OK`
- **Response:** Detailed user profile with all stats
- **Auth:** Requires access token

#### **GET** `/users/{username}`
Get public user profile
- **Status Code:** `200 OK`
- **Response:** Public profile (username, bio, followers count, etc.)

#### **GET** `/users/{username}/posts`
Get all posts by user
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `page` (int): Pagination
  - `page_size` (int): Pagination size
- **Response:** Paginated list of user's posts
- **Auth:** Optional

#### **GET** `/users/{username}/comments`
Get all comments by user
- **Status Code:** `200 OK`
- **Query Parameters:** Same pagination as posts
- **Response:** List of user's comments with post references

#### **GET** `/users/me/bookmarks`
Get current user's bookmarked posts
- **Status Code:** `200 OK`
- **Query Parameters:** Pagination parameters
- **Response:** Paginated bookmarks
- **Auth:** Requires access token

#### **PUT** `/users/me/profile`
Update current user's profile
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "full_name": "Updated Name",
    "bio": "New bio here",
    "avatar_url": "https://...",
    "major": "Computer Science",
    "academic_year": "3",
    "career_goal": "Software Engineer",
    "interest_tags": ["AI", "Web Dev"]
  }
  ```
- **Response:** Updated profile
- **Auth:** Requires access token

#### **GET** `/users/{username}/followers`
Get user's followers
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `page` (int): Pagination
  - `limit` (int): Results per page
- **Response:** List of followers

#### **GET** `/users/{username}/following`
Get users that this user follows
- **Status Code:** `200 OK`
- **Query Parameters:** Pagination
- **Response:** List of following

#### **GET** `/users/me/notifications`
Get current user's notifications
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `page` (int): Pagination
  - `unread_only` (bool): Filter unread only
- **Response:** Paginated notifications
- **Auth:** Requires access token

#### **POST** `/users/me/notifications/{notification_id}/mark-as-read`
Mark notification as read
- **Status Code:** `200 OK`
- **Response:** Updated notification
- **Auth:** Requires access token

#### **POST** `/users/me/notifications/mark-all-read`
Mark all notifications as read
- **Status Code:** `200 OK`
- **Auth:** Requires access token

---

### 🔗 **Follow Router** (`/follow`)

#### **POST** `/follow/{user_id}`
Follow a user
- **Status Code:** `201 Created`
- **Response:**
  ```json
  {
    "message": "Followed user successfully.",
    "following": true
  }
  ```
- **Auth:** Requires access token
- **Validations:**
  - Cannot follow self
  - User must exist
  - Idempotent (second follow = already following)

#### **DELETE** `/follow/{user_id}`
Unfollow a user
- **Status Code:** `200 OK`
- **Response:** Unfollow success message with `following: false`
- **Auth:** Requires access token

---

### 🏷️ **Tag Router** (`/tags`)

#### **GET** `/tags`
Get all tags
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `search` (string): Filter by tag name
  - `page` (int): Pagination
- **Response:** List of tags with usage count

#### **GET** `/tags/trending`
Get trending tags
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `limit` (int): Number of tags (default: 10)
- **Response:** Tags ranked by recent usage

---

### 👨‍💼 **Admin Router** (`/api/admin`)

#### **GET** `/api/admin/users`
List all users (paginated)
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `page` (int): Pagination
  - `page_size` (int): Items per page
  - `search` (string): Filter by username/email
- **Response:** User list with stats
- **Auth:** Requires Admin role

#### **POST** `/api/admin/users/{user_id}/ban`
Ban a user (prevent login)
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "reason": "Violation of community guidelines"
  }
  ```
- **Response:** Updated user with status="banned"
- **Auth:** Requires Admin role
- **Side Effects:** Records audit log

#### **POST** `/api/admin/users/{user_id}/unban`
Unban a user
- **Status Code:** `200 OK`
- **Auth:** Requires Admin role

#### **GET** `/api/admin/reports`
Get all reports with filters
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `page` (int): Pagination
  - `status` (string): "pending" | "resolved" | "dismissed"
  - `type` (string): "post" | "comment"
- **Response:** Paginated reports list
- **Auth:** Requires Admin role

#### **POST** `/api/admin/reports/{report_id}/resolve`
Mark report as resolved
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "action": "delete_post",
    "notes": "Post removed for ToS violation"
  }
  ```
- **Response:** Updated report
- **Auth:** Requires Admin role
- **Side Effects:** May delete post/comment; records audit

#### **POST** `/api/admin/reports/{report_id}/dismiss`
Dismiss a report (no action needed)
- **Status Code:** `200 OK`
- **Auth:** Requires Admin role

#### **POST** `/api/admin/tags`
Create new tag (admin only)
- **Status Code:** `201 Created`
- **Request Body:**
  ```json
  {
    "name": "web-development",
    "description": "Web development topics"
  }
  ```
- **Response:** Created tag
- **Auth:** Requires Admin role

#### **GET** `/api/admin/posts/pending`
Get posts pending approval
- **Status Code:** `200 OK`
- **Query Parameters:** Pagination
- **Response:** Pending posts with tag requests
- **Auth:** Requires Admin role

#### **POST** `/api/admin/posts/{post_id}/approve`
Approve pending post
- **Status Code:** `200 OK`
- **Response:** Updated post with status="active"
- **Auth:** Requires Admin role

#### **POST** `/api/admin/posts/{post_id}/reject`
Reject pending post
- **Status Code:** `200 OK`
- **Request Body:**
  ```json
  {
    "reason": "Inappropriate content"
  }
  ```
- **Response:** Updated post with status="rejected"
- **Auth:** Requires Admin role

#### **GET** `/api/admin/analytics`
Get platform analytics
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "users_today": 45,
    "users_week": 280,
    "posts_today": 12,
    "posts_week": 95,
    "comments_today": 58,
    "comments_week": 410,
    "reports_today": 3,
    "reports_week": 18,
    "pending_reports": 5,
    "pending_posts": 2
  }
  ```
- **Auth:** Requires Admin role

#### **GET** `/api/admin/audit-logs`
Get admin action audit trail
- **Status Code:** `200 OK`
- **Query Parameters:**
  - `admin_id` (string): Filter by admin
  - `action_type` (string): Filter by action
  - `date_from` (string): Start date
- **Response:** Audit log entries
- **Auth:** Requires Admin role

---

## 📦 Database Models

### **User** Table
```python
Columns:
  - id (UUID, Primary Key)
  - username (String, Unique, Index)
  - email (String, Unique, Index)
  - password_hash (Text)
  - full_name (Unicode)
  - avatar_url (Text, Optional)
  - bio (Text, Optional)
  - major (String, Optional)
  - academic_year (String, Optional)
  - career_goal (Unicode, Optional)
  - interest_tags (Text, Optional) # Comma-separated
  - role (String, default="Student") # "Student", "Admin"
  - status (String, default="active") # "active", "banned", "deleted"
  - provider (String, default="local") # "local", "google"
  - is_verified (Boolean, default=False)
  - created_at (DateTime, Index)

Relationships:
  - posts (1:N)
  - comments (1:N)
  - bookmarks (1:N)
  - post_likes (1:N)
  - follows (follower: 1:N, following: 1:N)
  - notifications (user: 1:N, actor: 1:N)
  - auth_sessions (1:N)
  - reports (1:N)
```

### **Post** Table
```python
Columns:
  - id (Integer, Primary Key, Auto-increment)
  - user_id (UUID, Foreign Key → users.id)
  - title (Unicode(255), Unique Index)
  - slug (String(255), Unique)
  - content (UnicodeText)
  - cover_image (Text, Optional)
  - status (String, default="pending", Index)
  - original_post_id (Integer, Optional, Self-reference)
  - share_caption (UnicodeText, Optional)
  - requested_new_tags (UnicodeText, Optional) # JSON array
  - created_at (DateTime, Index)

Relationships:
  - author (N:1 to users)
  - comments (1:N)
  - bookmarks (1:N)
  - likes (1:N)
  - tags (M:N through post_tags)
  - views (1:N)
  - shares (1:N)

Indexes:
  - (user_id, created_at)
  - (status)
  - (slug)
```

### **Comment** Table
```python
Columns:
  - id (Integer, Primary Key)
  - post_id (Integer, Foreign Key)
  - user_id (UUID, Foreign Key)
  - parent_id (Integer, Optional, Self-reference)
  - content (UnicodeText)
  - created_at (DateTime, Index)

Relationships:
  - author (N:1 to users)
  - post (N:1 to posts)
  - replies (1:N, self-reference)
  - reports (1:N)

Indexes:
  - (post_id)
  - (user_id)
  - (parent_id)
```

### **Follow** Table
```python
Columns:
  - id (Integer, Primary Key)
  - follower_id (UUID, Foreign Key)
  - following_id (UUID, Foreign Key)
  - created_at (DateTime)

Unique Constraint:
  - (follower_id, following_id)

Relationships:
  - follower (N:1 to users)
  - following (N:1 to users)

Indexes:
  - (follower_id)
  - (following_id)
```

### **Bookmark** Table
```python
Columns:
  - id (Integer, Primary Key)
  - user_id (UUID, Foreign Key)
  - post_id (Integer, Foreign Key)
  - created_at (DateTime)

Unique Constraint:
  - (user_id, post_id)

Indexes:
  - (user_id)
  - (post_id)
```

### **PostLike** Table
```python
Columns:
  - id (Integer, Primary Key)
  - post_id (Integer, Foreign Key)
  - user_id (UUID, Foreign Key)
  - created_at (DateTime)

Unique Constraint:
  - (post_id, user_id)

Indexes:
  - (post_id)
  - (user_id)
```

### **PostShare** Table
```python
Columns:
  - id (Integer, Primary Key)
  - post_id (Integer, Foreign Key)
  - original_post_id (Integer, Foreign Key)
  - user_id (UUID, Foreign Key)
  - caption (UnicodeText, Optional)
  - created_at (DateTime)

Relationships:
  - post (N:1)
  - original_post (N:1 to posts.original_post_id)
  - user (N:1)
```

### **PostView** Table
```python
Columns:
  - id (Integer, Primary Key)
  - post_id (Integer, Foreign Key)
  - user_id (UUID, Foreign Key, Optional)
  - viewed_at (DateTime)

Notes: Tracks both authenticated and anonymous views
```

### **Tag** Table
```python
Columns:
  - id (Integer, Primary Key)
  - name (String(100), Unique)
  - description (Text, Optional)
  - created_at (DateTime)

Relationships:
  - post_tags (1:N)

Indexes:
  - (name)
```

### **PostTag** Table
```python
Columns:
  - id (Integer, Primary Key)
  - post_id (Integer, Foreign Key)
  - tag_id (Integer, Foreign Key)

Unique Constraint:
  - (post_id, tag_id)

Relationships:
  - post (N:1)
  - tag (N:1)
```

### **Notification** Table
```python
Columns:
  - id (Integer, Primary Key)
  - user_id (UUID, Foreign Key)
  - actor_id (UUID, Foreign Key, Optional)
  - notification_type (String) # "like", "comment", "reply", "follow", "share"
  - title (String)
  - message (Text)
  - post_id (Integer, Optional)
  - comment_id (Integer, Optional)
  - is_read (Boolean, default=False)
  - created_at (DateTime, Index)

Relationships:
  - user (N:1)
  - actor (N:1 to users)

Indexes:
  - (user_id, is_read)
  - (created_at)
```

### **Report** Table
```python
Columns:
  - id (Integer, Primary Key)
  - reporter_id (UUID, Foreign Key)
  - post_id (Integer, Foreign Key, Optional)
  - comment_id (Integer, Foreign Key, Optional)
  - reason (String) # "spam", "inappropriate", "misleading", etc.
  - details (Text, Optional)
  - status (String, default="pending")
  - notes (Text, Optional)
  - created_at (DateTime, Index)

Relationships:
  - reporter (N:1)
  - post (N:1)
  - comment (N:1)
```

### **AuthSession** Table
```python
Columns:
  - id (Integer, Primary Key)
  - user_id (UUID, Foreign Key)
  - refresh_token (Text)
  - ip_address (String, Optional)
  - user_agent (Text, Optional)
  - expires_at (DateTime)
  - created_at (DateTime)

Relationships:
  - user (N:1)

Indexes:
  - (user_id)
  - (expires_at)
```

### **EmailVerificationToken** Table
```python
Columns:
  - id (Integer, Primary Key)
  - user_id (UUID, Foreign Key)
  - token (String(255), Unique)
  - expires_at (DateTime)
  - created_at (DateTime)

Relationships:
  - user (N:1)
```

### **PasswordResetToken** Table
```python
Columns:
  - id (Integer, Primary Key)
  - user_id (UUID, Foreign Key)
  - token (String(255), Unique)
  - expires_at (DateTime)
  - created_at (DateTime)

Relationships:
  - user (N:1)
```

### **AdminAuditLog** Table
```python
Columns:
  - id (Integer, Primary Key)
  - admin_user_id (UUID, Foreign Key)
  - action_type (String) # "ban_user", "delete_post", etc.
  - target_type (String) # "user", "post", "comment"
  - target_id (String)
  - notes (Text, Optional)
  - created_at (DateTime, Index)

Relationships:
  - admin_user (N:1 to users)

Indexes:
  - (created_at)
  - (admin_user_id)
```

---

## 🎨 Frontend Pages & Components

### **Pages** (`app/` directory)

#### **Landing Page** (`/`)
- **Components:** UITConnect branding, hero section, auth panel
- **Purpose:** First impression, sign up/login options
- **Styling:** Modern 3-column layout, blue monochromatic theme
- **Auth Status:** Public (no login required)

#### **Login Page** (`/login`)
- **Components:** Email/username + password form
- **Features:** 
  - Email/username identifier support
  - "Forgot password?" link
  - Google OAuth button
  - Sign up redirect
- **Auth Status:** Public

#### **Register Page** (`/register`)
- **Components:** Registration form (email, username, password, name)
- **Features:**
  - Input validation
  - Password strength indicator
  - Terms acceptance
  - Login redirect
- **Auth Status:** Public

#### **Verify Email Page** (`/verify-email`)
- **Purpose:** Email verification flow
- **Features:**
  - Token input or auto-verify from link
  - Resend verification option
- **Auth Status:** Required (unverified user)

#### **Forgot Password Page** (`/forgot-password`)
- **Purpose:** Initiate password reset
- **Features:** Email input, submit for reset link
- **Auth Status:** Public

#### **Reset Password Page** (`/reset-password`)
- **Purpose:** Complete password reset
- **Features:**
  - Token from reset link
  - New password input with strength indicator
- **Auth Status:** Public

#### **OAuth Callback Page** (`/auth/callback`)
- **Purpose:** Handle Google OAuth redirect
- **Features:** Auto-redirect to profile completion or feed
- **Auth Status:** Automatic token setup

#### **Complete Profile Page** (`/complete-profile`)
- **Purpose:** Fill out user profile after OAuth or initial registration
- **Features:**
  - Avatar upload
  - Bio, major, academic year, career goal
  - Interest tags
- **Auth Status:** Required

#### **Feed Page** (`/feed`)
- **Purpose:** Main content discovery page
- **Components:**
  - Post list (infinite scroll or pagination)
  - Filter sidebar (tags, sort options)
  - Search bar
  - Create post button
- **Features:**
  - Multiple feed modes: "For You" (personalized), "Following" (from followed users), "Trending"
  - Sort options: Latest, Trending, Most Liked, Most Commented
  - Search functionality
  - Tag filtering
  - Like/bookmark/share actions
- **Auth Status:** Required

#### **Create Post Page** (`/create`)
- **Purpose:** Write and publish new post
- **Components:**
  - Title input
  - Rich text editor for content
  - Cover image upload
  - Tag selector (autocomplete)
- **Features:**
  - Draft saving (optional)
  - Preview
  - Cancel option
- **Auth Status:** Required + verified email

#### **Edit Post Page** (`/edit/[id]`)
- **Purpose:** Modify existing post
- **Features:** Same as create but with pre-filled data
- **Auth Status:** Required + post ownership

#### **Post Detail Page** (`/post/[id]`)
- **Purpose:** View single post with comments
- **Components:**
  - Post content with author card
  - Comment section (threaded)
  - Related posts sidebar
  - Actions: Like, Bookmark, Share, Report
- **Features:**
  - Nested comment threads
  - Real-time comment count
  - Like/bookmark status
  - Author profile link
- **Auth Status:** Public (read), Required for actions

#### **User Profile Page** (`/profile/[username]`)
- **Purpose:** View user's public profile
- **Components:**
  - Profile header (avatar, name, bio, stats)
  - Tabs: Posts, Comments, Bookmarks
  - Follow button (if not own profile)
  - Followers/Following lists
- **Features:**
  - Post list (user's posts)
  - Edit button (if own profile)
- **Auth Status:** Public

#### **Profile Edit Page** (`/profile/[id]/edit`)
- **Purpose:** Update own profile
- **Components:**
  - All profile fields editable
  - Avatar upload
  - Save/Cancel buttons
- **Auth Status:** Required + ownership

#### **Dashboard/Admin Page** (`/dashboard`)
- **Purpose:** Admin panel (currently wireframe)
- **Planned Features:**
  - User management
  - Report moderation
  - Analytics
  - Tag management
- **Auth Status:** Admin role required
- **Status:** Placeholder UI only

#### **Settings Page** (`/settings`)
- **Purpose:** User preferences and account settings
- **Features:** Placeholder content
- **Auth Status:** Required
- **Status:** Not fully implemented

### **Components** by Category

#### **Auth Components** (`components/auth/`)
- `LoginForm.tsx` - Email/username + password input
- `RegisterForm.tsx` - Multi-field registration form

#### **Feed Components** (`components/feed/`)
- `FeedFilter.tsx` - Tag and sort filter sidebar
- `FeedSort.tsx` - Sort option selector
- `FeedTabs.tsx` - Mode tabs (For You, Following, Trending)

#### **Post Components** (`components/post/`)
- `PostCard.tsx` - Compact post display (feed item)
- `PostDetail.tsx` - Full post view with comments
- `PostEditor.tsx` - Rich text editor for creating/editing
- `PostActions.tsx` - Like, bookmark, share, report buttons
- `CommentItem.tsx` - Single comment display (threaded)
- `CommentSection.tsx` - Comment list and new comment form
- `RelatedPosts.tsx` - Suggested similar posts
- `PostList.tsx` - List container for posts
- `AuthorCard.tsx` - Post author info card

#### **Profile Components** (`components/profile/`)
- `ProfileHeader.tsx` - Avatar, name, bio, stats
- `ProfileTabs.tsx` - Posts/Comments/Bookmarks tabs
- `FollowButton.tsx` - Follow/Unfollow button

#### **Layout Components** (`components/layout/`)
- `Topbar.tsx` - Top navigation bar
- `Sidebar.tsx` - Left navigation sidebar
- `Rightbar.tsx` - Right sidebar (notifications, recommendations)

#### **Landing Components** (`components/landing/`)
- `Hero.tsx` - Hero section with headline
- `Features.tsx` - Feature highlights
- `Footer.tsx` - Landing page footer
- `AuthPanel.tsx` - Login/signup panel

#### **UI Components** (`components/ui/`)
- `Avatar.tsx` - User avatar display
- `Button.tsx` - Reusable button component
- `Input.tsx` - Form input field
- `Modal.tsx` - Modal dialog
- `Tabs.tsx` - Tab navigation
- `Dropdown.tsx` - Dropdown menu
- `Toast.tsx` - Toast notifications
- `Tag.tsx` - Tag badge display
- `Skeleton.tsx` - Loading placeholder

#### **App Components** (`components/app/`)
- Navigation/Menu components

---

## 🛠️ Services & Utilities

### **Services** (`backend/services/`)

#### **auth_service.py**
Handles user authentication workflows
- `create_email_verification_token()` - Generate email verification token
- `send_verification_email()` - Send verification email via SMTP
- `create_password_reset_token()` - Generate password reset token
- `send_password_reset_email()` - Send password reset email
- `is_profile_completed()` - Check if user completed profile
- `create_google_user()` - Create user from Google OAuth data

#### **post_service.py**
Post query building and serialization
- `build_post_query()` - Construct complex post queries with filters
- `paginate_query()` - Paginate any query
- `paginate_latest_posts_fast()` - Optimized pagination for "latest" feed
- `paginate_trending_posts_fast()` - Optimized trending posts
- `serialize_post()` - Convert Post ORM to response DTO
- `sync_post_tags()` - Link tags to post
- `split_known_and_new_tags()` - Separate existing from new tags
- `slugify()` - Generate URL slug from title

#### **notification_service.py**
Create and manage notifications
- `create_notification()` - Create notification record (like, comment, follow, etc.)
- Query and retrieve notifications
- Mark notifications as read

#### **trending_service.py**
Trending algorithm and rankings
- `get_trending_posts()` - Rank posts by engagement
- `get_trending_tags()` - Identify trending tags
- Trending score calculation: `likes * 4 + comments * 3 + views`

#### **collaborative_filtering_service.py**
Recommendation engine based on user interactions
- `get_collaborative_recommendations()` - User-user similarity recommendations
- Similar user detection based on likes/interactions
- Recommended post ranking

#### **profile_analysis_service.py**
User profile-based recommendations
- `get_profile_based_recommendations()` - Recommend posts matching user interests
- `get_user_profile_summary()` - Aggregate user engagement data
- Interest tag matching

#### **email_service.py**
Email delivery system
- `send_email()` - Send email via SMTP
- `send_html_email()` - Send HTML formatted email
- Currently console-prints in development

#### **google_oauth_service.py**
Google OAuth integration
- `build_google_auth_url()` - Generate Google consent screen URL
- `exchange_google_code()` - Exchange authorization code for tokens
- `fetch_google_userinfo()` - Retrieve user info from Google

#### **report_service.py**
Content moderation utilities
- `normalize_report_reason()` - Standardize report reason strings
- Report categorization and validation

### **Utilities** (`backend/utils/`)

#### **hash.py**
Password hashing and verification
- `hash_password()` - Hash password using bcrypt
- `verify_password()` - Verify password against hash

#### **jwt.py**
JWT token generation and validation
- `create_access_token()` - Generate access token (15 min expiry)
- `create_refresh_token()` - Generate refresh token (7 day expiry)
- `decode_token()` - Decode and validate JWT
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Configurable expiration

### **Dependencies** (`backend/dependencies/`)

#### **auth.py**
Authentication dependency injection
- `get_current_user()` - Extract current user from JWT
- `require_active_verified_user()` - Verify user is active and email verified
- `require_role()` - Verify user has required role (admin)
- `get_optional_current_user()` - Get user if authenticated, None otherwise

---

## 🔐 Authentication & Security

### **Authentication Flow**

#### **Local Registration → Email Verification → Login**
```
1. User submits registration form
2. Backend validates email/username uniqueness
3. Password hashed with bcrypt
4. User created with is_verified=False
5. Verification token generated (6-hour expiry)
6. Verification email sent
7. User clicks link → token validated
8. User marked as verified
9. User can now login
10. JWT tokens generated (access: 15min, refresh: 7day)
11. Refresh token stored in DB for session tracking
```

#### **Google OAuth**
```
1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. User authorizes app
4. Google redirects with authorization code
5. Backend exchanges code for tokens
6. Backend fetches user info from Google
7. User found or created
8. New verification token issued if needed
9. JWT tokens generated
10. Redirect to frontend with tokens in query params
```

#### **Token Refresh**
```
1. Access token expired (15 minutes)
2. Frontend uses refresh token to request new access token
3. Backend validates refresh token in DB
4. Check token not expired and user still active
5. Issue new access token
6. Refresh token remains valid for 7 days
```

### **Security Measures**

| Feature | Implementation |
|---------|-----------------|
| **Password Hashing** | Bcrypt with salt (via passlib) |
| **Token Security** | JWT with HS256 algorithm |
| **CORS** | Configurable allowed origins from environment |
| **Session Tracking** | Refresh tokens stored in DB with IP/user-agent |
| **Email Verification** | Time-limited tokens (6 hours) |
| **Password Reset** | Time-limited tokens (1 hour) |
| **Authorization** | Role-based (Student/Admin) |
| **Ownership Verification** | Post/comment ops verify user ownership |
| **Ban/Delete Status** | Checked on login and refresh |
| **Duplicate Prevention** | Unique constraints (follow, bookmark, like, report) |
| **Input Validation** | Pydantic schemas on all inputs |
| **SQL Injection** | SQLAlchemy parameterized queries |

### **JWT Token Structure**

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "Student",
  "type": "access",
  "iat": 1717324200,
  "exp": 1717325100
}
```

### **Permission Hierarchy**

```
Admin
  ├─ Can approve/reject posts
  ├─ Can manage tags
  ├─ Can view all reports
  ├─ Can ban/unban users
  ├─ Can view analytics
  ├─ Can access audit logs
  └─ Can create posts without approval

Student
  ├─ Can create posts (go to pending)
  ├─ Can comment
  ├─ Can like/bookmark/share
  ├─ Can follow users
  ├─ Can report inappropriate content
  ├─ Can edit own posts/comments
  └─ Cannot access admin features
```

---

## ✨ Key Features

### **1. Forum Core**
- ✅ Create, edit, delete posts
- ✅ Posts go through admin approval queue (non-admin)
- ✅ Admin posts auto-approved
- ✅ Add cover images
- ✅ Rich text content support
- ✅ Tag posts for categorization
- ✅ Tag approval workflow (admins can create tags, students can request)

### **2. Engagement**
- ✅ Like posts
- ✅ Bookmark posts for reading later
- ✅ Share posts (creates linked share record)
- ✅ Nested comment threads
- ✅ Reply to comments
- ✅ View counts
- ✅ Share counts

### **3. Social Features**
- ✅ Follow/unfollow users
- ✅ View follower/following lists
- ✅ User profiles with bio, major, career goals
- ✅ User post/comment/bookmark feeds
- ✅ Interest tags on profiles

### **4. Discovery**
- ✅ Search posts by title/content
- ✅ Filter by tags
- ✅ Sort: Latest, Trending, Most Liked, Most Commented
- ✅ Feed modes: For You (personalized), Following (from follows), Trending
- ✅ Related posts on post detail
- ✅ Trending posts algorithm
- ✅ Trending tags

### **5. Recommendations**
- ✅ Collaborative filtering (user-based)
- ✅ Profile-based recommendations (interest matching)
- ✅ Similar posts algorithm (tag-based)

### **6. Authentication & Authorization**
- ✅ Email/password registration
- ✅ Email verification flow
- ✅ Login with email or username
- ✅ Google OAuth 2.0 integration
- ✅ Password reset flow
- ✅ Refresh token sessions
- ✅ Role-based access (Student/Admin)
- ✅ Account status (active/banned/deleted)

### **7. User Management**
- ✅ User profile with avatar, bio, major, academic year, career goal
- ✅ Edit own profile
- ✅ User settings placeholder
- ✅ Dashboard admin panel (wireframe)

### **8. Notifications**
- ✅ Like notifications
- ✅ Comment notifications
- ✅ Reply notifications
- ✅ Follow notifications
- ✅ Share notifications
- ✅ Mark as read
- ✅ Notification list with pagination

### **9. Content Moderation**
- ✅ Report posts
- ✅ Report comments
- ✅ Reason categorization (spam, inappropriate, misleading, etc.)
- ✅ Admin report review
- ✅ Resolve or dismiss reports
- ✅ Ban users
- ✅ Delete posts/comments
- ✅ Audit logging

### **10. Admin Features**
- ✅ User list management
- ✅ Ban/unban users
- ✅ View all reports
- ✅ Report moderation
- ✅ Tag management
- ✅ Post approval queue
- ✅ Platform analytics
- ✅ Audit log viewing

### **11. Data Analytics**
- ✅ Users created (today/week)
- ✅ Posts created (today/week)
- ✅ Comments created (today/week)
- ✅ Reports submitted (today/week)
- ✅ Pending reports count
- ✅ Pending posts count

### **12. UI/UX**
- ✅ Modern responsive landing page
- ✅ UITConnect branding with UIT logo
- ✅ Mobile-friendly design
- ✅ Tailwind CSS styling
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Dropdowns and tabs
- ✅ Infinite scroll / pagination

---

## 📁 Project Structure

```
SE104.ForumApp/
├── backend/
│   ├── main.py                          # FastAPI app entry point
│   ├── database.py                      # SQLAlchemy engine & session
│   ├── init_db.py                       # Database initialization
│   ├── requirements.txt                 # Python dependencies
│   │
│   ├── models/                          # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   ├── follow.py
│   │   ├── bookmark.py
│   │   ├── post_like.py
│   │   ├── post_share.py
│   │   ├── post_view.py
│   │   ├── post_tag.py
│   │   ├── tag.py
│   │   ├── notification.py
│   │   ├── report.py
│   │   ├── auth_session.py
│   │   ├── email_verification_token.py
│   │   ├── password_reset_token.py
│   │   └── admin_audit_log.py
│   │
│   ├── schemas/                         # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth_schema.py
│   │   ├── post_schema.py
│   │   ├── comment_schema.py
│   │   ├── common_schema.py
│   │   ├── notification_schema.py
│   │   ├── report_schema.py
│   │   ├── tag_schema.py
│   │   └── trending_schema.py
│   │
│   ├── routers/                         # FastAPI route handlers
│   │   ├── auth.py                      # Auth endpoints
│   │   ├── post.py                      # Post CRUD & actions
│   │   ├── comment.py                   # Comment CRUD & reporting
│   │   ├── user.py                      # User profiles & bookmarks
│   │   ├── follow.py                    # Follow/unfollow
│   │   ├── admin.py                     # Admin management
│   │   ├── tag.py                       # Tag management
│   │   └── upload.py                    # File upload
│   │
│   ├── services/                        # Business logic
│   │   ├── auth_service.py
│   │   ├── post_service.py
│   │   ├── notification_service.py
│   │   ├── trending_service.py
│   │   ├── collaborative_filtering_service.py
│   │   ├── profile_analysis_service.py
│   │   ├── email_service.py
│   │   ├── google_oauth_service.py
│   │   └── report_service.py
│   │
│   ├── dependencies/                    # Dependency injection
│   │   └── auth.py                      # JWT authentication
│   │
│   ├── utils/                           # Utility functions
│   │   ├── hash.py                      # Password hashing
│   │   └── jwt.py                       # JWT token generation
│   │
│   ├── tests/                           # Test files
│   │   ├── test_report_schema.py
│   │   └── test_report_service.py
│   │
│   ├── seed*.py                         # Database seeding scripts
│   │
│   ├── .env.example                     # Environment variables template
│   ├── Dockerfile                       # Docker containerization
│   ├── API_DOCUMENTATION.md             # API docs
│   ├── BACKEND_SETUP.md                 # Setup guide
│   └── FRONTEND_INTEGRATION.md          # Integration guide
│
├── frontend/
│   ├── app/                             # Next.js app directory
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Landing page
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── auth/callback/
│   │   │   └── page.tsx
│   │   ├── complete-profile/
│   │   │   └── page.tsx
│   │   ├── feed/
│   │   │   └── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   ├── edit/[id]/
│   │   │   └── page.tsx
│   │   ├── post/[id]/
│   │   │   └── page.tsx
│   │   ├── profile/[username]/
│   │   │   └── page.tsx
│   │   ├── profile/[id]/edit/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── components/                      # React components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── feed/
│   │   │   ├── FeedFilter.tsx
│   │   │   ├── FeedSort.tsx
│   │   │   └── FeedTabs.tsx
│   │   ├── post/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   ├── PostActions.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── RelatedPosts.tsx
│   │   │   ├── PostList.tsx
│   │   │   └── AuthorCard.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileTabs.tsx
│   │   │   └── FollowButton.tsx
│   │   ├── layout/
│   │   │   ├── Topbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Rightbar.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AuthPanel.tsx
│   │   │   └── LandingCollage.tsx
│   │   ├── ui/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Providers.tsx
│   │   └── app/
│   │       └── Navigation components
│   │
│   ├── lib/                             # Utilities & hooks
│   │   ├── forumStore.tsx               # State management
│   │   ├── types.ts                     # TypeScript types
│   │   ├── useAuthGuard.ts              # Auth protection hook
│   │   ├── useDebouncedValue.ts         # Debounce hook
│   │   ├── useResponsiveSidebar.ts      # Responsive hook
│   │   └── mockAuth.ts                  # Mock authentication
│   │
│   ├── public/
│   │   └── images/
│   │       └── uit.png                  # UIT logo
│   │
│   ├── package.json                     # Dependencies
│   ├── next.config.ts                   # Next.js configuration
│   ├── tsconfig.json                    # TypeScript config
│   ├── tailwind.config.ts               # Tailwind CSS config
│   ├── postcss.config.mjs               # PostCSS config
│   └── next-env.d.ts                    # Next.js type definitions
│
├── docs/
│   └── report/
│
├── Database/
│   └── StudentForum.sql                 # Database schema export
│
├── README.md                            # Project README
└── PROJECT_SUMMARY.md                   # This file
```

---

## 🚀 Quick Start

### **Backend Setup**

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Initialize database**
   ```bash
   python init_db.py
   ```

4. **Run development server**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access API docs**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### **Frontend Setup**

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL** (in `.env.local`)
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - `http://localhost:3000`

---

## 🔄 Data Flow Example: Create Post

```
Frontend (Create Post Page)
    ↓ User fills form & clicks "Publish"
    ↓
POST /api/posts/
{
  "title": "My Project Experience",
  "content": "This summer I...",
  "tags": ["internship", "summer"]
}
Header: Authorization: Bearer {access_token}
    ↓
Backend (post.py router)
    ↓ require_active_verified_user dependency
    ↓ Validate JWT, get current_user
    ↓ Validate PostCreate schema
    ↓
Post Service (post_service.py)
    ↓ slugify() title
    ↓ split_known_and_new_tags() → known: ["internship"], new: ["summer"]
    ↓ sync_post_tags() → link known tags to post
    ↓
Database (SQL Server)
    ↓ INSERT into posts table
    ↓ INSERT into post_tags (for existing tags)
    ↓ Store requested_new_tags as JSON
    ↓ POST.id = 42, status = "pending" (non-admin)
    ↓
Response
{
  "id": 42,
  "title": "My Project Experience",
  "slug": "my-project-experience",
  "content": "This summer I...",
  "status": "pending",
  "author": { ... },
  "tags": [{ "id": 1, "name": "internship" }],
  "likes_count": 0,
  "comments_count": 0,
  ...
}
    ↓
Frontend
    ↓ Show success toast
    ↓ Redirect to post detail page
    ↓ Display post in "pending approval" state
```

---

## 📊 Database Statistics

| Table | Columns | Relationships | Indexes |
|-------|---------|---------------|---------|
| users | 16 | 12 outgoing | 4 |
| posts | 11 | 8 outgoing | 4 |
| comments | 5 | 3 outgoing | 4 |
| follows | 3 | 2 outgoing | 3 |
| bookmarks | 3 | 2 outgoing | 2 |
| post_likes | 3 | 2 outgoing | 2 |
| post_shares | 4 | 3 outgoing | 2 |
| post_views | 3 | 2 outgoing | 2 |
| post_tags | 2 | 2 outgoing | 2 |
| tags | 3 | 1 outgoing | 1 |
| notifications | 8 | 3 outgoing | 2 |
| reports | 7 | 3 outgoing | 2 |
| auth_sessions | 6 | 1 outgoing | 2 |
| email_verification_tokens | 4 | 1 outgoing | 2 |
| password_reset_tokens | 4 | 1 outgoing | 2 |
| admin_audit_logs | 6 | 1 outgoing | 2 |

**Total:** 16 tables, 98 columns, 40+ relationships

---

## 🧪 Testing

**Current Status:** Test files exist but not comprehensive
- `backend/tests/test_report_schema.py` - Schema validation tests
- `backend/tests/test_report_service.py` - Service logic tests

**Recommended:** Add integration tests for all routers

---

## 📝 Environment Variables

```bash
# Database
DATABASE_URL=mssql+pyodbc://@localhost\SQLEXPRESS/StudentForum?driver=...

# JWT
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# API Keys
API_KEY=...
```

---

## 📚 Additional Documentation

See additional documentation files:
- `API_DOCUMENTATION.md` - Detailed endpoint reference
- `BACKEND_SETUP.md` - Backend installation guide
- `FRONTEND_INTEGRATION.md` - How to connect frontend to backend
- `README.md` - Project overview

---

## 🎓 Learning Resources

This project demonstrates:
- ✅ Full-stack development (frontend + backend)
- ✅ RESTful API design
- ✅ Database modeling and relationships
- ✅ JWT authentication and authorization
- ✅ ORM usage (SQLAlchemy)
- ✅ React and Next.js patterns
- ✅ TypeScript type safety
- ✅ Tailwind CSS responsive design
- ✅ OAuth integration
- ✅ Email service integration
- ✅ Recommendation algorithms
- ✅ Admin moderation systems
- ✅ Analytics tracking

---

## 📄 License

This project is part of SE104 coursework at UIT.

---

**Last Generated:** June 2, 2026
