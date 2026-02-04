from sqlalchemy.orm import Session
from models import UserRole, User, Rider, PriceIndex, Delivery
import json



def create_user_role(db: Session, name: str) -> UserRole:
    role = UserRole(name=name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def get_user_role(db: Session, role_id: int) -> UserRole | None:
    return db.query(UserRole).filter_by(id=role_id).first()


def get_user_role_by_name(db: Session, name: str) -> UserRole | None:
    return db.query(UserRole).filter_by(name=name).first()


def get_all_user_roles(db: Session) -> list[UserRole]:
    return db.query(UserRole).all()


def update_user_role(db: Session, role_id: int, name: str) -> UserRole | None:
    role = get_user_role(db, role_id)
    if not role:
        return None
    role.name = name
    db.commit()
    db.refresh(role)
    return role


def delete_user_role(db: Session, role_id: int) -> bool:
    role = get_user_role(db, role_id)
    if not role:
        return False
    db.delete(role)
    db.commit()
    return True



def create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    phone_number: str | None = None,
    role_id: int | None = None
) -> User:
    user = User(
        name=name,
        email=email,
        password=hash_password(password),
        phone_number=phone_number,
        role_id=role_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter_by(email=email).first()


def get_all_users(db: Session) -> list[User]:
    return db.query(User).all()


def update_user(db: Session, user_id: int, **kwargs) -> User | None:
    user = get_user(db, user_id)
    if not user:
        return None
    for field, value in kwargs.items():
        if value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    user = get_user(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True



def create_rider(
    db: Session,
    name: str,
    phone_number: str | None = None
) -> Rider:
    rider = Rider(name=name, phone_number=phone_number)
    db.add(rider)
    db.commit()
    db.refresh(rider)
    return rider


def get_rider(db: Session, rider_id: int) -> Rider | None:
    return db.query(Rider).filter_by(id=rider_id).first()


def get_all_riders(db: Session) -> list[Rider]:
    return db.query(Rider).all()


def update_rider(db: Session, rider_id: int, **kwargs) -> Rider | None:
    rider = get_rider(db, rider_id)
    if not rider:
        return None
    for field, value in kwargs.items():
        if value is not None:
            setattr(rider, field, value)
    db.commit()
    db.refresh(rider)
    return rider


def delete_rider(db: Session, rider_id: int) -> bool:
    rider = get_rider(db, rider_id)
    if not rider:
        return False
    db.delete(rider)
    db.commit()
    return True



def create_price_index(
    db: Session,
    price_per_km: int,
    price_per_kg: int,
    price_per_cm: int
) -> PriceIndex:
    index = PriceIndex(
        price_per_km=price_per_km,
        price_per_kg=price_per_kg,
        price_per_cm=price_per_cm
    )
    db.add(index)
    db.commit()
    db.refresh(index)
    return index


def get_price_index(db: Session, index_id: int) -> PriceIndex | None:
    return db.query(PriceIndex).filter_by(id=index_id).first()


def get_all_price_indexes(db: Session) -> list[PriceIndex]:
    return db.query(PriceIndex).all()


def update_price_index(db: Session, index_id: int, **kwargs) -> PriceIndex | None:
    index = get_price_index(db, index_id)
    if not index:
        return None
    for field, value in kwargs.items():
        if value is not None:
            setattr(index, field, value)
    db.commit()
    db.refresh(index)
    return index


def delete_price_index(db: Session, index_id: int) -> bool:
    index = get_price_index(db, index_id)
    if not index:
        return False
    db.delete(index)
    db.commit()
    return True



def create_delivery(
    db: Session,
    user_id: int,
    price_index_id: int,
    distance: float,
    weight: float,
    size: float,
    pickup_location: dict,
    drop_off_location: dict,
    total_price: float,        
    rider_id: int | None = None,
    status: str = "pending"
) -> Delivery:
    delivery = Delivery(
        user_id=user_id,
        rider_id=rider_id,
        price_index_id=price_index_id,
        distance=distance,
        weight=weight,
        size=size,
        pickup_location=json.dumps(pickup_location),
        drop_off_location=json.dumps(drop_off_location),
        total_price=total_price,   
        status=status
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery



def get_delivery(db: Session, delivery_id: int) -> Delivery | None:
    return db.query(Delivery).filter_by(id=delivery_id).first()


def get_all_deliveries(db: Session) -> list[Delivery]:
    return db.query(Delivery).all()


def get_deliveries_by_user(db: Session, user_id: int) -> list[Delivery]:
    return db.query(Delivery).filter_by(user_id=user_id).all()


def get_deliveries_by_rider(db: Session, rider_id: int) -> list[Delivery]:
    return db.query(Delivery).filter_by(rider_id=rider_id).all()


def update_delivery(db: Session, delivery_id: int, **kwargs) -> Delivery | None:
    delivery = get_delivery(db, delivery_id)
    if not delivery:
        return None

    for field, value in kwargs.items():
        if value is not None:
            if field in ["pickup_location", "drop_off_location"]:
                value = json.dumps(value)
            setattr(delivery, field, value)

    db.commit()
    db.refresh(delivery)
    return delivery


def delete_delivery(db: Session, delivery_id: int) -> bool:
    delivery = get_delivery(db, delivery_id)
    if not delivery:
        return False
    db.delete(delivery)
    db.commit()
    return True
