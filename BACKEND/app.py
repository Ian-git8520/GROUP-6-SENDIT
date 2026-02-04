from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from database import init_db

from resources.user import UserListResource, UserResource
from resources.delivery import DeliveryListResource, DeliveryResource
from resources.profile import Profile
from resources.auth import Register, Login
from resources.admin_delivery import AdminDeliveryResource
from resources.rider import RiderListResource
from resources.track_delivery import TrackDeliveryResource

app = Flask(__name__)

# 🔥 Allow ALL routes from frontend origin
CORS(app, supports_credentials=True)

api = Api(app)

init_db()

# Auth routes
api.add_resource(Register, "/register")
api.add_resource(Login, "/login")

# User routes
api.add_resource(UserListResource, "/users")
api.add_resource(UserResource, "/users/<int:user_id>")
api.add_resource(Profile, "/profile")

# Delivery routes
api.add_resource(DeliveryListResource, "/deliveries")
api.add_resource(DeliveryResource, "/deliveries/<int:delivery_id>")
api.add_resource(AdminDeliveryResource, "/admin/deliveries/<int:delivery_id>")
api.add_resource(RiderListResource, "/riders")
api.add_resource(TrackDeliveryResource, "/deliveries/<int:delivery_id>/track")

if __name__ == "__main__":
    app.run(debug=True)
