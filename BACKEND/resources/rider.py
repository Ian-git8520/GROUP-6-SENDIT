from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Rider, User, Delivery
from utils.auth import token_required, admin_required


# ======================================
# RIDER LIST (ADMIN)
# ======================================
class RiderListResource(Resource):

    @token_required
    @admin_required
    def post(self, current_user):
        data = request.get_json()
        if not data:
            return {"error": "JSON body required"}, 400

        if "name" not in data or "phone_number" not in data:
            return {"error": "name and phone_number are required"}, 400

        db = SessionLocal()
        try:
            rider = Rider(
                name=data["name"],
                phone_number=data["phone_number"],
            )
            db.add(rider)
            db.commit()
            db.refresh(rider)

            return {
                "message": "Rider created",
                "rider": {
                    "id": rider.id,
                    "name": rider.name,
                    "phone_number": rider.phone_number,
                }
            }, 201
        finally:
            db.close()

    @token_required
    def get(self, current_user):
        db = SessionLocal()
        try:
            riders = db.query(Rider).all()
            return [
                {
                    "id": r.id,
                    "name": r.name,
                    "phone_number": r.phone_number,
                    "user_id": r.user_id,
                    "email": r.user.email if r.user else None
                } for r in riders
            ], 200
        finally:
            db.close()


# ======================================
# DRIVER PROFILE
# ======================================
class DriverProfileResource(Resource):

    @token_required
    def get(self, current_user):
        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        db = SessionLocal()
        try:
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()

            if not rider:
                return {"error": "Driver profile not found. Contact admin."}, 404

            return {
                "driver": {
                    "id": rider.id,
                    "name": rider.name,
                    "phone_number": rider.phone_number,
                    "user_id": rider.user_id,
                    "email": current_user.email
                }
            }, 200
        finally:
            db.close()

    @token_required
    def patch(self, current_user):
        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        data = request.get_json()
        db = SessionLocal()
        try:
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()

            if not rider:
                return {"error": "Driver profile not found"}, 404

            if "phone_number" in data:
                rider.phone_number = data["phone_number"]
                current_user.phone_number = data["phone_number"]

            if "name" in data:
                rider.name = data["name"]
                current_user.name = data["name"]

            db.commit()

            return {
                "message": "Profile updated successfully",
                "driver": {
                    "id": rider.id,
                    "name": rider.name,
                    "phone_number": rider.phone_number,
                    "email": current_user.email
                }
            }, 200
        finally:
            db.close()


# ======================================
# DRIVER DELIVERY LIST
# ======================================
class DriverDeliveryListResource(Resource):

    @token_required
    def get(self, current_user):

        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        db = SessionLocal()
        try:
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()

            if not rider:
                return {"error": "Rider record not found. Contact admin."}, 404

            deliveries = db.query(Delivery).filter_by(rider_id=rider.id).all()

            return [
                {
                    "id": d.id,
                    "pickup_location": d.pickup_location,
                    "drop_off_location": d.drop_off_location,
                    "weight": d.weight,
                    "status": d.status,
                    "distance": d.distance,
                    "size": d.size,
                    "total_price": d.total_price,
                    "order_name": d.order_name,
                    "user_id": d.user_id,
                    "rider_id": d.rider_id,
                    "created_at": d.created_at.isoformat() if d.created_at else None
                }
                for d in deliveries
            ], 200

        except Exception as e:
            print(f"[ERROR] Driver deliveries fetch error: {str(e)}")
            return {"error": "Failed to fetch deliveries"}, 500
        finally:
            db.close()


# ======================================
# DRIVER UPDATE DELIVERY STATUS
# ======================================
class DriverDeliveryResource(Resource):

    @token_required
    def patch(self, current_user, delivery_id):

        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        data = request.get_json()
        db = SessionLocal()

        try:
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()
            if not rider:
                return {"error": "Rider record not found"}, 404

            delivery = db.query(Delivery).filter_by(
                id=delivery_id,
                rider_id=rider.id
            ).first()

            if not delivery:
                return {"error": "Delivery not found or not assigned to you"}, 404

            if "status" in data:
                new_status = data["status"]

                if new_status not in ["in_transit", "delivered"]:
                    return {
                        "error": "Drivers can only set status to in_transit or delivered"
                    }, 400

                delivery.status = new_status

            db.commit()

            return {
                "message": "Delivery status updated successfully",
                "delivery": {
                    "id": delivery.id,
                    "status": delivery.status
                }
            }, 200

        except Exception as e:
            print(f"[ERROR] Driver delivery update error: {str(e)}")
            return {"error": "Failed to update delivery"}, 500
        finally:
            db.close()
