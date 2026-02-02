import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "./Driver.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Reverse geocode function
const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || "Unknown location";
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Unknown location";
  }
};

const Route = ({ pickup, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!pickup || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      lineOptions: {
        styles: [{ color: "#38bdf8", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [pickup, destination, map]);

  return null;
};

const Driver = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];

    const enrichOrders = async () => {
      const updated = await Promise.all(
        storedOrders.map(async (order) => {
          const pickupAddress = await getAddressFromCoords(
            order.pickup.lat,
            order.pickup.lng
          );
          const destinationAddress = await getAddressFromCoords(
            order.destination.lat,
            order.destination.lng
          );

          return {
            ...order,
            pickup: { ...order.pickup, address: pickupAddress },
            destination: {
              ...order.destination,
              address: destinationAddress,
            },
          };
        })
      );

      setOrders(updated);
      localStorage.setItem("orders", JSON.stringify(updated));
    };

    enrichOrders();
  }, []);

  return (
    <div className="driver-container">
      <h2 className="driver-title">Driver Dashboard</h2>

      <div className="driver-layout">
        <div className="driver-orders">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${
                selectedOrder?.id === order.id ? "active" : ""
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <h3>{order.itemType}</h3>

              <p>
                <strong>Status:</strong>{" "}
                <span className="pending">{order.status}</span>
              </p>

              <p>
                <strong>Pickup:</strong> {order.pickup.address}
              </p>

              <p>
                <strong>Destination:</strong>{" "}
                {order.destination.address}
              </p>

              <p>
                <strong>Distance:</strong>{" "}
                {order.distance?.toFixed(2)} km
              </p>

              <p>
                <strong>Price:</strong> KES {order.price}
              </p>
            </div>
          ))}
        </div>

        <div className="driver-view">
          <div className="map-card">
            <MapContainer
              center={[-1.286389, 36.817223]}
              zoom={12}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selectedOrder && (
                <>
                  <Route
                    pickup={selectedOrder.pickup}
                    destination={selectedOrder.destination}
                  />

                  <Marker
                    position={[
                      selectedOrder.pickup.lat,
                      selectedOrder.pickup.lng,
                    ]}
                  >
                    <Popup>
                      Pickup: {selectedOrder.pickup.address}
                    </Popup>
                  </Marker>

                  <Marker
                    position={[
                      selectedOrder.destination.lat,
                      selectedOrder.destination.lng,
                    ]}
                  >
                    <Popup>
                      Destination:{" "}
                      {selectedOrder.destination.address}
                    </Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          </div>

          {!selectedOrder && (
            <p className="map-placeholder">
              Select an order to view route
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Driver;
