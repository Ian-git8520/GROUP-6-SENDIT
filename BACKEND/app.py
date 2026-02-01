from flask import Flask
from flask_restful import Api
from database import init_db
from resources.user import UserListResource, UserResource, UserLoginResource
from resources.rider import RiderListResource
from resources.delivery import DeliveryListResource, DeliveryResource
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

init_db()

api.add_resource(UserListResource, "/users")
api.add_resource(UserResource, "/users/<int:user_id>")
api.add_resource(UserLoginResource, "/users/login")
api.add_resource(DeliveryListResource, "/deliveries")
api.add_resource(DeliveryResource, "/deliveries/<int:delivery_id>")
api.add_resource(RiderListResource, "/riders")

if __name__ == "__main__":
    app.run(debug=True)
