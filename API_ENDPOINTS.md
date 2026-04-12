# Forum App API Endpoints Documentation

## Backend Base URL
`http://localhost:8000`

## Authentication (/auth)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Current user info
- `POST /auth/logout` - Logout

## Posts (/api/posts)
- `POST /api/posts/` - Create post {title, content, cover_image}
- `GET /api/posts/feed` - Get feed posts (paginated skip/limit)
- `PUT /api/posts/{id}` - Update post
- `POST /api/posts/{id}/bookmark` - Toggle bookmark
- `GET /api/posts/{id}/share` - Get share URL

## Users (/users - from profileApi)
- `GET /users/me` - Current user profile
- `GET /users/{username}` - User profile
- `GET /users/{username}/posts` - User posts
- `GET /users/{username}/comments` - User comments
- `GET /users/{username}/bookmarks` - User bookmarks
- `PUT /users/me` - Update profile

## Comments (/comments)
- (to be confirmed)

## Follow (/follow)
- `POST /follow/{userId}` - Follow user
- `DELETE /follow/{userId}` - Unfollow

**Notes:**
- All protected endpoints require `Authorization: Bearer <access_token>` (auto by axios).
- No `GET /api/posts/{id}` - use /feed + client find.
- Token in localStorage 'access_token'.
- Image: backend cover_image, frontend map to image.

