from flask_restful import Resource
from database import db
from ..models.user import User
from ..utils.auth import token_required


class UserListResource(Resource):
    @token_required
    def get(current_user, self):
        users = User.query.all()
        return [user.to_dict() for user in users], 200


class UserResource(Resource):
    @token_required
    def get(current_user, self, user_id):
        user = User.query.get_or_404(user_id)
        return user.to_dict(), 200
