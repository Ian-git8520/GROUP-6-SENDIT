from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_delivery, get_all_deliveries, get_deliveries_by_user
from models import PriceIndex
from pricing import calculate_price
from utils.auth import token_required, admin_required

class DeliveryListResource(Resource):

    @token_required
    def get(self, current_user):
        db = SessionLocal()
        try:
            if current_user.role_id == 1: 
                deliveries = get_all_deliveries(db)
            else:
                deliveries = get_deliveries_by_user(db, current_user.id)

            return [
                {
                    "id": d.id,
                    "user_id": d.user_id,
                    "pickup_location": d.pickup_location,
                    "drop_off_location": d.drop_off_location,
                    "distance": d.distance,
                    "weight": d.weight,
                    "size": d.size,
                    "total_price": d.total_price,
                    "status": d.status
                } for d in deliveries
            ]
        finally:
            db.close()

    @token_required
    def post(self, current_user):
        data = request.get_json()
        if not data:
            return {"error": "JSON body required"}, 400

        # Assign user_id
        if current_user.role_id != 1:
            data["user_id"] = current_user.id
        elif "user_id" not in data:
            return {"error": "user_id is required for admin"}, 400

        required_fields = ["distance", "weight", "size", "pickup_location", "drop_off_location"]
        for f in required_fields:
            if f not in data:
                return {"error": f"{f} is required"}, 400

        db = SessionLocal()
        try:
            price_index = db.query(PriceIndex).first()
            if not price_index:
                return {"error": "Price index not found"}, 500

            total_price = calculate_price(
                distance=float(data["distance"]),
                weight=float(data["weight"]),
                size=float(data["size"]),
                price_index=price_index
            )

            delivery = create_delivery(
                db=db,
                user_id=data["user_id"],
                price_index_id=price_index.id,
                distance=float(data["distance"]),
                weight=float(data["weight"]),
                size=float(data["size"]),
                pickup_location=data["pickup_location"],
                drop_off_location=data["drop_off_location"],
                total_price=total_price
            )


            return {
                "delivery_id": delivery.id,
                "total_price": delivery.total_price,
                "status": delivery.status
            }, 201
        finally:
            db.close()

