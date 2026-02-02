from functools import wraps
from flask import request
import jwt
import datetime
from database import SessionLocal
from models import User
from config import SECRET_KEY





def create_token(user_id: int, role_id: int):
    """
    Create a JWT token for a user with 12h expiration
    """
    payload = {
        "user_id": user_id,
        "role_id": role_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str):
    """
    Decode a JWT token, return payload or None if invalid/expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def extract_token():
    """
    Helper to get token from Authorization header
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None, {"error": "Token missing"}, 401

    if auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1], None, None
    else:
        return auth_header, None, None  # fallback if user sends raw token


def token_required(f):
    """
    Protect route with JWT token
    Injects current_user as first argument
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token, error_response, status_code = extract_token()
        if error_response:
            return error_response, status_code

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
    """
    Protect route for admin users only
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token, error_response, status_code = extract_token()
        if error_response:
            return error_response, status_code

        payload = decode_token(token)
        if not payload:
            return {"error": "Invalid or expired token"}, 401

        session = SessionLocal()
        user = session.query(User).filter_by(id=payload["user_id"]).first()
        session.close()

        if not user or user.role_id != 1:
            return {"error": "Admin access required"}, 403

        return f(current_user=user, *args, **kwargs)

    return decorated
