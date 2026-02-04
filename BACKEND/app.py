from flask import Flask
from flask_restful import Api
from database import init_db
from flask_cors import CORS

from resources.user import UserListResource, UserResource
from resources.delivery import DeliveryListResource
from resources.profile import Profile
from resources.auth import Register, Login
from resources.admin_delivery import AdminDeliveryResource
from resources.rider import RiderListResource, DriverProfileResource, DriverDeliveryResource
from resources.track_delivery import TrackDeliveryResource





app = Flask(__name__)
CORS(app)
api = Api(app)


init_db()



api.add_resource(Register, "/auth/register", strict_slashes=False)
api.add_resource(Login, "/auth/login", strict_slashes=False)


api.add_resource(UserListResource, "/users", strict_slashes=False)
api.add_resource(UserResource, "/users/<int:user_id>", strict_slashes=False)


api.add_resource(DeliveryListResource, "/deliveries", strict_slashes=False)

# for the current logged-in user
api.add_resource(Profile, "/profile", strict_slashes=False)

api.add_resource(
    AdminDeliveryResource,
    "/admin/deliveries/<int:delivery_id>"
)

api.add_resource(RiderListResource, "/riders", strict_slashes=False)
api.add_resource(DriverProfileResource, "/driver/profile", strict_slashes=False)
api.add_resource(DriverDeliveryResource, "/driver/deliveries/<int:delivery_id>", strict_slashes=False)

api.add_resource(
    TrackDeliveryResource,
    "/deliveries/<int:delivery_id>/track"
)



if __name__ == "__main__":
    app.run(debug=True)
