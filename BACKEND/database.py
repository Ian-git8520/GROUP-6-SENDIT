import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base



DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///sendit.db")

# Some hosts provide postgres:// URLs; SQLAlchemy expects postgresql+psycopg2://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)




engine = create_engine(
    DATABASE_URL,
    echo=False  
)


SessionLocal = sessionmaker(bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)
