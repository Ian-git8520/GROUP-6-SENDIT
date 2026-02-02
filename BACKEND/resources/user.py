from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_user, get_user, get_all_users
from utils.auth import admin_required

class UserListResource(Resource):
    @admin_required
    def get(self, current_user):
        db = SessionLocal()
        users = get_all_users(db)
        db.close()
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone_number": u.phone_number,
                "role_id": u.role_id
            } for u in users
        ]

    @admin_required
    def post(self, current_user):
        data = request.json
        db = SessionLocal()
        user = create_user(db, **data)
        db.close()
        return {"id": user.id, "message": "User created"}, 201


class UserResource(Resource):
    @admin_required
    def get(self, user_id, current_user):
        db = SessionLocal()
        user = get_user(db, user_id)
        db.close()
        if not user:
            return {"error": "User not found"}, 404
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
