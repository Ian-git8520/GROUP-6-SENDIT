from flask import Flask, request, jsonify
from flask_restful import Api
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, UserRole, Delivery
from pricing import calculate_price
from models import Delivery, PriceIndex
from resources.auth import LoginResource


app = Flask(__name__)
api = Api(app)


DATABASE_URL = "sqlite:///sendit.db"  
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
api.add_resource(LoginResource, "/auth/login")


Base.metadata.create_all(engine)


@app.route("/")
def home():
    return {"message": "SendIT Backend is running"}


@app.route("/users", methods=["POST"])
def create_user():
    session = SessionLocal()
    data = request.json

    user = User(
        name=data["name"],
        email=data["email"],
        phone_number=data.get("phone_number"),
        password=data["password"],
        role_id=data["role_id"]
    )

    session.add(user)
    session.commit()
    session.close()

    return jsonify({"message": "User created"}), 201

@app.route("/users", methods=["GET"])
def get_users():
    session = SessionLocal()
    users = session.query(User).all()
    result = [
        {"id": u.id, "name": u.name, "email": u.email, "phone_number": u.phone_number, "role_id": u.role_id}
        for u in users
    ]
    session.close()
    return jsonify(result)

@app.route("/deliveries", methods=["POST"])
def create_delivery():
    session = SessionLocal()
    data = request.json

    price_index = session.query(PriceIndex).first()
    if not price_index:
        return jsonify({"error": "Price index not configured"}), 400

    total_price = calculate_price(
        distance=data["distance"],
        weight=data["weight"],
        size=data["size"],
        price_index=price_index
    )

    delivery = Delivery(
        user_id=data["user_id"],
        price_index_id=price_index.id,
        distance=data["distance"],
        weight=data["weight"],
        size=data["size"],
        pickup_location=data["pickup_location"],
        drop_off_location=data["drop_off_location"],
        total_price=total_price
    )

    session.add(delivery)
    session.commit()
    session.close()

    return jsonify({
        "message": "Delivery created",
        "total_price": total_price
    }), 201



@app.route("/deliveries", methods=["GET"])
def get_deliveries():
    session = SessionLocal()
    deliveries = session.query(Delivery).all()

    result = []
    for d in deliveries:
        result.append({
            "id": d.id,
            "user_id": d.user_id,
            "pickup_location": d.pickup_location,
            "drop_off_location": d.drop_off_location,
            "distance": d.distance,
            "weight": d.weight,
            "size": d.size,
            "status": d.status
        })

    session.close()
    return jsonify(result), 200
@app.route("/deliveries/<int:delivery_id>", methods=["PATCH"])
def update_delivery_status(delivery_id):
    session = SessionLocal()
    data = request.json

    delivery = session.query(Delivery).filter(Delivery.id == delivery_id).first()

    if not delivery:
        session.close()
        return jsonify({"error": "Delivery not found"}), 404

    delivery.status = data.get("status", delivery.status)

    session.commit()
    session.close()

    return jsonify({"message": "Delivery status updated"}), 200

@app.route("/deliveries/<int:delivery_id>/cancel", methods=["PATCH"])
def cancel_delivery(delivery_id):
    session = SessionLocal()
    data = request.json

    delivery = session.query(Delivery).filter_by(id=delivery_id).first()

    if not delivery:
        session.close()
        return jsonify({"error": "Delivery not found"}), 404

    if delivery.status != "pending":
        session.close()
        return jsonify({"error": "Cannot cancel this delivery"}), 400

    delivery.status = "canceled"
    delivery.canceled_by = data.get("canceled_by", "user")

    session.commit()
    session.close()

    return jsonify({"message": "Delivery canceled"}), 200

if __name__ == "__main__":
    app.run(debug=True)
