from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_delivery, get_all_deliveries, get_deliveries_by_user
from models import PriceIndex, Delivery, Rider
from pricing import calculate_price
from utils.auth import token_required, admin_required
import json

class DeliveryListResource(Resource):

    @token_required
    def get(self, current_user):
        db = SessionLocal()
        try:
            if current_user.role_id == 1:  # Admin
                deliveries = get_all_deliveries(db)
            elif current_user.role_id == 3:  # Driver
                # Get deliveries assigned to this driver
                rider = db.query(Rider).filter_by(user_id=current_user.id).first()
                if rider:
                    deliveries = db.query(Delivery).filter_by(rider_id=rider.id).all()
                else:
                    deliveries = []
            else:  # Regular user
                deliveries = get_deliveries_by_user(db, current_user.id)

            return [
                {
                    "id": d.id,
                    "user_id": d.user_id,
                    "pickup_location": d.pickup_location if isinstance(d.pickup_location, dict) else json.loads(d.pickup_location),
                    "drop_off_location": d.drop_off_location if isinstance(d.drop_off_location, dict) else json.loads(d.drop_off_location),
                    "distance": d.distance,
                    "weight": d.weight,
                    "size": d.size,
                    "total_price": d.total_price,
                    "status": d.status,
                    "rider_id": d.rider_id,
                    "created_at": d.created_at.isoformat()
                } for d in deliveries
            ], 200
        except Exception as e:
            print(f"[ERROR] Error fetching deliveries: {str(e)}")
            return {"error": "Failed to fetch deliveries"}, 500
        finally:
            db.close()

    @token_required
    def post(self, current_user):
        try:
            data = request.get_json()
            if not data:
                return {"error": "JSON body required"}, 400

            # Assign user_id
            if current_user.role_id != 1:
                data["user_id"] = current_user.id
            elif "user_id" not in data:
                return {"error": "user_id is required for admin"}, 400

            # Check required fields
            required_fields = ["distance", "weight", "size", "pickup_location", "drop_off_location"]
            for f in required_fields:
                if f not in data:
                    return {"error": f"{f} is required"}, 400

            db = SessionLocal()
            try:
                price_index = db.query(PriceIndex).first()
                if not price_index:
                    return {"error": "Price index not found. Contact admin to configure pricing."}, 500

                # Calculate total price
                total_price = calculate_price(
                    distance=float(data["distance"]),
                    weight=float(data["weight"]),
                    size=float(data["size"]),
                    price_index=price_index
                )

                # Parse pickup/drop-off locations if they're strings
                pickup_location = data["pickup_location"]
                if isinstance(pickup_location, str):
                    pickup_location = json.loads(pickup_location)
                
                drop_off_location = data["drop_off_location"]
                if isinstance(drop_off_location, str):
                    drop_off_location = json.loads(drop_off_location)

                # Create delivery
                delivery = create_delivery(
                    db=db,
                    user_id=data["user_id"],
                    price_index_id=price_index.id,
                    distance=float(data["distance"]),
                    weight=float(data["weight"]),
                    size=float(data["size"]),
                    pickup_location=pickup_location,
                    drop_off_location=drop_off_location,
                    total_price=total_price
                )

                return {
                    "delivery_id": delivery.id,
                    "total_price": delivery.total_price,
                    "status": delivery.status
                }, 201
            finally:
                db.close()
        except ValueError as e:
            print(f"[ERROR] Value error: {str(e)}")
            return {"error": f"Invalid data format: {str(e)}"}, 400
        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON decode error: {str(e)}")
            return {"error": f"Invalid JSON in location data: {str(e)}"}, 400
        except Exception as e:
            print(f"[ERROR] Unexpected error creating delivery: {str(e)}")
            return {"error": f"Server error: {str(e)}"}, 500
