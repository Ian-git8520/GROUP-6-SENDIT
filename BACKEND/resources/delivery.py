from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_delivery, get_all_deliveries, delete_delivery, get_delivery, get_rider
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
                "total_price": d.total_price,
                "distance": d.distance,
                "weight": d.weight,
                "size": d.size,
                "item_type": d.item_type,
                "pickup_location": d.pickup_location,
                "drop_off_location": d.drop_off_location,
                "pickup_latitude": d.pickup_latitude,
                "pickup_longitude": d.pickup_longitude,
                "destination_latitude": d.destination_latitude,
                "destination_longitude": d.destination_longitude,
                "user_id": d.user_id,
                "rider": {
                    "id": d.rider.id,
                    "name": d.rider.name,
                    "phone_number": d.rider.phone_number
                } if d.rider else None,
                "created_at": d.created_at.isoformat() if d.created_at else None
            }
            for d in deliveries
        ]

    def post(self):
        data = request.json
        db = SessionLocal()

        price_index = db.query(PriceIndex).first()
        if not price_index:
            return {"error": "Price index not configured. Run seed.py to initialize pricing."}, 500

        price = calculate_price(
            data["distance"],
            data["weight"],
            data["size"],
            price_index
        )

        delivery = create_delivery(
            db=db,
            user_id=data["user_id"],
            price_index_id=price_index.id,
            distance=data["distance"],
            weight=data["weight"],
            size=data["size"],
            item_type=data.get("item_type"),
            pickup_location=data["pickup_location"],
            drop_off_location=data["drop_off_location"],
            pickup_latitude=data.get("pickup_latitude"),
            pickup_longitude=data.get("pickup_longitude"),
            destination_latitude=data.get("destination_latitude"),
            destination_longitude=data.get("destination_longitude"),
            total_price=price
        )

        return {
            "delivery_id": delivery.id,
            "price": price
        }, 201


class DeliveryResource(Resource):
    def patch(self, delivery_id: int):
        data = request.json or {}
        db = SessionLocal()

        delivery = get_delivery(db, delivery_id)
        if not delivery:
            return {"error": "Delivery not found"}, 404

        rider_id = data.get("rider_id")
        status = data.get("status")

        if rider_id is not None:
            rider = get_rider(db, rider_id)
            if not rider:
                return {"error": "Rider not found"}, 404
            delivery.rider_id = rider.id

        if status is not None:
            delivery.status = status

        db.commit()
        db.refresh(delivery)

        return {
            "id": delivery.id,
            "status": delivery.status,
            "rider": {
                "id": delivery.rider.id,
                "name": delivery.rider.name,
                "phone_number": delivery.rider.phone_number
            } if delivery.rider else None
        }, 200

    def delete(self, delivery_id: int):
        db = SessionLocal()
        deleted = delete_delivery(db, delivery_id)
        if not deleted:
            return {"error": "Delivery not found"}, 404
        return {"message": "Delivery deleted"}, 200

