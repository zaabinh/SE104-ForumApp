IF DB_ID(N'ForumDB') IS NULL
BEGIN
    CREATE DATABASE ForumDB;
END
GO

USE ForumDB;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/*
    ForumDB example schema
    Generated from the current SQLAlchemy models.
    SQL Server safe: foreign keys use ON DELETE NO ACTION to avoid cascade path conflicts.
*/

/* =========================================================
   1. USERS
   ========================================================= */
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE dbo.users;
GO

CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_users PRIMARY KEY
        CONSTRAINT DF_users_id DEFAULT NEWSEQUENTIALID(),
    username NVARCHAR(50) NULL,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(MAX) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(MAX) NULL,
    bio NVARCHAR(MAX) NULL,
    role NVARCHAR(50) NOT NULL CONSTRAINT DF_users_role DEFAULT N'Student',
    status NVARCHAR(50) NOT NULL CONSTRAINT DF_users_status DEFAULT N'active',
    provider NVARCHAR(50) NOT NULL CONSTRAINT DF_users_provider DEFAULT N'local',
    is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT 0,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT UQ_users_email UNIQUE (email)
);
GO

CREATE INDEX IX_users_username ON dbo.users(username);
GO
CREATE INDEX IX_users_email ON dbo.users(email);
GO

/* =========================================================
   2. TAGS
   ========================================================= */
IF OBJECT_ID(N'dbo.tags', N'U') IS NOT NULL DROP TABLE dbo.tags;
GO

CREATE TABLE dbo.tags (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_tags PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    slug NVARCHAR(120) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_tags_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_tags_name UNIQUE (name),
    CONSTRAINT UQ_tags_slug UNIQUE (slug)
);
GO

CREATE INDEX IX_tags_name ON dbo.tags(name);
GO
CREATE INDEX IX_tags_slug ON dbo.tags(slug);
GO

/* =========================================================
   3. POSTS
   ========================================================= */
IF OBJECT_ID(N'dbo.posts', N'U') IS NOT NULL DROP TABLE dbo.posts;
GO

