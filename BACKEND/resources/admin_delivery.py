from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Delivery, Rider, User
from utils.auth import token_required, admin_required
from email_service import send_delivery_status_email
from datetime import datetime


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

            old_status = delivery.status
            new_status = None

            # Update status
            if "status" in data:
                new_status = data["status"]
                delivery.status = new_status
                delivery.updated_at = datetime.now()
                
                # If status is approved/accepted, ensure rider is assigned
                if new_status == "accepted" and not delivery.rider_id:
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

            # Send email notification to user if status changed
            if new_status and old_status != new_status:
                self._send_status_notification(db, delivery, old_status, new_status)

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

            user = db.query(User).filter_by(id=delivery.user_id).first()
            user_name = user.name if user else None

            return {
                "message": "Delivery updated successfully",
                "delivery": {
                    "id": delivery.id,
                    "order_name": delivery.order_name,
                    "status": delivery.status,
                    "rider_id": delivery.rider_id,
                    "rider": rider_info,
                    "user_id": delivery.user_id,
                    "user_name": user_name
                }
            }, 200

        finally:
            db.close()

    def _send_status_notification(self, db, delivery, old_status, new_status):
        """Send real-time email notification when admin changes delivery status"""
        try:
            user = db.query(User).filter_by(id=delivery.user_id).first()
            if not user:
                return

            status_messages = {
                "pending": "Your order is pending",
                "accepted": "Your order has been accepted and assigned to a driver",
                "in_transit": "Your order is on the way",
                "delivered": "Your order has been delivered",
                "cancelled": "Your order has been cancelled"
            }

            # use the shared email helper for consistent HTML emails and real-world timestamp
            send_delivery_status_email(user.email, delivery.id, old_status, new_status, customer_name=user.name)
            print(f"[EMAIL] Status notification sent to {user.email} for delivery {delivery.id}: {old_status} → {new_status}")
        except Exception as e:
            print(f"[ERROR] Failed to send status notification email: {str(e)}")

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

            user = db.query(User).filter_by(id=delivery.user_id).first()
            user_name = user.name if user else None

            return {
                "delivery": {
                    "id": delivery.id,
                    "order_name": delivery.order_name,
                    "user_id": delivery.user_id,
                    "user_name": user_name,
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
