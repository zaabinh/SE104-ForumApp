# Backend Setup & Deployment Guide

## Quick Start

### 1. Prerequisites
- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

### 2. Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env with your settings
# SECRET_KEY should be a long random string
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Initialize Database

```bash
# Tables are automatically created on startup
# Just run the server!
```

### 5. Run Development Server

```bash
# Using FastAPI's dev server (recommended)
fastapi dev main.py

# Or using uvicorn directly
uvicorn main:app --reload

# Or using Python directly
python main.py
```

Server will be available at: **http://localhost:8000**

### 6. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Project Structure Explanation

```
backend/
├── app/                          # Main application package
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── user.py              # User model with relationships
│   │   ├── post.py              # Post model
│   │   ├── comment.py           # Comment model
│   │   ├── follow.py            # Follow/social graph model
│   │   ├── bookmark.py          # Bookmark model
│   │   └── __init__.py          # Export all models
│   │
│   ├── schemas/                  # Pydantic validation schemas
│   │   ├── user.py              # User request/response schemas
│   │   ├── post.py              # Post schemas
│   │   ├── comment.py           # Comment schemas
│   │   ├── follow.py            # Follow schemas
│   │   └── __init__.py
│   │
│   ├── routers/                  # API route handlers
│   │   ├── posts.py             # POST CRUD endpoints
│   │   ├── comments.py          # Comment endpoints
│   │   ├── follow.py            # Follow/unfollow endpoints
│   │   ├── feed.py              # Personalized feed endpoint
│   │   └── __init__.py
│   │
│   ├── dependencies/             # Reusable dependencies
│   │   ├── auth.py              # JWT authentication
│   │   └── __init__.py
│   │
│   ├── database.py              # Database connection & session
│   ├── main.py                  # FastAPI app initialization
│   └── __init__.py
│
├── main.py                       # Entry point
├── requirements.txt              # Python dependencies
├── .env.example                 # Example environment variables
└── API_DOCUMENTATION.md         # Full API reference
```

## Key Components

### Database (app/database.py)
- SQLAlchemy engine and session factory
- Dependency injection via `get_db()`
- Supports SQLite (dev) and PostgreSQL (prod)

### Models (app/models/)
- **User**: Stores user credentials and profile
- **Post**: Blog posts/discussions
- **Comment**: Replies to posts
- **Follow**: Social graph relationships
- **Bookmark**: User's saved posts

All models have:
- UUID primary keys
- Timestamps (created_at, updated_at)
- Foreign key relationships with cascade deletes

### Schemas (app/schemas/)
- Pydantic v2 models for request/response validation
- Automatic OpenAPI documentation
- Type safety and data validation

### Authentication (app/dependencies/auth.py)
- JWT token generation and validation
- OAuth2PasswordBearer scheme
- `get_current_user()` dependency for protected endpoints

### Routers (app/routers/)
- **posts.py**: Create, read, update, delete posts
- **comments.py**: Comment management
- **follow.py**: Follow/unfollow users and lists
- **feed.py**: Personalized feed from followed users

## Security Implementation

### ✅ Never Trust Client Input
```python
# WRONG - NEVER DO THIS:
@router.post("/posts")
def create_post(post: PostCreate, current_user: User, db: Session):
    post.author_id = request.body.author_id  # ❌ SECURITY ISSUE!
    
# RIGHT - ALWAYS DO THIS:
@router.post("/posts")
def create_post(post: PostCreate, current_user: User, db: Session):
    db_post = Post(
        author_id=current_user.id  # ✅ ALWAYS USE current_user
    )
```

### ✅ Verify Ownership
```python
if post.author_id != current_user.id:
    raise HTTPException(status_code=403, detail="Forbidden")
```

### ✅ Use get_current_user() Dependency
```python
# This dependency validates JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Extract and validate user from JWT
    return user
```

## API Testing

### Using Swagger UI (Interactive)
1. Go to http://localhost:8000/docs
2. Authorize with "Authorize" button
3. Click "Try it out" on any endpoint

### Using cURL

#### Create Post
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{"title": "My Post", "content": "Content here"}'
```

#### Get Posts
```bash
curl http://localhost:8000/api/posts?skip=0&limit=10
```

#### Follow User
```bash
curl -X POST http://localhost:8000/api/follow/{user_id} \
  -H "Authorization: Bearer {your_token}"
```

### Using Python Requests
```python
import requests

token = "your_jwt_token_here"
headers = {"Authorization": f"Bearer {token}"}

# Create post
response = requests.post(
    "http://localhost:8000/api/posts",
    json={"title": "My Post", "content": "..."},
    headers=headers
)
print(response.json())

# Get posts
response = requests.get("http://localhost:8000/api/posts")
print(response.json())
```

## Production Deployment

### 1. Set Production Environment
```bash
# .env file
SECRET_KEY=very-long-random-string-from-secrets.token_urlsafe()
DATABASE_URL=postgresql://user:password@host:5432/forum
DEBUG=False
```

### 2. Using Gunicorn + Uvicorn
```bash
pip install gunicorn

gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### 3. Using Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t forum-api .
docker run -p 8000:8000 forum-api
```

### 4. Database Migration (PostgreSQL)
```bash
# Create database
createdb forum_db

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/forum_db

# Tables are automatically created on startup
python main.py
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'app'"
**Solution**: Make sure you're running from the backend directory and have activated your virtual environment.

### Issue: "Database is locked" (SQLite)
**Solution**: Only one process should access SQLite at a time. Use PostgreSQL for production.

### Issue: 401 Unauthorized errors
**Solution**: 
1. Make sure you have a valid JWT token
2. Send it in Authorization header: `Authorization: Bearer {token}`
3. Check token expiration in .env

### Issue: CORS errors in frontend
**Solution**: Check allowed origins in main.py CORS configuration

### Issue: Database migrations
**Solution**: Tables are created automatically via SQLAlchemy. To reset:
```python
# In Python shell
from app.database import Base, engine
Base.metadata.drop_all(bind=engine)  # Drop all tables
Base.metadata.create_all(bind=engine)  # Create fresh tables
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SECRET_KEY | none | JWT signing key (MUST set in production) |
| DATABASE_URL | sqlite:///./forum.db | Database connection string |
| HOST | 0.0.0.0 | Server host |
| PORT | 8000 | Server port |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | JWT token lifetime |

## Performance Tips

1. **Database Indexes**: Fields like `author_id`, `post_id`, `created_at` are indexed
2. **Pagination**: Always use limit/offset for large datasets
3. **Eager Loading**: Relationships are optimized to prevent N+1 queries
4. **Connection Pooling**: SQLAlchemy manages connection pool automatically

## Next Steps

1. ✅ Backend is ready for production use
2. 🔗 Connect to your frontend
3. 🔐 Implement user registration/login (use existing auth routes if available)
4. 📧 Add email notifications
5. 🔍 Add search functionality
6. ⭐ Add like/reaction system

---

For detailed API documentation, see `API_DOCUMENTATION.md`
