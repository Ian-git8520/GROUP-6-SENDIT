from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import (
    create_user,
    create_user_role,
    get_all_users,
    get_user,
    get_user_by_email,
    get_user_role_by_name
)

class UserListResource(Resource):
    def get(self):
        db = SessionLocal()
        users = get_all_users(db)
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone_number": u.phone_number,
                "role_id": u.role_id
            }
            for u in users
        ]

    def post(self):
        data = request.json or {}
        db = SessionLocal()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        phone_number = data.get("phone_number")

        if not name or not email or not password:
            return {"error": "name, email, and password are required"}, 400

        existing = get_user_by_email(db, email)
        if existing:
            return {"error": "Email already registered"}, 409

        role_name = data.get("role") or data.get("role_name") or "customer"
        if role_name == "user":
            role_name = "customer"

        role = get_user_role_by_name(db, role_name)
        if not role:
            role = create_user_role(db, role_name)

        user = create_user(
            db,
            name=name,
            email=email,
            password=password,
            phone_number=phone_number,
            role_id=role.id
        )

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone_number,
            "role": role.name
        }, 201


class UserResource(Resource):
    def get(self, user_id):
        db = SessionLocal()
        user = get_user(db, user_id)
        if not user:
            return {"error": "User not found"}, 404
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }


class UserLoginResource(Resource):
    def post(self):
        data = request.json or {}
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {"error": "email and password are required"}, 400

        db = SessionLocal()
        user = get_user_by_email(db, email)

        if not user or user.password != password:
            return {"error": "Invalid credentials"}, 401

        role_name = user.role.name if user.role else None

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone_number,
            "role": role_name
        }
