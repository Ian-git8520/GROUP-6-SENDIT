from flask import request
from flask_restful import Resource
from database import db
from models.delivery import Delivery
from utils.auth import token_required
from pricing import calculate_price


class DeliveryListResource(Resource):
    @token_required
    def post(current_user, self):
        data = request.get_json()

        total_price = calculate_price(
            float(data["distance"]),
            float(data["weight"]),
            float(data["size"])
        )

        new_delivery = Delivery(
            user_id=current_user.id,
            pickup_location=data["pickup_location"],
            drop_off_location=data["drop_off_location"],
            distance=float(data["distance"]),
            weight=float(data["weight"]),
            size=float(data["size"]),
            total_price=total_price,
            status="Pending"
        )

        db.session.add(new_delivery)
        db.session.commit()

        return {
            "message": "Delivery created successfully",
            "delivery_id": new_delivery.id,
            "total_price": total_price
        }, 201


class DeliveryResource(Resource):
    @token_required
    def get(current_user, self, delivery_id):
        delivery = Delivery.query.get_or_404(delivery_id)

        if delivery.user_id != current_user.id:
            return {"error": "Unauthorized access"}, 403

        return delivery.to_dict(), 200

    @token_required
    def delete(current_user, self, delivery_id):
        delivery = Delivery.query.get_or_404(delivery_id)

        if delivery.user_id != current_user.id:
            return {"error": "Unauthorized access"}, 403

        db.session.delete(delivery)
        db.session.commit()

        return {"message": "Delivery deleted successfully"}, 200
