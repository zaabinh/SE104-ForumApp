"""
# Student Forum Backend API Documentation

## Overview
Production-ready backend for a Student Forum System built with FastAPI, SQLAlchemy, and JWT authentication.

## Features

### ✅ Core Features Implemented
1. **Post Management**
   - Create, read, update, delete posts
   - Pagination support
   - View counter
   - Author verification (only owner can edit/delete)

2. **Comment System**
   - Create comments on posts
   - Update and delete own comments
   - Pagination by post
   - Author verification

3. **Follow System**
   - Follow/unfollow users
   - Prevent duplicate follows
   - View followers and following lists
   - Personalized feed from followed users

4. **Security Features**
   - JWT authentication (OAuth2PasswordBearer)
   - Password hashing with bcrypt
   - Owner-only access control
   - Never trusts user_id from client (always uses current_user.id)

## Technology Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT with python-jose
- **Validation**: Pydantic v2
- **Server**: Uvicorn

## Project Structure

```
backend/
├── app/
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── post.py              # Post model
│   │   ├── comment.py           # Comment model
│   │   ├── follow.py            # Follow model
│   │   ├── bookmark.py          # Bookmark model
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── post.py              # Post Pydantic schemas
│   │   ├── comment.py           # Comment Pydantic schemas
│   │   ├── follow.py            # Follow Pydantic schemas
│   │   └── __init__.py
│   ├── routers/
│   │   ├── posts.py             # Post endpoints
│   │   ├── comments.py          # Comment endpoints
│   │   ├── follow.py            # Follow endpoints
│   │   ├── feed.py              # Personalized feed
│   │   └── __init__.py
│   ├── dependencies/
│   │   ├── auth.py              # Authentication dependency
│   │   └── __init__.py
│   ├── database.py              # Database configuration
│   └── main.py                  # FastAPI app setup
├── main.py                      # Entry point
├── requirements.txt             # Dependencies
└── .env                         # Environment variables (create this)

```

## Installation & Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # Linux/Mac
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create .env File
```env
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./forum.db
```

### 4. Run Server
```bash
fastapi dev main.py
# or
python main.py
```

Server runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

## API Endpoints

### Posts

#### Create Post (Protected)
```
POST /api/posts
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "How to learn FastAPI",
  "content": "FastAPI is a modern web framework..."
}

Response: 201 Created
{
  "id": "uuid",
  "title": "How to learn FastAPI",
  "content": "...",
  "author": { "id": "uuid", "username": "john", ... },
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00",
  "views_count": 0
}
```

#### Get All Posts (Public)
```
GET /api/posts?skip=0&limit=10

Response: 200 OK
{
  "items": [...],
  "total": 25,
  "skip": 0,
  "limit": 10
}
```

#### Get Single Post (Public)
```
GET /api/posts/{post_id}

Response: 200 OK
{
  "id": "uuid",
  "title": "...",
  ...
  "views_count": 1  # Incremented on view
}
```

#### Update Post (Protected - Owner Only)
```
PUT /api/posts/{post_id}
Authorization: Bearer {token}

{
  "title": "Updated title",
  "content": "Updated content"
}

Response: 200 OK
```

#### Delete Post (Protected - Owner Only)
```
DELETE /api/posts/{post_id}
Authorization: Bearer {token}

Response: 204 No Content
```

### Comments

#### Create Comment (Protected)
```
POST /api/comments
Authorization: Bearer {token}

{
  "content": "Great post!",
  "post_id": "uuid"
}

Response: 201 Created
```

#### Get Comments by Post (Public)
```
GET /api/comments/post/{post_id}?skip=0&limit=10

Response: 200 OK
{
  "items": [...],
  "total": 5,
  "skip": 0,
  "limit": 10
}
```

#### Update Comment (Protected - Owner Only)
```
PUT /api/comments/{comment_id}
Authorization: Bearer {token}

{
  "content": "Updated comment"
}

Response: 200 OK
```

#### Delete Comment (Protected - Owner Only)
```
DELETE /api/comments/{comment_id}
Authorization: Bearer {token}

Response: 204 No Content
```

### Follow

#### Follow User (Protected)
```
POST /api/follow/{user_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Successfully followed user",
  "is_following": true
}
```

#### Unfollow User (Protected)
```
DELETE /api/follow/{user_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Successfully unfollowed user"
}
```

#### Get Followers (Public)
```
GET /api/follow/user/{user_id}/followers?skip=0&limit=10

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "username": "alice",
      "email": "alice@example.com",
      "full_name": "Alice"
    }
  ],
  "count": 15
}
```

#### Get Following (Public)
```
GET /api/follow/user/{user_id}/following?skip=0&limit=10

Response: 200 OK
{
  "items": [...],
  "count": 25
}
```

### Feed

#### Get Personalized Feed (Protected)
Returns posts from users you follow
```
GET /api/feed?skip=0&limit=10
Authorization: Bearer {token}

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "title": "...",
      "author": { "id": "uuid", "username": "followed_user", ... },
      ...
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 10
}
```

## Security Features

### Authentication
- JWT tokens issued on login
- OAuth2PasswordBearer scheme
- Token stored in Authorization header: `Bearer {token}`

### Authorization
- `get_current_user()` dependency validates JWT
- Ownership checks before update/delete
- Never accepts `author_id` from request body

### Response Codes
- **200 OK**: Successful GET, PUT
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions (not owner)
- **404 Not Found**: Resource not found

## Database Models

### User
```
- id: UUID (Primary Key)
- username: String (Unique)
- email: String (Unique)
- full_name: String (Optional)
- hashed_password: String
- created_at: DateTime
- updated_at: DateTime
```

### Post
```
- id: UUID (Primary Key)
- title: String
- content: Text
- author_id: UUID (FK -> User)
- created_at: DateTime
- updated_at: DateTime
- views_count: Integer
```

### Comment
```
- id: UUID (Primary Key)
- content: Text
- author_id: UUID (FK -> User)
- post_id: UUID (FK -> Post)
- created_at: DateTime
- updated_at: DateTime
```

### Follow
```
- id: UUID (Primary Key)
- follower_id: UUID (FK -> User)
- following_id: UUID (FK -> User)
- created_at: DateTime
- UNIQUE(follower_id, following_id)
```

### Bookmark
```
- id: UUID (Primary Key)
- user_id: UUID (FK -> User)
- post_id: UUID (FK -> Post)
- created_at: DateTime
- UNIQUE(user_id, post_id)
```

## Error Handling

All errors follow standard HTTP conventions:

```json
{
  "detail": "Post not found"
}
```

Common errors:
- `401 Unauthorized`: Invalid/expired token
- `403 Forbidden`: Not the owner of resource
- `404 Not Found`: Resource doesn't exist
- `400 Bad Request`: Invalid input data

## Best Practices Implemented

✅ **Security**
- Never trust user input for author_id
- Always use `current_user.id` from JWT token
- Ownership verification before modifications
- Password hashing with bcrypt

✅ **Database**
- Proper foreign key relationships
- Cascading deletes
- Unique constraints (Follow, Bookmark)
- Indexed fields for performance

✅ **API Design**
- RESTful endpoints
- Proper HTTP methods and status codes
- Pagination support
- Consistent response schemas

✅ **Code Quality**
- Modular structure (routers, models, schemas)
- Type hints everywhere
- Docstrings for all functions
- Clean separation of concerns

## Frontend Integration

### Example: Create Post
```javascript
const response = await fetch('http://localhost:8000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Post',
    content: 'Post content...'
  })
});
const post = await response.json();
```

### Example: Get Feed
```javascript
const response = await fetch('http://localhost:8000/api/feed?skip=0&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const feed = await response.json();
```

## Testing

Use FastAPI's interactive docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

You can test all endpoints directly from the browser!

## Deployment

### Environment Variables for Production
```env
SECRET_KEY=generate-a-long-random-string
DATABASE_URL=postgresql://user:password@host:5432/forum
```

### Run with Gunicorn
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Performance Considerations

- Indexes on frequently queried fields (author_id, post_id, created_at)
- Pagination to limit response size
- Connection pooling enabled
- N+1 query prevention with proper relationships

## Future Enhancements

- [ ] User authentication (register/login routes)
- [ ] Email notifications
- [ ] Post/comment reactions (likes)
- [ ] Search functionality
- [ ] Hashtags and categories
- [ ] Reporting system
- [ ] Admin dashboard

---

Built with ❤️ for the Student Forum System
"""
