from flask import request
from flask_restful import Resource
from werkzeug.security import check_password_hash
from database import SessionLocal
from models import User
import datetime
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        db = SessionLocal()
        user = db.query(User).filter(User.email == email).first()

        if not user or not check_password_hash(user.password, password):
            return {"error": "Invalid credentials"}, 401


        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role.name
            }
        }, 200
