from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_user, get_user, get_all_users
from utils.auth import admin_required, token_required

class UserListResource(Resource):
    @token_required
    @admin_required
    def get(self, current_user):
        db = SessionLocal()
        users = get_all_users(db)
        result = [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone_number": u.phone_number,
                "role_id": u.role_id,
                "role_name": u.role.name if u.role else None
            } for u in users
        ]
        db.close()
        return result

    @token_required
    @admin_required
    def post(self, current_user):
        data = request.json
        db = SessionLocal()
        user = create_user(db, **data)
        db.close()
        return {"id": user.id, "message": "User created"}, 201


class UserResource(Resource):
    @token_required
    @admin_required
    def get(self, user_id, current_user):
        db = SessionLocal()
        user = get_user(db, user_id)
        if not user:
            db.close()
            return {"error": "User not found"}, 404
        result = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role_id": user.role_id,
            "role_name": user.role.name if user.role else None
        }
        db.close()
        return result
