from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "sendit.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(engine)


