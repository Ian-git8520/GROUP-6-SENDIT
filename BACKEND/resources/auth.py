from flask import request, make_response
from flask_restful import Resource
from database import SessionLocal
from models import User, Rider
from utils.auth import create_token
from utils.security import hash_password, verify_password
from datetime import timedelta

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

            # If driver (role_id=3), create rider record automatically
            if user.role_id == 3:
                try:
                    rider = Rider(
                        user_id=user.id,
                        name=user.name,
                        phone_number=user.phone_number
                    )
                    session.add(rider)
                    session.commit()
                except Exception as rider_error:
                    print(f"[ERROR] Failed to create rider: {str(rider_error)}")
                    session.rollback()

            return {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role_id": user.role_id
                }
            }, 201
        except Exception as e:
            print(f"[ERROR] Registration failed: {str(e)}")
            session.rollback()
            return {"error": f"Registration failed: {str(e)}"}, 500
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
            
            # Map role_id to role name
            role_map = {1: "admin", 2: "customer", 3: "rider"}
            
            response = make_response({
                "message": "Login successful",
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "role": role_map.get(user.role_id, "user"),
                    "role_id": user.role_id
                }
            }, 200)
            
            # Set HTTP-only cookie with the token (max_age in seconds: 7 days = 604800 seconds)
            response.set_cookie(
                'jwt',
                value=token,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                max_age=604800  # 7 days in seconds
            )
            
            return response
        finally:
            session.close()


class Logout(Resource):
    def post(self):
        response = make_response({"message": "Logged out successfully"}, 200)
        response.set_cookie('jwt', '', expires=0, httponly=True, samesite='Lax')
        return response
