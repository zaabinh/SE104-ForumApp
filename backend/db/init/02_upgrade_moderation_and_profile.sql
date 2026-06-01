-- Run this script once on existing databases to add new moderation/profile columns.

IF COL_LENGTH('users', 'major') IS NULL
    ALTER TABLE users ADD major NVARCHAR(120) NULL;
GO

IF COL_LENGTH('users', 'academic_year') IS NULL
    ALTER TABLE users ADD academic_year VARCHAR(30) NULL;
GO

IF COL_LENGTH('users', 'career_goal') IS NULL
    ALTER TABLE users ADD career_goal NVARCHAR(200) NULL;
GO

IF COL_LENGTH('users', 'interest_tags') IS NULL
    ALTER TABLE users ADD interest_tags NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('posts', 'status') IS NOT NULL
BEGIN
    UPDATE posts SET status = 'pending' WHERE status IS NULL;
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        JOIN sys.columns c ON c.default_object_id = dc.object_id
        JOIN sys.tables t ON t.object_id = c.object_id
        WHERE t.name = 'posts' AND c.name = 'status'
    )
        ALTER TABLE posts ADD CONSTRAINT DF_posts_status DEFAULT 'pending' FOR status;
    ALTER TABLE posts ALTER COLUMN status VARCHAR(20) NOT NULL;
END
GO

IF OBJECT_ID('admin_audit_logs', 'U') IS NULL
BEGIN
    CREATE TABLE admin_audit_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        admin_user_id UNIQUEIDENTIFIER NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        notes NVARCHAR(MAX) NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_admin_audit_logs_users FOREIGN KEY (admin_user_id) REFERENCES users(id)
    );
    CREATE INDEX IX_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
    CREATE INDEX IX_admin_audit_logs_action_type ON admin_audit_logs(action_type);
    CREATE INDEX IX_admin_audit_logs_target_type ON admin_audit_logs(target_type);
    CREATE INDEX IX_admin_audit_logs_created_at ON admin_audit_logs(created_at);
END
GO

IF COL_LENGTH('posts', 'original_post_id') IS NULL
    ALTER TABLE posts ADD original_post_id INT NULL;
GO

IF COL_LENGTH('posts', 'share_caption') IS NULL
    ALTER TABLE posts ADD share_caption NVARCHAR(MAX) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_posts_original_post_id'
)
AND COL_LENGTH('posts', 'original_post_id') IS NOT NULL
BEGIN
    ALTER TABLE posts
    ADD CONSTRAINT FK_posts_original_post_id
    FOREIGN KEY (original_post_id) REFERENCES posts(id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_posts_original_post_id'
      AND object_id = OBJECT_ID('posts')
)
AND COL_LENGTH('posts', 'original_post_id') IS NOT NULL
BEGIN
    CREATE INDEX IX_posts_original_post_id ON posts(original_post_id);
END
GO
