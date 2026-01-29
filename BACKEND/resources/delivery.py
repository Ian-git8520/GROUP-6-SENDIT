from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_delivery, get_all_deliveries
from pricing import calculate_price
from models import PriceIndex


class DeliveryListResource(Resource):

    def get(self):
        db = SessionLocal()
        deliveries = get_all_deliveries(db)
        return [
            {
                "id": d.id,
                "status": d.status,
                "total_price": d.total_price
            }
            for d in deliveries
        ]

    def post(self):
        data = request.get_json()

        if not data:
            return {"error": "JSON body required"}, 400

        required_fields = [
            "user_id",
            "distance",
            "weight",
            "size",
            "pickup_location",
            "drop_off_location"
        ]

        for field in required_fields:
            if field not in data:
                return {"error": f"{field} is required"}, 400

        db = SessionLocal()

        # Get price index
        price_index = db.query(PriceIndex).first()
        if not price_index:
            return {"error": "Price index not found"}, 500

        # Calculate total price
        total_price = calculate_price(
            distance=float(data["distance"]),
            weight=float(data["weight"]),
            size=float(data["size"]),
            price_index=price_index
        )

        # Create delivery (NO total_price here)
        delivery = create_delivery(
            db=db,
            user_id=data["user_id"],
            price_index_id=price_index.id,
            distance=data["distance"],
            weight=data["weight"],
            size=data["size"],
            pickup_location=data["pickup_location"],
            drop_off_location=data["drop_off_location"]
        )

        # Set price AFTER creation
        delivery.total_price = total_price
        db.commit()
        db.refresh(delivery)

        return {
            "delivery_id": delivery.id,
            "total_price": delivery.total_price,
            "status": delivery.status
        }, 201
