import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = "postgresql+psycopg2://abdi:12345@localhost/sendit_db"

engine = create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
