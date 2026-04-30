"""
seed_users.py — Create the 4 default users (one per role).
Run:  docker compose exec backend python seed_users.py
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import User, Institution
from app.services.auth import hash_password

DATABASE_URL = "postgresql://hack4ucar:secret@db:5432/hack4ucar_db"
engine = create_engine(DATABASE_URL)
db = sessionmaker(bind=engine)()

# Pick one institution for the Dean
first_inst = db.query(Institution).first()

users = [
    {
        "email": "president@ucar.tn",
        "password": "president123",
        "full_name": "Mohamed Ben Ali",
        "role": "president",
        "institution_id": None,
    },
    {
        "email": "dean@ucar.tn",
        "password": "dean123",
        "full_name": "Fatma Trabelsi",
        "role": "dean",
        "institution_id": first_inst.id if first_inst else None,
    },
    {
        "email": "admin@ucar.tn",
        "password": "admin123",
        "full_name": "Ahmed Khemiri",
        "role": "admin",
        "institution_id": None,
    },
    {
        "email": "researcher@ucar.tn",
        "password": "researcher123",
        "full_name": "Sana Mejri",
        "role": "researcher",
        "institution_id": None,
    },
]

for u in users:
    exists = db.query(User).filter(User.email == u["email"]).first()
    if exists:
        print(f"  ⏭ {u['email']} already exists")
        continue
    user = User(
        email=u["email"],
        hashed_password=hash_password(u["password"]),
        full_name=u["full_name"],
        role=u["role"],
        institution_id=u["institution_id"],
    )
    db.add(user)
    print(f"  + {u['email']} ({u['role']})")

db.commit()
print("\n✅ Users seeded!")
print("   Login credentials:")
print("   president@ucar.tn / president123")
print("   dean@ucar.tn / dean123")
print("   admin@ucar.tn / admin123")
print("   researcher@ucar.tn / researcher123")
