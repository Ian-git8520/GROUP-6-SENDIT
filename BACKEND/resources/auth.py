from flask import request
from flask_restful import Resource
from database import db
from models.user import User
import jwt
import datetime

SECRET_KEY = "super-secret-key-change-this"


class Register(Resource):
    def post(self):
        data = request.get_json()

        if User.query.filter_by(email=data["email"]).first():
            return {"error": "Email already exists"}, 400

        new_user = User(email=data["email"])
        new_user.set_password(data["password"])

        db.session.add(new_user)
        db.session.commit()

        return {"message": "User registered successfully"}, 201


class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data["email"]).first()

        if not user or not user.check_password(data["password"]):
            return {"error": "Invalid email or password"}, 401

        token = jwt.encode(
            {
                "user_id": user.id,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email
            }
        }, 200
