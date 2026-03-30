CREATE DATABASE FORUM
GO 
USE FORUM
GO



-- 1. USERS & AUTH

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(MAX),
    full_name NVARCHAR(100) NOT NULL,
    avatar_url NVARCHAR(MAX),
    bio NVARCHAR(MAX),
    role VARCHAR(20) NOT NULL DEFAULT 'Student',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    provider VARCHAR(20) DEFAULT 'local',
    created_at DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE auth_sessions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    refresh_token NVARCHAR(MAX) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent NVARCHAR(MAX),
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_auth_sessions_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. POSTS & TAGS

CREATE TABLE posts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    cover_image NVARCHAR(MAX),
    view_count INT DEFAULT 0,
    trending_score FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_posts_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

CREATE TABLE tags (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),

    CONSTRAINT FK_post_tags_posts
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT FK_post_tags_tags
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 3. INTERACTIONS

CREATE TABLE comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    parent_id INT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_comments_posts
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT FK_comments_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_comments_parent
        FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE TABLE likes (
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (user_id, post_id),

    CONSTRAINT FK_likes_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_likes_posts
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks (
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (user_id, post_id),

    CONSTRAINT FK_bookmarks_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_bookmarks_posts
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE follows (
    follower_id UNIQUEIDENTIFIER NOT NULL,
    following_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (follower_id, following_id),

    CONSTRAINT FK_follows_follower
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_follows_following
        FOREIGN KEY (following_id) REFERENCES users(id),

    CONSTRAINT CHK_no_self_follow
        CHECK (follower_id <> following_id)
);

-- ==========================================================
-- 4. REPORTS & NOTIFICATIONS & AI
-- ==========================================================

CREATE TABLE reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reporter_id UNIQUEIDENTIFIER NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id INT NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_reports_users
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    receiver_id UNIQUEIDENTIFIER NOT NULL,
    sender_id UNIQUEIDENTIFIER NULL,
    type VARCHAR(50) NOT NULL,
    post_id INT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_notifications_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_notifications_sender
        FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT FK_notifications_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE user_interests (
    user_id UNIQUEIDENTIFIER NOT NULL,
    tag_id INT NOT NULL,
    weight FLOAT DEFAULT 0,
    updated_at DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (user_id, tag_id),

    CONSTRAINT FK_user_interests_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_interests_tags
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);