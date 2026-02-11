from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base


DATABASE_URL = "postgresql+psycopg2://abdrahan:abdi12345@localhost:5432/sendit_db"



engine = create_engine(
    DATABASE_URL,
    echo=False  
)


SessionLocal = sessionmaker(bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)
