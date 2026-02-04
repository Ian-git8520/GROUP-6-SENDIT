from models import User, Delivery

# ---------- USER CRUD ----------

def create_user(db, email, password, role_id):
    user = User(email=email, password=password, role_id=role_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db, user_id):
    return db.query(User).filter_by(id=user_id).first()

def get_all_users(db):
    return db.query(User).all()

# ---------- DELIVERY CRUD ----------

def create_delivery(db, user_id, distance, weight, size, pickup_location, drop_off_location, item_type, total_price):
    delivery = Delivery(
        user_id=user_id,
        distance=distance,
        weight=weight,
        size=size,
        pickup_location=pickup_location,
        drop_off_location=drop_off_location,
        item_type=item_type,
        total_price=total_price,
        status="Pending"
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery

def get_all_deliveries(db):
    return db.query(Delivery).all()

def get_deliveries_by_user(db, user_id):
    return db.query(Delivery).filter_by(user_id=user_id).all()
