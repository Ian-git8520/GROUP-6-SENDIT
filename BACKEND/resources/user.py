from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_user, get_user, get_all_users

# Optional: import JWT utilities if you want to protect endpoints
# from utils.jwt import decode_token
# from flask import request

class UserListResource(Resource):
    def get(self):
        db = SessionLocal()
        try:
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
        finally:
            db.close()

    def post(self):
        data = request.json
        db = SessionLocal()
        try:
            # ensure required fields exist
            required_fields = ["name", "email", "password", "role_id"]
            if not all(f in data for f in required_fields):
                return {"error": "Missing required fields"}, 400

            user = create_user(db, **data)
            return {"id": user.id, "message": "User created"}, 201
        finally:
            db.close()


class UserResource(Resource):
    def get(self, user_id):
        db = SessionLocal()
        try:
            user = get_user(db, user_id)
            if not user:
                return {"error": "User not found"}, 404
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone_number": user.phone_number,
                "role_id": user.role_id
            }
        finally:
            db.close()
