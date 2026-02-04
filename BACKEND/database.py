from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, UserRole, PriceIndex

DATABASE_URL = "sqlite:///sendit.db"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    # Create tables
    Base.metadata.create_all(engine)

    # Seed data
    session = SessionLocal()

    # Roles
    roles = ["admin", "customer", "rider"]
    for role_name in roles:
        exists = session.query(UserRole).filter_by(name=role_name).first()
        if not exists:
            session.add(UserRole(name=role_name))

    # Price index
    if not session.query(PriceIndex).first():
        session.add(PriceIndex(price_per_km=50, price_per_kg=30, price_per_cm=5))

    session.commit()
    session.close()
    print("Database initialized and seeded successfully!")