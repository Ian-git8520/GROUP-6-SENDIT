from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Delivery, User
from utils.auth import token_required
from email_service import send_email
from datetime import datetime
import json


class UserDeliveryResource(Resource):
    """
    User-facing delivery operations: change destination and cancel orders
    """

    @token_required
    def put(self, current_user, delivery_id):
        """
        Allow user to update delivery destination or cancel order
        PUT /user/deliveries/<delivery_id>
        
        Payload:
        {
            "action": "change_destination" | "cancel",
            "new_destination": {...},  # for change_destination action
            "cancellation_reason": "..."  # for cancel action
        }
        """
        data = request.get_json()
        if not data:
            return {"error": "Request body required"}, 400

        action = data.get("action")
        if action not in ["change_destination", "cancel"]:
            return {"error": "Invalid action. Must be 'change_destination' or 'cancel'"}, 400

        db = SessionLocal()
        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404

            # Verify ownership: only user who created the order can modify it
            if delivery.user_id != current_user.id:
                return {"error": "Unauthorized: You can only modify your own deliveries"}, 403

            # Can only change destination or cancel if order is pending or accepted
            if delivery.status not in ["pending", "accepted"]:
                return {
                    "error": f"Cannot modify order with status '{delivery.status}'. Only pending or accepted orders can be modified."
                }, 400

            if action == "change_destination":
                return self._change_destination(db, delivery, data, current_user)
            elif action == "cancel":
                return self._cancel_delivery(db, delivery, data, current_user)

        except Exception as e:
            print(f"[ERROR] Error updating delivery: {str(e)}")
            return {"error": f"Server error: {str(e)}"}, 500
        finally:
            db.close()

    def _change_destination(self, db, delivery, data, current_user):
        """Change the delivery destination"""
        new_destination = data.get("new_destination")
        if not new_destination:
            return {"error": "new_destination is required"}, 400

        # Accept free-form strings. If a dict is provided, try to pick a readable field.
        if isinstance(new_destination, dict):
            for key in ("address", "formatted_address", "name", "label"):
                if key in new_destination:
                    new_destination = str(new_destination[key])
                    break
            else:
                new_destination = json.dumps(new_destination)

        # Store previous location before changing
        delivery.previous_drop_off_location = delivery.drop_off_location
        delivery.drop_off_location = str(new_destination)
        delivery.destination_changed_at = datetime.now()

        db.commit()

        # Send notification email to user
        try:
            subject = f"Delivery {delivery.id} - Destination Updated"
            message = f"""
<p>Dear {current_user.name},</p>
<p>Your delivery order (ID: {delivery.id}) destination has been successfully updated.</p>
<p><strong>New Destination:</strong> {new_destination}</p>
<p><strong>Updated At:</strong> {delivery.destination_changed_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
<p>Thank you for using SendIT!</p>
            """
            send_email(current_user.email, subject, message)
        except Exception as e:
            print(f"[ERROR] Failed to send notification email: {str(e)}")

        return {
            "message": "Destination updated successfully",
            "delivery": {
                "id": delivery.id,
                "new_destination": new_destination,
                "status": delivery.status,
                "destination_changed_at": delivery.destination_changed_at.isoformat()
            }
        }, 200

    def _cancel_delivery(self, db, delivery, data, current_user):
        """Cancel a delivery order"""
        cancellation_reason = data.get("cancellation_reason", "User requested cancellation")

        # Update delivery status and cancellation info
        delivery.status = "cancelled"
        delivery.canceled_by = f"user_{current_user.id}"
        delivery.canceled_at = datetime.now()
        delivery.cancellation_reason = cancellation_reason

        db.commit()

        # Send notification email to user
        try:
            subject = f"Delivery {delivery.id} - Cancellation Confirmed"
            message = f"""
<p>Dear {current_user.name},</p>
<p>Your delivery order (ID: {delivery.id}) has been successfully cancelled.</p>
<p><strong>Cancellation Reason:</strong> {cancellation_reason}</p>
<p><strong>Cancelled At:</strong> {delivery.canceled_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
<p>Refund (if applicable) will be processed within 3-5 business days.</p>
<p>Thank you for using SendIT!</p>
            """
            send_email(current_user.email, subject, message)
        except Exception as e:
            print(f"[ERROR] Failed to send cancellation email: {str(e)}")

        return {
            "message": "Delivery cancelled successfully",
            "delivery": {
                "id": delivery.id,
                "status": delivery.status,
                "canceled_at": delivery.canceled_at.isoformat(),
                "cancellation_reason": cancellation_reason
            }
        }, 200
