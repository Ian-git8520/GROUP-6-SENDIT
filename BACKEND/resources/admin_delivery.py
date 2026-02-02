from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Delivery, Rider
from utils.auth import token_required, admin_required


class AdminDeliveryResource(Resource):

    @token_required
    @admin_required
    def patch(self, current_user, delivery_id):
        """
        Admin updates:
        status
        rider_id
        current_location
        """
        data = request.get_json()
        db = SessionLocal()

        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404

            if "status" in data:
                delivery.status = data["status"]

            if "rider_id" in data:
                rider = db.query(Rider).filter_by(id=data["rider_id"]).first()
                if not rider:
                    return {"error": "Rider not found"}, 404
                delivery.rider_id = rider.id

            if "current_location" in data:
                delivery.current_location = data["current_location"]

            db.commit()

            return {
                "message": "Delivery updated successfully",
                "delivery": {
                    "id": delivery.id,
                    "status": delivery.status,
                    "rider_id": delivery.rider_id,
                    "current_location": delivery.current_location
                }
            }, 200

        finally:
            db.close()
