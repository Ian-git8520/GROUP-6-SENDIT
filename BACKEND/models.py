from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))

    role = relationship("Role")

    def __init__(self, email, password, role_id):
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.role_id = role_id

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    distance = Column(Float)
    weight = Column(Float)
    size = Column(Float)
    pickup_location = Column(JSON)
    drop_off_location = Column(JSON)
    item_type = Column(String, default="General")
    total_price = Column(Float)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "distance": self.distance,
            "weight": self.weight,
            "size": self.size,
            "pickup_location": self.pickup_location,
            "drop_off_location": self.drop_off_location,
            "item_type": self.item_type,
            "total_price": self.total_price,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }
