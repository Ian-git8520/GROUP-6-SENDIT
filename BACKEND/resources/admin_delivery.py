from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Delivery
from utils.auth import token_required

class AdminDeliveryResource(Resource):

    @token_required
    def patch(self, current_user, delivery_id):
        if current_user.role_id != 1:
            return {"error": "Admin access required"}, 403

        db = SessionLocal()
        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404

            data = request.get_json()
            delivery.status = data.get("status", delivery.status)
            db.commit()
            return delivery.to_dict(), 200
        finally:
            db.close()
