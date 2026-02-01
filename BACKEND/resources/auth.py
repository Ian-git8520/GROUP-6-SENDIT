from flask import request, jsonify
from flask_restful import Resource
from sqlalchemy.orm import Session
from models import User
from database import SessionLocal
from utils.security import hash_password, verify_password
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your_super_secret_key"

class Register(Resource):
    def post(self):
        session: Session = SessionLocal()
        data = request.json

        if session.query(User).filter_by(email=data["email"]).first():
            session.close()
            return {"error": "Email already exists"}, 400

        user = User(
            name=data["name"],
            email=data["email"],
            phone_number=data.get("phone_number"),
            password=hash_password(data["password"]),
            role_id=data.get("role_id", 2)  # default role: customer
        )

        session.add(user)
        session.commit()
        session.close()

        return {"message": "User registered successfully"}, 201


class Login(Resource):
    def post(self):
        session: Session = SessionLocal()
        data = request.json
        user = session.query(User).filter_by(email=data["email"]).first()

        if not user or not verify_password(data["password"], user.password):
            session.close()
            return {"error": "Invalid credentials"}, 401

        payload = {
            "user_id": user.id,
            "role_id": user.role_id,
            "exp": datetime.utcnow() + timedelta(hours=12)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        session.close()
        return {"token": token}, 200
