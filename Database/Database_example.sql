/*
    StudentForum SQL Server example schema.

    This file mirrors the current backend SQLAlchemy models plus the latest
    moderation/profile upgrades. It is intended as a reference schema or a
    clean manual bootstrap script.

    For demo data, prefer:
        cd backend
        python setup_local_db.py --seed

    Notes:
    - Foreign keys use NO ACTION to avoid SQL Server multiple cascade path issues.
    - User-facing Vietnamese text fields use NVARCHAR/NVARCHAR(MAX).
*/

IF DB_ID(N'StudentForum') IS NULL
BEGIN
    CREATE DATABASE StudentForum;
END
GO

USE StudentForum;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* =========================================================
   Drop tables in dependency order
   ========================================================= */
IF OBJECT_ID(N'dbo.notifications', N'U') IS NOT NULL DROP TABLE dbo.notifications;
IF OBJECT_ID(N'dbo.admin_audit_logs', N'U') IS NOT NULL DROP TABLE dbo.admin_audit_logs;
IF OBJECT_ID(N'dbo.reports', N'U') IS NOT NULL DROP TABLE dbo.reports;
IF OBJECT_ID(N'dbo.post_tags', N'U') IS NOT NULL DROP TABLE dbo.post_tags;
IF OBJECT_ID(N'dbo.post_shares', N'U') IS NOT NULL DROP TABLE dbo.post_shares;
IF OBJECT_ID(N'dbo.post_views', N'U') IS NOT NULL DROP TABLE dbo.post_views;
IF OBJECT_ID(N'dbo.post_likes', N'U') IS NOT NULL DROP TABLE dbo.post_likes;
IF OBJECT_ID(N'dbo.bookmarks', N'U') IS NOT NULL DROP TABLE dbo.bookmarks;
IF OBJECT_ID(N'dbo.follows', N'U') IS NOT NULL DROP TABLE dbo.follows;
IF OBJECT_ID(N'dbo.comments', N'U') IS NOT NULL DROP TABLE dbo.comments;
IF OBJECT_ID(N'dbo.auth_sessions', N'U') IS NOT NULL DROP TABLE dbo.auth_sessions;
IF OBJECT_ID(N'dbo.email_verification_tokens', N'U') IS NOT NULL DROP TABLE dbo.email_verification_tokens;
IF OBJECT_ID(N'dbo.password_reset_tokens', N'U') IS NOT NULL DROP TABLE dbo.password_reset_tokens;
IF OBJECT_ID(N'dbo.posts', N'U') IS NOT NULL DROP TABLE dbo.posts;
IF OBJECT_ID(N'dbo.tags', N'U') IS NOT NULL DROP TABLE dbo.tags;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE dbo.users;
GO

/* =========================================================
   Users
   ========================================================= */
CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_users PRIMARY KEY
        CONSTRAINT DF_users_id DEFAULT NEWSEQUENTIALID(),
    username VARCHAR(50) NULL,
    email VARCHAR(255) NOT NULL,
    password_hash NVARCHAR(MAX) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(MAX) NULL,
    bio NVARCHAR(MAX) NULL,
    major NVARCHAR(120) NULL,
    academic_year VARCHAR(30) NULL,
    career_goal NVARCHAR(200) NULL,
    interest_tags NVARCHAR(MAX) NULL,
    role VARCHAR(50) NOT NULL CONSTRAINT DF_users_role DEFAULT 'Student',
    status VARCHAR(50) NOT NULL CONSTRAINT DF_users_status DEFAULT 'active',
    provider VARCHAR(50) NOT NULL CONSTRAINT DF_users_provider DEFAULT 'local',
    is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT 0,
    created_at DATETIME NOT NULL CONSTRAINT DF_users_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT UQ_users_email UNIQUE (email)
);
GO

CREATE INDEX IX_users_username ON dbo.users(username);
CREATE INDEX IX_users_email ON dbo.users(email);
GO

/* =========================================================
   Tags
   ========================================================= */
CREATE TABLE dbo.tags (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_tags PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_tags_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_tags_name UNIQUE (name),
    CONSTRAINT UQ_tags_slug UNIQUE (slug)
);
GO

CREATE INDEX IX_tags_name ON dbo.tags(name);
CREATE INDEX IX_tags_slug ON dbo.tags(slug);
GO

/* =========================================================
   Posts
   ========================================================= */
