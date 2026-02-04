from flask_restful import Resource
from utils.auth import token_required

class Profile(Resource):

    @token_required
    def get(self, current_user):
        return {
            "id": current_user.id,
            "email": current_user.email,
            "role_id": current_user.role_id
        }, 200
