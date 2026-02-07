from functools import wraps
from flask import request
import jwt
import datetime
from database import SessionLocal
from models import User
from config import SECRET_KEY

def create_token(user_id: int, role_id: int):
    payload = {
        "user_id": user_id,
        "role_id": role_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def extract_token():
    # Check header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]

    # Fallback: check cookie
    token = request.cookies.get("jwt")
    if token:
        return token

    return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_token()
        if not token:
            return {"error": "Token missing"}, 401

        payload = decode_token(token)
        if not payload:
            return {"error": "Invalid or expired token"}, 401

        session = SessionLocal()
        user = session.query(User).filter_by(id=payload["user_id"]).first()
        session.close()

        if not user:
            return {"error": "User not found"}, 404

        return f(current_user=user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = kwargs.get("current_user")
        if not current_user:
            return {"error": "Authentication required"}, 401
        if current_user.role_id != 1:
            return {"error": "Admin access required"}, 403
        return f(*args, **kwargs)
    return decorated
