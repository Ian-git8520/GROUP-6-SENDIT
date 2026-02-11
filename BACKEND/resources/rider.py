from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Rider, User, Delivery
from utils.auth import token_required, admin_required


class RiderListResource(Resource):

    @token_required
    @admin_required
    def post(self, current_user):
        """
        Admin creates a rider (legacy - now drivers are Users with role_id=3)
        """
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
        """
        Get all available riders/drivers
        """
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


class DriverProfileResource(Resource):
    """
    Handle driver profile operations
    """

    @token_required
    def get(self, current_user):
        """
        Get current driver profile (user must be a driver)
        """
        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        db = SessionLocal()
        try:
            # Check if driver already has a rider record linked to their user
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()
            
            if not rider:
                # Create rider record for this driver user
                rider = Rider(
                    user_id=current_user.id,
                    name=current_user.name,
                    phone_number=current_user.phone_number
                )
                db.add(rider)
                db.commit()
                db.refresh(rider)

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
        """
        Update driver profile (phone number, name)
        """
        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        data = request.get_json()
        db = SessionLocal()
        try:
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()
            
            if not rider:
                rider = Rider(
                    user_id=current_user.id,
                    name=current_user.name,
                    phone_number=current_user.phone_number
                )
                db.add(rider)
                db.commit()
                db.refresh(rider)

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


class DriverDeliveryListResource(Resource):
    """
    Get all deliveries assigned to the current driver
    """

    @token_required
    def get(self, current_user):
        """
        Get all deliveries assigned to the logged-in driver
        """
        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        db = SessionLocal()
        try:
            # Get the rider record for this driver
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()
            
            if not rider:
                # Create rider record if it doesn't exist
                rider = Rider(
                    user_id=current_user.id,
                    name=current_user.name,
                    phone_number=current_user.phone_number
                )
                db.add(rider)
                db.commit()
                db.refresh(rider)
                return [], 200

            # Get all deliveries assigned to this rider
            deliveries = db.query(Delivery).filter_by(rider_id=rider.id).all()
            
            return [
                {
                    "id": d.id,
                    "pickup_location": d.pickup_location,
                    "destination": d.drop_off_location,
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
            return {"error": f"Failed to fetch deliveries: {str(e)}"}, 500
        finally:
            db.close()


class DriverDeliveryResource(Resource):
    """
    Allow drivers to update the status of their assigned deliveries
    """

    @token_required
    def patch(self, current_user, delivery_id):
        """
        Driver updates their own delivery status
        Can only update: in_transit, delivered
        """
        if current_user.role_id != 3:
            return {"error": "Only drivers can access this resource"}, 403

        data = request.get_json()
        db = SessionLocal()
        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404

            # Check if this delivery is assigned to the current driver
            rider = db.query(Rider).filter_by(user_id=current_user.id).first()
            if not rider or delivery.rider_id != rider.id:
                return {"error": "You are not assigned to this delivery"}, 403

            # Update status
            if "status" in data:
                new_status = data["status"]
                # Only allow drivers to update to in_transit or delivered
                if new_status not in ["in_transit", "delivered"]:
                    return {"error": "Invalid status. Drivers can only set status to in_transit or delivered"}, 400
                
                delivery.status = new_status

            db.commit()

            return {
                "message": "Delivery status updated successfully",
                "delivery": {
                    "id": delivery.id,
                    "status": delivery.status,
                    "rider_id": delivery.rider_id
                }
            }, 200

        except Exception as e:
            print(f"[ERROR] Driver delivery update error: {str(e)}")
            return {"error": f"Failed to update delivery: {str(e)}"}, 500
        finally:
            db.close()
