from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base, UserRole, PriceIndex

DATABASE_URL = "postgresql+psycopg2://abdrahan:abdi12345@localhost:5432/sendit_db"


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def seed_data():
    session = SessionLocal()

    # the user role
    roles = ["admin", "customer", "rider"]
    for role in roles:
        exists = session.query(UserRole).filter_by(name=role).first()
        if not exists:
            session.add(UserRole(name=role))

    # price_index 
    price_exists = session.query(PriceIndex).first()
    if not price_exists:
        price_index = PriceIndex(
            price_per_km=50,   
            price_per_kg=30,   
            price_per_cm=5     
        )
        session.add(price_index)

    session.commit()
    session.close()
    print("Database seeded successfully!")


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    seed_data()