CREATE TABLE dbo.posts (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_posts PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NULL,
    content NVARCHAR(MAX) NOT NULL,
    cover_image NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_posts_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_posts_slug UNIQUE (slug),
    CONSTRAINT FK_posts_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_posts_user_id ON dbo.posts(user_id);
GO

/* =========================================================
   4. AUTH TABLES
   ========================================================= */
IF OBJECT_ID(N'dbo.auth_sessions', N'U') IS NOT NULL DROP TABLE dbo.auth_sessions;
GO

CREATE TABLE dbo.auth_sessions (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_auth_sessions PRIMARY KEY
        CONSTRAINT DF_auth_sessions_id DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    refresh_token NVARCHAR(512) NOT NULL,
    ip_address NVARCHAR(100) NULL,
    user_agent NVARCHAR(500) NULL,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_auth_sessions_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_auth_sessions_refresh_token UNIQUE (refresh_token),
    CONSTRAINT FK_auth_sessions_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_auth_sessions_user_id ON dbo.auth_sessions(user_id);
GO
CREATE INDEX IX_auth_sessions_refresh_token ON dbo.auth_sessions(refresh_token);
GO

IF OBJECT_ID(N'dbo.email_verification_tokens', N'U') IS NOT NULL DROP TABLE dbo.email_verification_tokens;
GO

CREATE TABLE dbo.email_verification_tokens (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_email_verification_tokens PRIMARY KEY
        CONSTRAINT DF_email_verification_tokens_id DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token NVARCHAR(255) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_email_verification_tokens_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_email_verification_tokens_token UNIQUE (token),
    CONSTRAINT FK_email_verification_tokens_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_email_verification_tokens_user_id ON dbo.email_verification_tokens(user_id);
GO
CREATE INDEX IX_email_verification_tokens_token ON dbo.email_verification_tokens(token);
GO

IF OBJECT_ID(N'dbo.password_reset_tokens', N'U') IS NOT NULL DROP TABLE dbo.password_reset_tokens;
GO

CREATE TABLE dbo.password_reset_tokens (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_password_reset_tokens PRIMARY KEY
        CONSTRAINT DF_password_reset_tokens_id DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token NVARCHAR(255) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_password_reset_tokens_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_password_reset_tokens_token UNIQUE (token),
    CONSTRAINT FK_password_reset_tokens_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_password_reset_tokens_user_id ON dbo.password_reset_tokens(user_id);
GO
CREATE INDEX IX_password_reset_tokens_token ON dbo.password_reset_tokens(token);
GO

/* =========================================================
   5. POST INTERACTIONS
   ========================================================= */
IF OBJECT_ID(N'dbo.comments', N'U') IS NOT NULL DROP TABLE dbo.comments;
GO

CREATE TABLE dbo.comments (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_comments PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    parent_id INT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_comments_created_at DEFAULT GETDATE(),
    CONSTRAINT FK_comments_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_comments_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_comments_parent FOREIGN KEY (parent_id)
        REFERENCES dbo.comments(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_comments_post_id ON dbo.comments(post_id);
GO
CREATE INDEX IX_comments_user_id ON dbo.comments(user_id);
GO
CREATE INDEX IX_comments_parent_id ON dbo.comments(parent_id);
GO

IF OBJECT_ID(N'dbo.post_likes', N'U') IS NOT NULL DROP TABLE dbo.post_likes;
GO

CREATE TABLE dbo.post_likes (
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_post_likes_created_at DEFAULT GETDATE(),
    CONSTRAINT PK_post_likes PRIMARY KEY (user_id, post_id),
    CONSTRAINT FK_post_likes_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_post_likes_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_post_likes_post_id ON dbo.post_likes(post_id);
GO

IF OBJECT_ID(N'dbo.post_views', N'U') IS NOT NULL DROP TABLE dbo.post_views;
GO

CREATE TABLE dbo.post_views (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_post_views PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_post_views_created_at DEFAULT GETDATE(),
    CONSTRAINT FK_post_views_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_post_views_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_post_views_post_id ON dbo.post_views(post_id);
GO
CREATE INDEX IX_post_views_user_id ON dbo.post_views(user_id);
GO

IF OBJECT_ID(N'dbo.post_shares', N'U') IS NOT NULL DROP TABLE dbo.post_shares;
GO

CREATE TABLE dbo.post_shares (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_post_shares PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_post_shares_created_at DEFAULT GETDATE(),
    CONSTRAINT FK_post_shares_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_post_shares_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_post_shares_post_id ON dbo.post_shares(post_id);
GO
CREATE INDEX IX_post_shares_user_id ON dbo.post_shares(user_id);
GO

IF OBJECT_ID(N'dbo.bookmarks', N'U') IS NOT NULL DROP TABLE dbo.bookmarks;
GO

CREATE TABLE dbo.bookmarks (
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_bookmarks_created_at DEFAULT GETDATE(),
    CONSTRAINT PK_bookmarks PRIMARY KEY (user_id, post_id),
    CONSTRAINT FK_bookmarks_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_bookmarks_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_bookmarks_user_id ON dbo.bookmarks(user_id);
GO

IF OBJECT_ID(N'dbo.follows', N'U') IS NOT NULL DROP TABLE dbo.follows;
GO

CREATE TABLE dbo.follows (
    follower_id UNIQUEIDENTIFIER NOT NULL,
    following_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_follows_created_at DEFAULT GETDATE(),
    CONSTRAINT PK_follows PRIMARY KEY (follower_id, following_id),
    CONSTRAINT FK_follows_follower FOREIGN KEY (follower_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_follows_following FOREIGN KEY (following_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT CHK_follows_not_self CHECK (follower_id <> following_id)
);
GO

CREATE INDEX IX_follows_following_id ON dbo.follows(following_id);
GO

/* =========================================================
   6. REPORTS AND NOTIFICATIONS
   ========================================================= */
IF OBJECT_ID(N'dbo.reports', N'U') IS NOT NULL DROP TABLE dbo.reports;
GO

CREATE TABLE dbo.reports (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_reports PRIMARY KEY,
    reporter_id UNIQUEIDENTIFIER NULL,
    post_id INT NULL,
    comment_id INT NULL,
    reason NVARCHAR(100) NOT NULL,
    details NVARCHAR(MAX) NULL,
    status NVARCHAR(30) NOT NULL CONSTRAINT DF_reports_status DEFAULT N'pending',
    reviewed_by UNIQUEIDENTIFIER NULL,
    reviewed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_reports_created_at DEFAULT GETDATE(),
    CONSTRAINT FK_reports_reporter FOREIGN KEY (reporter_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_reports_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_reports_comments FOREIGN KEY (comment_id)
        REFERENCES dbo.comments(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_reports_reviewed_by FOREIGN KEY (reviewed_by)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_reports_reporter_id ON dbo.reports(reporter_id);
GO
CREATE INDEX IX_reports_post_id ON dbo.reports(post_id);
GO
CREATE INDEX IX_reports_comment_id ON dbo.reports(comment_id);
GO

IF OBJECT_ID(N'dbo.notifications', N'U') IS NOT NULL DROP TABLE dbo.notifications;
GO

CREATE TABLE dbo.notifications (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_notifications PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    actor_id UNIQUEIDENTIFIER NULL,
    type NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NULL,
    is_read BIT NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT 0,
    post_id INT NULL,
    comment_id INT NULL,
    report_id INT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_notifications_created_at DEFAULT GETDATE(),
    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_notifications_actor FOREIGN KEY (actor_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_notifications_post FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_notifications_comment FOREIGN KEY (comment_id)
        REFERENCES dbo.comments(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_notifications_report FOREIGN KEY (report_id)
        REFERENCES dbo.reports(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_notifications_user_id ON dbo.notifications(user_id);
GO
CREATE INDEX IX_notifications_post_id ON dbo.notifications(post_id);
GO
CREATE INDEX IX_notifications_comment_id ON dbo.notifications(comment_id);
GO
CREATE INDEX IX_notifications_report_id ON dbo.notifications(report_id);
GO

/* =========================================================
   7. POST TAGS
   ========================================================= */
IF OBJECT_ID(N'dbo.post_tags', N'U') IS NOT NULL DROP TABLE dbo.post_tags;
GO

CREATE TABLE dbo.post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    CONSTRAINT PK_post_tags PRIMARY KEY (post_id, tag_id),
    CONSTRAINT FK_post_tags_posts FOREIGN KEY (post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_post_tags_tags FOREIGN KEY (tag_id)
        REFERENCES dbo.tags(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_post_tags_post_id ON dbo.post_tags(post_id);
GO
CREATE INDEX IX_post_tags_tag_id ON dbo.post_tags(tag_id);
GO
/*
/* =========================================================
   8. SAMPLE DATA
   ========================================================= */
DECLARE @UserA UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @UserB UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @AuthA UNIQUEIDENTIFIER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
DECLARE @ResetA UNIQUEIDENTIFIER = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SET IDENTITY_INSERT dbo.tags ON;
INSERT INTO dbo.tags (id, name, slug, created_at)
VALUES
    (1, N'fastapi', N'fastapi', GETDATE()),
    (2, N'nextjs', N'nextjs', GETDATE());
SET IDENTITY_INSERT dbo.tags OFF;
GO

INSERT INTO dbo.users (id, username, email, password_hash, full_name, avatar_url, bio, role, status, provider, is_verified, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', N'nguyenvana', N'vana@example.com', N'hashed_password_1', N'Nguyễn Văn A', NULL, N'Sinh viên ngành Công nghệ thông tin', N'Student', N'active', N'local', 1, GETDATE()),
    ('22222222-2222-2222-2222-222222222222', N'tranthib', N'thib@example.com', N'hashed_password_2', N'Trần Thị B', NULL, N'Yêu thích phát triển web và cơ sở dữ liệu', N'Student', N'active', N'local', 1, GETDATE());
GO

INSERT INTO dbo.auth_sessions (id, user_id, refresh_token, ip_address, user_agent, expires_at, created_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', N'refresh_token_example_1', N'127.0.0.1', N'Example Browser', DATEADD(DAY, 7, GETDATE()), GETDATE());
GO

INSERT INTO dbo.email_verification_tokens (id, user_id, token, expires_at, created_at)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', N'verify_token_example_1', DATEADD(HOUR, 24, GETDATE()), GETDATE());
GO

INSERT INTO dbo.password_reset_tokens (id, user_id, token, expires_at, used_at, created_at)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', N'reset_token_example_1', DATEADD(MINUTE, 30, GETDATE()), NULL, GETDATE());
GO

SET IDENTITY_INSERT dbo.posts ON;
INSERT INTO dbo.posts (id, user_id, title, slug, content, cover_image, status, created_at)
VALUES
    (1, '11111111-1111-1111-1111-111111111111', N'Giới thiệu FastAPI cho diễn đàn sinh viên', N'gioi-thieu-fastapi', N'Đây là bài viết mẫu về cách xây dựng API bằng FastAPI.', NULL, N'active', GETDATE()),
    (2, '22222222-2222-2222-2222-222222222222', N'Chia sẻ kinh nghiệm dùng Next.js App Router', N'nextjs-app-router', N'Đây là bài viết mẫu về giao diện và routing với Next.js.', NULL, N'active', GETDATE());
SET IDENTITY_INSERT dbo.posts OFF;
GO

INSERT INTO dbo.post_tags (post_id, tag_id)
VALUES
    (1, 1),
    (2, 2);
GO

SET IDENTITY_INSERT dbo.comments ON;
INSERT INTO dbo.comments (id, post_id, user_id, parent_id, content, created_at)
VALUES
    (1, 1, '22222222-2222-2222-2222-222222222222', NULL, N'Bài viết rất hữu ích cho người mới bắt đầu.', GETDATE());
SET IDENTITY_INSERT dbo.comments OFF;
GO

INSERT INTO dbo.post_likes (user_id, post_id, created_at)
VALUES
    ('22222222-2222-2222-2222-222222222222', 1, GETDATE());
GO

INSERT INTO dbo.bookmarks (user_id, post_id, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 2, GETDATE());
GO

INSERT INTO dbo.follows (follower_id, following_id, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', GETDATE());
GO

INSERT INTO dbo.post_views (post_id, user_id, created_at)
VALUES
    (1, '22222222-2222-2222-2222-222222222222', GETDATE());
GO

INSERT INTO dbo.post_shares (post_id, user_id, created_at)
VALUES
    (2, '11111111-1111-1111-1111-111111111111', GETDATE());
GO

SET IDENTITY_INSERT dbo.reports ON;
INSERT INTO dbo.reports (id, reporter_id, post_id, comment_id, reason, details, status, reviewed_by, reviewed_at, created_at)
VALUES
    (1, '11111111-1111-1111-1111-111111111111', 2, NULL, N'spam', N'Nội dung không liên quan đến chủ đề học tập.', N'pending', NULL, NULL, GETDATE());
SET IDENTITY_INSERT dbo.reports OFF;
GO

SET IDENTITY_INSERT dbo.notifications ON;
INSERT INTO dbo.notifications (id, user_id, actor_id, type, title, message, is_read, post_id, comment_id, report_id, created_at)
VALUES
    (1, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', N'post_like', N'Bài viết của bạn vừa được thích', N'Trần Thị B đã thích bài viết của bạn.', 0, 1, NULL, NULL, GETDATE());
SET IDENTITY_INSERT dbo.notifications OFF;
GO
*/
