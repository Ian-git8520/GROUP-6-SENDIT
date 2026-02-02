from flask_restful import Resource
from flask import request
from database import SessionLocal
from models import User
from utils.security import hash_password
from utils.auth import token_required

class Profile(Resource):

    @token_required
    def get(self, current_user):
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone_number": current_user.phone_number,
            "role_id": current_user.role_id
        }, 200

    @token_required
    def patch(self, current_user):
        data = request.json
        session = SessionLocal()
        user = session.query(User).filter_by(id=current_user.id).first()

        if not user:
            session.close()
            return {"error": "User not found"}, 404

        if "name" in data:
            user.name = data["name"]
        if "phone_number" in data:
            user.phone_number = data["phone_number"]
        if "password" in data:
            user.password = hash_password(data["password"])

        session.commit()
        session.close()

        return {"message": "Profile updated successfully"}, 200
