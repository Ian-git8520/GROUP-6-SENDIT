from flask_restful import Resource
from database import SessionLocal
from models import Delivery
from utils.auth import token_required

class TrackDeliveryResource(Resource):

    @token_required
    def get(self, current_user, delivery_id):
        db = SessionLocal()
        try:
            delivery = db.query(Delivery).filter_by(id=delivery_id).first()
            if not delivery:
                return {"error": "Delivery not found"}, 404
            return {
                "id": delivery.id,
                "status": delivery.status,
                "pickup_location": delivery.pickup_location,
                "drop_off_location": delivery.drop_off_location,
                "created_at": delivery.created_at.isoformat()
            }, 200
        finally:
            db.close()