CREATE TABLE dbo.posts (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_posts PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug VARCHAR(255) NULL,
    content NVARCHAR(MAX) NOT NULL,
    cover_image NVARCHAR(MAX) NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_posts_status DEFAULT 'pending',
    original_post_id INT NULL,
    share_caption NVARCHAR(MAX) NULL,
    requested_new_tags NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_posts_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_posts_slug UNIQUE (slug),
    CONSTRAINT FK_posts_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_posts_original_post FOREIGN KEY (original_post_id)
        REFERENCES dbo.posts(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_posts_user_id ON dbo.posts(user_id);
CREATE INDEX IX_posts_status ON dbo.posts(status);
CREATE INDEX IX_posts_original_post_id ON dbo.posts(original_post_id);
GO

/* =========================================================
   Auth tables
   ========================================================= */
CREATE TABLE dbo.auth_sessions (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_auth_sessions PRIMARY KEY
        CONSTRAINT DF_auth_sessions_id DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    ip_address VARCHAR(100) NULL,
    user_agent VARCHAR(500) NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_auth_sessions_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_auth_sessions_refresh_token UNIQUE (refresh_token),
    CONSTRAINT FK_auth_sessions_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_auth_sessions_id ON dbo.auth_sessions(id);
CREATE INDEX IX_auth_sessions_user_id ON dbo.auth_sessions(user_id);
CREATE INDEX IX_auth_sessions_refresh_token ON dbo.auth_sessions(refresh_token);
GO

CREATE TABLE dbo.email_verification_tokens (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_email_verification_tokens PRIMARY KEY
        CONSTRAINT DF_email_verification_tokens_id DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_email_verification_tokens_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_email_verification_tokens_token UNIQUE (token),
    CONSTRAINT FK_email_verification_tokens_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_email_verification_tokens_user_id ON dbo.email_verification_tokens(user_id);
CREATE INDEX IX_email_verification_tokens_token ON dbo.email_verification_tokens(token);
GO

CREATE TABLE dbo.password_reset_tokens (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_password_reset_tokens PRIMARY KEY
        CONSTRAINT DF_password_reset_tokens_id DEFAULT NEWSEQUENTIALID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_password_reset_tokens_created_at DEFAULT GETDATE(),
    CONSTRAINT UQ_password_reset_tokens_token UNIQUE (token),
    CONSTRAINT FK_password_reset_tokens_users FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_password_reset_tokens_user_id ON dbo.password_reset_tokens(user_id);
CREATE INDEX IX_password_reset_tokens_token ON dbo.password_reset_tokens(token);
GO

/* =========================================================
   Comments
   ========================================================= */
CREATE TABLE dbo.comments (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_comments PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    parent_id INT NULL,
    content NVARCHAR(MAX) NOT NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_comments_status DEFAULT 'active',
    created_at DATETIME NOT NULL CONSTRAINT DF_comments_created_at DEFAULT GETDATE(),
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
CREATE INDEX IX_comments_user_id ON dbo.comments(user_id);
CREATE INDEX IX_comments_parent_id ON dbo.comments(parent_id);
CREATE INDEX IX_comments_status ON dbo.comments(status);
GO

/* =========================================================
   Post interactions
   ========================================================= */
CREATE TABLE dbo.post_likes (
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_post_likes_created_at DEFAULT GETDATE(),
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

CREATE TABLE dbo.post_views (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_post_views PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_post_views_created_at DEFAULT GETDATE(),
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
CREATE INDEX IX_post_views_user_id ON dbo.post_views(user_id);
GO

CREATE TABLE dbo.post_shares (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_post_shares PRIMARY KEY,
    post_id INT NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_post_shares_created_at DEFAULT GETDATE(),
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
CREATE INDEX IX_post_shares_user_id ON dbo.post_shares(user_id);
GO

CREATE TABLE dbo.bookmarks (
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_bookmarks_created_at DEFAULT GETDATE(),
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

CREATE INDEX IX_bookmarks_post_id ON dbo.bookmarks(post_id);
GO

CREATE TABLE dbo.follows (
    follower_id UNIQUEIDENTIFIER NOT NULL,
    following_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_follows_created_at DEFAULT GETDATE(),
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
   Post tags
   ========================================================= */
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

CREATE INDEX IX_post_tags_tag_id ON dbo.post_tags(tag_id);
GO

/* =========================================================
   Reports
   ========================================================= */
CREATE TABLE dbo.reports (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_reports PRIMARY KEY,
    reporter_id UNIQUEIDENTIFIER NULL,
    post_id INT NULL,
    comment_id INT NULL,
    reason VARCHAR(100) NOT NULL,
    details NVARCHAR(MAX) NULL,
    status VARCHAR(30) NOT NULL CONSTRAINT DF_reports_status DEFAULT 'pending',
    reviewed_by UNIQUEIDENTIFIER NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_reports_created_at DEFAULT GETDATE(),
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
        ON UPDATE NO ACTION,
    CONSTRAINT CHK_reports_target CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);
GO

CREATE INDEX IX_reports_reporter_id ON dbo.reports(reporter_id);
CREATE INDEX IX_reports_post_id ON dbo.reports(post_id);
CREATE INDEX IX_reports_comment_id ON dbo.reports(comment_id);
GO

/* =========================================================
   Notifications
   ========================================================= */
CREATE TABLE dbo.notifications (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_notifications PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    actor_id UNIQUEIDENTIFIER NULL,
    type VARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NULL,
    is_read BIT NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT 0,
    post_id INT NULL,
    comment_id INT NULL,
    report_id INT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_notifications_created_at DEFAULT GETDATE(),
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
CREATE INDEX IX_notifications_post_id ON dbo.notifications(post_id);
CREATE INDEX IX_notifications_comment_id ON dbo.notifications(comment_id);
CREATE INDEX IX_notifications_report_id ON dbo.notifications(report_id);
GO

/* =========================================================
   Admin audit logs
   ========================================================= */
CREATE TABLE dbo.admin_audit_logs (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_admin_audit_logs PRIMARY KEY,
    admin_user_id UNIQUEIDENTIFIER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_admin_audit_logs_created_at DEFAULT GETDATE(),
    CONSTRAINT FK_admin_audit_logs_users FOREIGN KEY (admin_user_id)
        REFERENCES dbo.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE INDEX IX_admin_audit_logs_admin_user_id ON dbo.admin_audit_logs(admin_user_id);
CREATE INDEX IX_admin_audit_logs_action_type ON dbo.admin_audit_logs(action_type);
CREATE INDEX IX_admin_audit_logs_target_type ON dbo.admin_audit_logs(target_type);
CREATE INDEX IX_admin_audit_logs_created_at ON dbo.admin_audit_logs(created_at);
GO

PRINT N'StudentForum example schema created successfully.';
GO
