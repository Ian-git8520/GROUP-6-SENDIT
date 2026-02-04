from flask_restful import Resource
from database import SessionLocal
from models import User
from utils.auth import token_required

class RiderListResource(Resource):

    @token_required
    def get(self, current_user):
        if current_user.role_id != 1:
            return {"error": "Admin access required"}, 403

        db = SessionLocal()
        try:
            riders = db.query(User).filter_by(role_id=3).all()
            return [{"id": r.id, "email": r.email} for r in riders], 200
        finally:
            db.close()
