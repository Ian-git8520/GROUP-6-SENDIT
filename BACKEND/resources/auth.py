from flask import request, make_response
from flask_restful import Resource
from database import SessionLocal
from models import User
from utils.auth import create_token
from utils.security import hash_password, verify_password

class Register(Resource):
    def post(self):
        session = SessionLocal()
        data = request.json
        try:
            if session.query(User).filter_by(email=data["email"]).first():
                return {"error": "Email already exists"}, 400

            user = User(
                name=data["name"],
                email=data["email"],
                phone_number=data.get("phone_number"),
                password=hash_password(data["password"]),
                role_id=data.get("role_id", 2)
            )

            session.add(user)
            session.commit()
            session.refresh(user)

            return {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role_id": user.role_id
                }
            }, 201
        finally:
            session.close()

class Login(Resource):
    def post(self):
        session = SessionLocal()
        data = request.json
        try:
            user = session.query(User).filter_by(email=data["email"]).first()
            if not user or not verify_password(data["password"], user.password):
                return {"error": "Invalid credentials"}, 401

            token = create_token(user.id, user.role_id)

            # Create response with token in JSON
            response = make_response({
                "message": "Login successful",
                "token": token,
                "id": user.id,
                "email": user.email,
                "role_id": user.role_id
            })
            # Also set JWT in HttpOnly cookie as backup
            response.set_cookie(
                "jwt", token,
                httponly=True,
                samesite="Lax",
                secure=False,    # True if using HTTPS
                path="/",
                max_age=12*3600  # 12 hours
            )
            return response
        finally:
            session.close()

class Logout(Resource):
    def post(self):
        response = make_response({"message": "Logged out"})
        response.delete_cookie("jwt", path="/")
        return response, 200
