from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import Rider
from utils.auth import token_required, admin_required


class RiderListResource(Resource):

    @token_required
    @admin_required
    def post(self, current_user):
        """
        the admin  creates a rider
        """
        data = request.get_json()
        if not data:
            return {"error": "JSON body required"}, 400

        if "name" not in data or "phone_number" not in data:
            return {"error": "name and phone_number are required"}, 400

        db = SessionLocal()
        try:
            rider = Rider(
                name=data["name"],
                phone_number=data["phone_number"],
                status=data.get("status", "available")
            )
            db.add(rider)
            db.commit()
            db.refresh(rider)

            return {
                "message": "Rider created",
                "rider": {
                    "id": rider.id,
                    "name": rider.name,
                    "phone_number": rider.phone_number,
                    "status": rider.status
                }
            }, 201
        finally:
            db.close()
