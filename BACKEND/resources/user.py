from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import (
    create_user,
    get_all_users,
    get_user
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
        data = request.json
        db = SessionLocal()
        user = create_user(db, **data)
        return {"id": user.id, "message": "User created"}, 201


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
