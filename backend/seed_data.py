import uuid
import json
import random
from datetime import datetime, timedelta
import os

import pyodbc
from slugify import slugify

# =========================================================
# CONFIG
# =========================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost\\SQLEXPRESS;"
    "DATABASE=StudentForum;"
    "Trusted_Connection=yes;"
    "Encrypt=no;"
    "TrustServerCertificate=yes;"
)

# =========================================================
# LOAD DATA
# =========================================================

with open("data.json", "r", encoding="utf-8") as f:
    DATA = json.load(f)

USERS = DATA["users"]
TAGS = DATA["tags"]
POSTS = DATA["posts"]

PASSWORD_HASH = "hashed_password_demo"

# =========================================================
# DB
# =========================================================

def get_connection():
    return pyodbc.connect(DATABASE_URL)

# =========================================================
# CREATE TAGS
# =========================================================

def create_tags(cursor):

    tag_map = {}

    for tag in TAGS:

        slug = slugify(tag)

        cursor.execute("""
            IF NOT EXISTS (
                SELECT 1 FROM tags WHERE slug = ?
            )
            BEGIN
                INSERT INTO tags(name, slug)
                VALUES (?, ?)
            END
        """, slug, tag, slug)

    cursor.execute("""
        SELECT id, name
        FROM tags
    """)

    rows = cursor.fetchall()

    for row in rows:
        tag_map[row.name] = row.id

    return tag_map

# =========================================================
# CREATE USERS
# =========================================================

def create_users(cursor):

    user_map = {}

    for user in USERS:

        user_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO users (
                id,
                username,
                email,
                password_hash,
                full_name,
                avatar_url,
                bio,
                role,
                status,
                provider,
                is_verified,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        user_id,
        user["username"],
        user["email"],
        PASSWORD_HASH,
        user["full_name"],
        user["avatar_url"],
        user["bio"],
        "Student",
        "active",
        "local",
        1,
        datetime.now() - timedelta(days=random.randint(1, 300))
        )

        user_map[user["username"]] = user_id

    return user_map

# =========================================================
# CREATE POSTS
# =========================================================

def create_posts(cursor, user_map, tag_map):

    post_ids = []

    for post in POSTS:

        user_id = user_map[post["author"]]

        slug = (
            slugify(post["title"])
            + "-"
            + str(random.randint(1000, 9999))
        )

        cover_image = random.choice([
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
        ])

        created_at = datetime.now() - timedelta(
            days=random.randint(0, 120),
            hours=random.randint(0, 23)
        )

        cursor.execute("""
            INSERT INTO posts (
                user_id,
                title,
                slug,
                content,
                cover_image,
                status,
                created_at
            )
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        user_id,
        post["title"],
        slug,
        post["content"],
        cover_image,
        "active",
        created_at
        )

        post_id = cursor.fetchone()[0]

        post_ids.append(post_id)

        # =====================================================
        # TAGS
        # =====================================================

        for tag_name in post["tags"]:

            if tag_name not in tag_map:
                continue

            tag_id = tag_map[tag_name]

            cursor.execute("""
                INSERT INTO post_tags (
                    post_id,
                    tag_id
                )
                VALUES (?, ?)
            """,
            post_id,
            tag_id
            )

    return post_ids

# =========================================================
# COMMENTS
# =========================================================

COMMENT_CONTENTS = [
    "Bài viết hữu ích thật",
    "Cảm ơn bạn đã chia sẻ",
    "Mình cũng đang học phần này 😭",
    "Cho mình xin thêm tài liệu với",
    "Docker đúng là cứu team project",
    "Mình từng gặp lỗi giống vậy",
    "React Query dùng thích thật",
    "FastAPI generate Swagger quá tiện",
    "Team mình cũng đang làm đề tài tương tự",
    "Hay quá, học được thêm nhiều thứ"
]

def create_comments(cursor, user_ids, post_ids):

    for post_id in post_ids:

        comments_count = random.randint(2, 10)

        for _ in range(comments_count):

            user_id = random.choice(user_ids)

            content = random.choice(COMMENT_CONTENTS)

            created_at = datetime.now() - timedelta(
                days=random.randint(0, 30)
            )

            cursor.execute("""
                INSERT INTO comments (
                    post_id,
                    user_id,
                    parent_id,
                    content,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?)
            """,
            post_id,
            user_id,
            None,
            content,
            created_at
            )

# =========================================================
# LIKES
# =========================================================

def create_likes(cursor, user_ids, post_ids):

    for post_id in post_ids:

        liked_users = random.sample(
            user_ids,
            random.randint(1, len(user_ids))
        )

        for user_id in liked_users:

            cursor.execute("""
                INSERT INTO post_likes (
                    user_id,
                    post_id,
                    created_at
                )
                VALUES (?, ?, ?)
            """,
            user_id,
            post_id,
            datetime.now()
            )

# =========================================================
# BOOKMARKS
# =========================================================

def create_bookmarks(cursor, user_ids, post_ids):

    for post_id in post_ids:

        bookmarked_users = random.sample(
            user_ids,
            random.randint(0, len(user_ids) // 2)
        )

        for user_id in bookmarked_users:

            cursor.execute("""
                INSERT INTO bookmarks (
                    user_id,
                    post_id,
                    created_at
                )
                VALUES (?, ?, ?)
            """,
            user_id,
            post_id,
            datetime.now()
            )

# =========================================================
# VIEWS
# =========================================================

def create_views(cursor, user_ids, post_ids):

    for post_id in post_ids:

        views_count = random.randint(20, 200)

        for _ in range(views_count):

            user_id = random.choice(user_ids)

            cursor.execute("""
                INSERT INTO post_views (
                    post_id,
                    user_id,
                    created_at
                )
                VALUES (?, ?, ?)
            """,
            post_id,
            user_id,
            datetime.now()
            )

# =========================================================
# FOLLOWS
# =========================================================

def create_follows(cursor, user_ids):

    for follower_id in user_ids:

        following = random.sample(
            user_ids,
            random.randint(1, 4)
        )

        for following_id in following:

            if follower_id == following_id:
                continue

            try:
                cursor.execute("""
                    INSERT INTO follows (
                        follower_id,
                        following_id,
                        created_at
                    )
                    VALUES (?, ?, ?)
                """,
                follower_id,
                following_id,
                datetime.now()
                )
            except:
                pass

# =========================================================
# MAIN
# =========================================================

def create_data():

    conn = get_connection()

    cursor = conn.cursor()

    print("================================")
    print("START SEEDING DATABASE")
    print("================================")

    print("Creating tags...")
    tag_map = create_tags(cursor)

    print("Creating users...")
    user_map = create_users(cursor)

    print("Creating posts...")
    post_ids = create_posts(
        cursor,
        user_map,
        tag_map
    )

    user_ids = list(user_map.values())

    print("Creating comments...")
    create_comments(
        cursor,
        user_ids,
        post_ids
    )

    print("Creating likes...")
    create_likes(
        cursor,
        user_ids,
        post_ids
    )

    print("Creating bookmarks...")
    create_bookmarks(
        cursor,
        user_ids,
        post_ids
    )

    print("Creating views...")
    create_views(
        cursor,
        user_ids,
        post_ids
    )

    print("Creating follows...")
    create_follows(
        cursor,
        user_ids
    )

    conn.commit()

    print("================================")
    print("SEED COMPLETED SUCCESSFULLY")
    print("================================")
    print(f"Users : {len(USERS)}")
    print(f"Posts : {len(post_ids)}")
    print("================================")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    create_data()