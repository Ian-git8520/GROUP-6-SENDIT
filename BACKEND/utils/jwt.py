import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your_super_secret_key"

def create_token(user_id: int, role_id: int):
    payload = {
        "user_id": user_id,
        "role_id": role_id,
        "exp": datetime.utcnow() + timedelta(hours=12)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
