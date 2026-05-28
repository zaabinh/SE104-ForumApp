from seed_admin import create_admin
from seed_data import create_data
from seed_user import create_demo_user

if __name__ == "__main__":
    create_data()
    create_demo_user()
    create_admin()
