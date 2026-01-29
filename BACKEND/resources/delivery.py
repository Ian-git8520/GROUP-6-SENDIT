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
        db.close()
        return [
            {"id": d.id, "status": d.status, "total_price": d.total_price}
            for d in deliveries
        ]

    def post(self):
        data = request.get_json()
        if not data:
            return {"error": "JSON body required"}, 400

        required_fields = ["user_id","distance","weight","size","pickup_location","drop_off_location"]
        for f in required_fields:
            if f not in data:
                return {"error": f"{f} is required"}, 400

        db = SessionLocal()
        price_index = db.query(PriceIndex).first()
        if not price_index:
            db.close()
            return {"error": "Price index not found"}, 500

        # Calculate total price
        total_price = calculate_price(
            distance=float(data["distance"]),
            weight=float(data["weight"]),
            size=float(data["size"]),
            price_index=price_index
        )

        # Create delivery including total_price
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

        db.commit()
        db.refresh(delivery)
        db.close()

        return {
            "delivery_id": delivery.id,
            "total_price": delivery.total_price,
            "status": delivery.status
        }, 201
