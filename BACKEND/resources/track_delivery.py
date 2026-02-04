from flask_restful import Resource
from database import SessionLocal
from models import Delivery
from utils.auth import token_required

class TrackDeliveryResource(Resource):

    @token_required
    def get(self, delivery_id, current_user):
        db = SessionLocal()
        delivery = db.query(Delivery).filter_by(id=delivery_id).first()
        db.close()

        if not delivery:
            return {"error": "Delivery not found"}, 404

        # user can only track own delivery
        if current_user.role_id != 1 and delivery.user_id != current_user.id:
            return {"error": "Access denied"}, 403

        return {
            "id": delivery.id,
            "status": delivery.status,
            "rider_id": delivery.rider_id,
            "total_price": delivery.total_price
        }, 200