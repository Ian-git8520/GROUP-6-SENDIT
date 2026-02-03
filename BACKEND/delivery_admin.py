from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Delivery, User
from role_authorization import require_role
from email_service import send_delivery_email

class AdminDeliveryUpdate(Resource):
    def patch(self, delivery_id):
        auth = require_role("admin")
        if isinstance(auth, tuple):
            return auth

        db = SessionLocal()
        delivery = db.query(Delivery).get(delivery_id)

        if not delivery:
            db.close()
            return {"error": "Delivery not found"}, 404

        data = request.json
        previous_status = delivery.status

        if "status" in data:
            delivery.status = data["status"]


        if "rider_id" in data:
            rider = db.query(User).get(data["rider_id"])
            if not rider or rider.role.name != "driver":
                db.close()
                return {"error": "Invalid driver"}, 400
            delivery.rider_id = rider.id

        if "distance" in data:
            delivery.distance = data["distance"]

        if "weight" in data:
            delivery.weight = data["weight"]

        if "size" in data:
            delivery.size = data["size"]


        if any(k in data for k in ["distance", "weight", "size"]):
            price_index = delivery.price_index
            delivery.total_price = (
                price_index.price_per_km * delivery.distance +
                price_index.price_per_kg * delivery.weight +
                price_index.price_per_cm * delivery.size
            )

        db.commit()

    
        if previous_status != "delivered" and delivery.status == "delivered":
            send_delivery_email(
                delivery.customer.email,
                delivery.id
            )

        db.close()

        return {
            "message": "Delivery updated successfully",
            "delivery_id": delivery.id,
            "status": delivery.status
        }, 200
