import json
import re
import unicodedata
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models.post import Post
from models.tag import Tag
from models.user import User

# Hàm tạo slug tự động từ tiêu đề (Ví dụ: "Học UIT" -> "hoc-uit")
def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8').lower()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')

def seed_data():
    db = SessionLocal()
    try:
        # 1. Đọc file JSON
        with open('data.json', 'r', encoding='utf-8') as f:
            posts_data = json.load(f)

        # 2. Lấy một User có sẵn trong DB để làm tác giả (mặc định id=1)
        author = db.query(User).first()
        if not author:
            print("Lỗi: Bạn cần chạy init_db.py và tạo ít nhất 1 tài khoản trước!")
            return

        for item in posts_data:
            # 3. Tạo đối tượng Post
            new_post = Post(
                title=item['title'],
                content=item['content'],
                slug=slugify(item['title']),
                view_count=item.get('view_count', 0),
                cover_image=item.get('cover_image'),
                user_id=author.id
            )

            # 4. Xử lý Tags (Nếu chưa có thì tạo mới, có rồi thì liên kết)
            for tag_name in item['tags']:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name, slug=slugify(tag_name))
                    db.add(tag)
                    db.flush() # Để lấy ID của tag mới tạo
                
                if tag not in new_post.tags:
                    new_post.tags.append(tag)

            db.add(new_post)
        
        db.commit()
        print(f"Thành công: Đã thêm {len(posts_data)} bài viết mẫu vào Database!")
    
    except Exception as e:
        print(f"Đã xảy ra lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
