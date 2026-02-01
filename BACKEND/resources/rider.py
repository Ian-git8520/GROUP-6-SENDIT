from flask_restful import Resource
from flask import request
from database import SessionLocal
from crud.crud import create_rider, get_all_riders


class RiderListResource(Resource):
    def get(self):
        db = SessionLocal()
        riders = get_all_riders(db)
        return [
            {
                "id": r.id,
                "name": r.name,
                "phone_number": r.phone_number,
            }
            for r in riders
        ]

    def post(self):
        data = request.json or {}
        name = data.get("name")
        phone_number = data.get("phone_number")

        if not name:
            return {"error": "name is required"}, 400

        db = SessionLocal()
        rider = create_rider(db, name=name, phone_number=phone_number)

        return {
            "id": rider.id,
            "name": rider.name,
            "phone_number": rider.phone_number,
        }, 201
