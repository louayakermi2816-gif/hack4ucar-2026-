from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Institution
import random

DATABASE_URL = "postgresql://hack4ucar:secret@db:5432/hack4ucar_db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

# Base coordinates for locations with a tiny bit of random jitter so they don't perfectly overlap
locations = {
    "Tunis": (36.8065, 10.1815),
    "Bizerte": (37.2744, 9.8739),
    "Nabeul": (36.4561, 10.7376),
    "Carthage": (36.8528, 10.3233),
    "Marsa": (36.8782, 10.3246),
    "Gammarth": (36.9069, 10.3015),
    "Mograne": (36.4385, 10.0934),
    "Mateur": (37.0405, 9.6644),
    "Borj Cédria": (36.6853, 10.4172),
    "Soukra": (36.8625, 10.2522),
    "Sidi Dhrif": (36.8712, 10.3400)
}

institutions = db.query(Institution).all()
for inst in institutions:
    loc = inst.location
    if loc in locations:
        base_lat, base_lng = locations[loc]
        inst.latitude = base_lat + random.uniform(-0.015, 0.015)
        inst.longitude = base_lng + random.uniform(-0.015, 0.015)
    else:
        inst.latitude = 36.8065 + random.uniform(-0.02, 0.02)
        inst.longitude = 10.1815 + random.uniform(-0.02, 0.02)

db.commit()
print("Updated coordinates for all institutions!")
