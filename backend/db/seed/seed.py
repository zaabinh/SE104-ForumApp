from seed_admin import create_admin
from seed_data import create_data
from seed_user import create_demo_user


def run_seed() -> None:
    create_data()
    demo_user = create_demo_user()
    admin_user = create_admin()

    print("Seed completed successfully.")
    print("Demo accounts:")
    print(f"- Demo user : {demo_user.email} (username: {demo_user.username})")
    print("- Demo user password: demo1234")
    print(f"- Demo admin: {admin_user.email} (username: {admin_user.username})")
    print("- Demo admin password: read from SEED_ADMIN_PASSWORD in .env")


if __name__ == "__main__":
    run_seed()
