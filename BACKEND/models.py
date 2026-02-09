from sqlalchemy import ( Column,Integer, String, Float, ForeignKey, DateTime )

from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)  # admin | customer

    users = relationship("User", back_populates="role")



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone_number = Column(String, nullable=True)
    password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("user_roles.id"), nullable=False)

    role = relationship("UserRole", back_populates="users")
    deliveries = relationship("Delivery", back_populates="user")



class Rider(Base):
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    deliveries = relationship("Delivery", back_populates="rider")



class PriceIndex(Base):
    __tablename__ = "price_index"

    id = Column(Integer, primary_key=True)
    price_per_km = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    price_per_cm = Column(Float, nullable=False)

    deliveries = relationship("Delivery", back_populates="price_index")



class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("riders.id"), nullable=True)
    price_index_id = Column(Integer, ForeignKey("price_index.id"), nullable=False)

   
    distance = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    size = Column(Float, nullable=False)

    
    pickup_location = Column(String, nullable=False)
    drop_off_location = Column(String, nullable=False)

    # Store locations as plain text strings (human-readable addresses)

    
    total_price = Column(Float, nullable=False)

  
    status = Column(
        String,
        nullable=False,
        default="pending"
    )  # pending | accepted | in_transit | delivered | cancelled

    canceled_by = Column(String, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(String, nullable=True)
    
    # Track destination changes
    previous_drop_off_location = Column(String, nullable=True)
    destination_changed_at = Column(DateTime, nullable=True)
    
    # Optional human-readable order name
    order_name = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="deliveries")
    rider = relationship("Rider", back_populates="deliveries")
    price_index = relationship("PriceIndex", back_populates="deliveries")
