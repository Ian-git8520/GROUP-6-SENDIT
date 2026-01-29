from functools import wraps
from flask import request, jsonify
from database import SessionLocal
from models import User

def get_current_user():
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None

    session = SessionLocal()
    user = session.query(User).get(int(user_id))
    session.close()

    return user
