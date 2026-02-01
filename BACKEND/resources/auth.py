from flask import request, jsonify
from flask_restful import Resource
from sqlalchemy.orm import Session
from models import User
from database import SessionLocal
from utils.security import hash_password, verify_password
from utils.jwt import create_token
import jwt

SECRET_KEY = "your_super_secret_key"


class Register(Resource):
    def post(self):
        session: Session = SessionLocal()
        data = request.json

        try:
            # check email
            if session.query(User).filter_by(email=data["email"]).first():
                return {"error": "Email already exists"}, 400

            user = User(
                name=data["name"],
                email=data["email"],
                phone_number=data.get("phone_number"),
                password=hash_password(data["password"]),
                role_id=data.get("role_id", 2)  # default customer
            )

            session.add(user)
            session.commit()
            session.refresh(user)

            return {
                "message": "User registered successfully",
                "user": {"id": user.id, "name": user.name, "email": user.email, "role_id": user.role_id}
            }, 201

        finally:
            session.close()


class Login(Resource):
    def post(self):
        session: Session = SessionLocal()
        data = request.json

        try:
            user = session.query(User).filter_by(email=data["email"]).first()

            if not user or not verify_password(data["password"], user.password):
                return {"error": "Invalid credentials"}, 401

            token = create_token(user.id, user.role_id)
            return {"token": token}, 200

        finally:
            session.close()
