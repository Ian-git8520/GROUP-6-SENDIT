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
        data = request.json
        db = SessionLocal()

        price_index = db.query(PriceIndex).first()

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
            pickup_location=data["pickup_location"],
            drop_off_location=data["drop_off_location"]
        )

        delivery.total_price = price
        db.commit()

        return {
            "delivery_id": delivery.id,
            "price": price
        }, 201