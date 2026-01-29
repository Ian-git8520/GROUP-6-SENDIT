from flask import Flask
from flask_restful import Api
from database import init_db
from resources.user import UserListResource, UserResource
from resources.delivery import DeliveryListResource

app = Flask(__name__)
api = Api(app)

init_db()

api.add_resource(UserListResource, "/users", strict_slashes=False)
api.add_resource(UserResource, "/users/<int:user_id>", strict_slashes=False)
api.add_resource(DeliveryListResource, "/deliveries", strict_slashes=False)


if __name__ == "__main__":
    app.run(debug=True)
