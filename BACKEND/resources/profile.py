from flask import request, jsonify
from flask_restful import Resource
from sqlalchemy.orm import Session
from models import User
from database import SessionLocal
from utils.security import hash_password
import jwt

SECRET_KEY = "your_super_secret_key"

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None

class Profile(Resource):
    def get(self):
        token = request.headers.get("Authorization")
        if not token:
            return {"error": "Token missing"}, 401
        payload = decode_token(token)
        if not payload:
            return {"error": "Invalid or expired token"}, 401

        session: Session = SessionLocal()
        user = session.query(User).filter_by(id=payload["user_id"]).first()
        session.close()

        if not user:
            return {"error": "User not found"}, 404

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone_number": user.phone_number,
            "role_id": user.role_id
        }, 200

    def patch(self):
        token = request.headers.get("Authorization")
        if not token:
            return {"error": "Token missing"}, 401
        payload = decode_token(token)
        if not payload:
            return {"error": "Invalid or expired token"}, 401

        data = request.json
        session: Session = SessionLocal()
        user = session.query(User).filter_by(id=payload["user_id"]).first()
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
