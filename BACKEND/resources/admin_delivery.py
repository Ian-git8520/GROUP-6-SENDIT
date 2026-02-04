from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Delivery, Rider, User
from utils.auth import token_required, admin_required


class AdminDeliveryResource(Resource):

    @token_required
    @admin_required
    def patch(self, current_user, delivery_id):
        """
        Admin updates:
        status
        rider_id (assign driver to delivery)
        current_location
        """
        data = request.get_json()
        db = SessionLocal()

        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404

            # Update status
            if "status" in data:
                delivery.status = data["status"]
                
                # If status is approved/accepted, ensure rider is assigned
                if data["status"] == "accepted" and not delivery.rider_id:
                    # Try to assign an available driver if not specified
                    if "rider_id" not in data:
                        # Auto-assign if rider_id is provided
                        pass

            # Assign driver to delivery
            if "rider_id" in data:
                rider = db.query(Rider).filter_by(id=data["rider_id"]).first()
                if not rider:
                    return {"error": "Rider not found"}, 404
                delivery.rider_id = rider.id

            if "current_location" in data:
                delivery.current_location = data["current_location"]

            db.commit()

            # Get rider info for response
            rider_info = None
            if delivery.rider_id:
                rider = db.query(Rider).filter_by(id=delivery.rider_id).first()
                if rider:
                    rider_info = {
                        "id": rider.id,
                        "name": rider.name,
                        "phone_number": rider.phone_number,
                        "user_id": rider.user_id
                    }

            return {
                "message": "Delivery updated successfully",
                "delivery": {
                    "id": delivery.id,
                    "status": delivery.status,
                    "rider_id": delivery.rider_id,
                    "rider": rider_info,
                    "user_id": delivery.user_id
                }
            }, 200

        finally:
            db.close()

    @token_required
    @admin_required
    def get(self, current_user, delivery_id):
        """
        Get delivery details
        """
        db = SessionLocal()
        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404

            rider_info = None
            if delivery.rider_id:
                rider = db.query(Rider).filter_by(id=delivery.rider_id).first()
                if rider:
                    rider_info = {
                        "id": rider.id,
                        "name": rider.name,
                        "phone_number": rider.phone_number,
                        "user_id": rider.user_id
                    }

            return {
                "delivery": {
                    "id": delivery.id,
                    "user_id": delivery.user_id,
                    "status": delivery.status,
                    "distance": delivery.distance,
                    "weight": delivery.weight,
                    "size": delivery.size,
                    "total_price": delivery.total_price,
                    "rider_id": delivery.rider_id,
                    "rider": rider_info,
                    "created_at": delivery.created_at.isoformat()
                }
            }, 200
        finally:
            db.close()
