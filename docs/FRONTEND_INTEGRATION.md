"""
# Frontend-Backend Integration Guide

## Overview
This guide shows how to integrate the Student Forum backend with your React/Next.js frontend.

## Base URL
```
http://localhost:8000/api  # Development
```

## Authentication Flow

### 1. Login (Get Token)
Assumes you have an existing login endpoint. Example:

```javascript
// Login and get JWT token
const response = await fetch('http://localhost:8000/auth/login', {  // Note: You may need to implement this
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token } = await response.json();

// Store token (localStorage)
localStorage.setItem('token', access_token);
```

### 2. Use Token in Requests
```javascript
const token = localStorage.getItem('token');

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
```

## Post Examples

### Create Post
```javascript
async function createPost(title, content) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
}

// Usage
const post = await createPost('My First Post', 'This is content...');
console.log(post.id); // UUID
```

### Get All Posts
```javascript
async function getPosts(skip = 0, limit = 10) {
  const response = await fetch(
    `http://localhost:8000/api/posts?skip=${skip}&limit=${limit}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
}

// Usage
const { items, total } = await getPosts(0, 10);
console.log(`Total posts: ${total}`);
items.forEach(post => console.log(post.title));
```

### Get Single Post
```javascript
async function getPost(postId) {
  const response = await fetch(`http://localhost:8000/api/posts/${postId}`);
  
  if (!response.ok) throw new Error('Post not found');
  return response.json();
}

// Usage
const post = await getPost('some-uuid');
```

### Update Post (Owner Only)
```javascript
async function updatePost(postId, title, content) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  
  if (!response.ok) {
    if (response.status === 403) throw new Error('You can only edit your own posts');
    throw new Error('Failed to update post');
  }
  return response.json();
}
```

### Delete Post (Owner Only)
```javascript
async function deletePost(postId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to delete post');
}
```

## Comment Examples

### Create Comment
```javascript
async function createComment(postId, content) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8000/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ post_id: postId, content })
  });
  
  if (!response.ok) throw new Error('Failed to create comment');
  return response.json();
}
```

### Get Comments for Post
```javascript
async function getComments(postId, skip = 0, limit = 10) {
  const response = await fetch(
    `http://localhost:8000/api/comments/post/${postId}?skip=${skip}&limit=${limit}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

// Usage
const { items: comments, total } = await getComments('post-uuid');
```

### Delete Comment (Owner Only)
```javascript
async function deleteComment(commentId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to delete comment');
}
```

## Follow Examples

### Follow User
```javascript
async function followUser(userId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8000/api/follow/${userId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to follow user');
  return response.json();
}

// Usage
const result = await followUser('user-uuid');
console.log(result.message); // "Successfully followed user"
```

### Unfollow User
```javascript
async function unfollowUser(userId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8000/api/follow/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to unfollow user');
  return response.json();
}
```

### Get Followers
```javascript
async function getFollowers(userId, skip = 0, limit = 10) {
  const response = await fetch(
    `http://localhost:8000/api/follow/user/${userId}/followers?skip=${skip}&limit=${limit}`
  );
  
  return response.json();
}

// Usage
const { items: followers, count } = await getFollowers('user-uuid');
```

### Get Following
```javascript
async function getFollowing(userId, skip = 0, limit = 10) {
  const response = await fetch(
    `http://localhost:8000/api/follow/user/${userId}/following?skip=${skip}&limit=${limit}`
  );
  
  return response.json();
}
```

## Feed Examples

### Get Personalized Feed
Returns posts from users you follow.

```javascript
async function getPersonalizedFeed(skip = 0, limit = 10) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:8000/api/feed?skip=${skip}&limit=${limit}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch feed');
  return response.json();
}

// Usage
const { items: posts } = await getPersonalizedFeed(0, 20);
```

## React Hooks Example

```typescript
import { useState, useEffect } from 'react';

// Custom hook for fetching posts
function usePosts(skip = 0, limit = 10) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [skip, limit]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/posts?skip=${skip}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, refetch: fetchPosts };
}

// Custom hook for protected operations
function useAuth() {
  const getToken = () => localStorage.getItem('token');
  
  const apiCall = async (url, options = {}) => {
    const token = getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return response;
  };

  return { getToken, apiCall };
}

// Usage in component
function PostList() {
  const { posts, loading, error } = usePosts(0, 10);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <small>By {post.author.username}</small>
        </article>
      ))}
    </div>
  );
}
```

## Error Handling

```javascript
async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      switch (response.status) {
        case 401:
          throw new Error('Authentication failed - please login');
        case 403:
          throw new Error('You do not have permission to perform this action');
        case 404:
          throw new Error('Resource not found');
        case 400:
          throw new Error(error.detail || 'Invalid request');
        default:
          throw new Error('An error occurred');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## API Client Class

```typescript
class ForumAPI {
  private baseURL = 'http://localhost:8000/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Handle token expiration
      this.token = null;
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Posts
  async createPost(title: string, content: string) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async getPosts(skip = 0, limit = 10) {
    return this.request(`/posts?skip=${skip}&limit=${limit}`);
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`);
  }

  async updatePost(id: string, title: string, content: string) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, { method: 'DELETE' });
  }

  // Comments
  async createComment(postId: string, content: string) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, content }),
    });
  }

  async getComments(postId: string, skip = 0, limit = 10) {
    return this.request(`/comments/post/${postId}?skip=${skip}&limit=${limit}`);
  }

  async deleteComment(id: string) {
    return this.request(`/comments/${id}`, { method: 'DELETE' });
  }

  // Follow
  async followUser(userId: string) {
    return this.request(`/follow/${userId}`, { method: 'POST' });
  }

  async unfollowUser(userId: string) {
    return this.request(`/follow/${userId}`, { method: 'DELETE' });
  }

  async getFollowers(userId: string, skip = 0, limit = 10) {
    return this.request(`/follow/user/${userId}/followers?skip=${skip}&limit=${limit}`);
  }

  async getFollowing(userId: string, skip = 0, limit = 10) {
    return this.request(`/follow/user/${userId}/following?skip=${skip}&limit=${limit}`);
  }

  // Feed
  async getFeed(skip = 0, limit = 10) {
    return this.request(`/feed?skip=${skip}&limit=${limit}`);
  }
}

// Usage
const api = new ForumAPI();
api.setToken(localStorage.getItem('token') || '');

// Create post
const post = await api.createPost('Title', 'Content');

// Get feed
const feed = await api.getFeed(0, 20);
```

## Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request returned data |
| 201 | Created | POST request created resource |
| 204 | No Content | DELETE request succeeded |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not owner of resource |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

---

Happy coding! 🚀
"""
