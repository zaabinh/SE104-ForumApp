from database import engine

try:
    conn = engine.connect()
    print("Connect DB OK")
except Exception as e:
    print("Error:", e)