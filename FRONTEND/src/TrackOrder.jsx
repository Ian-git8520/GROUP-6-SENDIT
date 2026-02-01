import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./TrackOrder.css";
import { deliveryAPI } from "./services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Routing = ({ from, to }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => map.removeControl(control);
  }, [from, to, map]);

  return null;
};

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await deliveryAPI.getOrders();
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders.");
        console.error("Load orders error:", err);
      }
    };

    loadOrders();
  }, []);

  const selectedOrder = orders.find(
    (order) => order.id === Number(selectedId)
  );

  return (
    <div className="track-container">
      <h2>Track Your Order</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Select an Order</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.item_type ? `${order.item_type} — ` : ""}{order.pickup_location} → {order.drop_off_location} — {order.status}
          </option>
        ))}
      </select>

      {selectedOrder &&
        selectedOrder.pickup_latitude &&
        selectedOrder.pickup_longitude &&
        selectedOrder.destination_latitude &&
        selectedOrder.destination_longitude && (
          <div className="track-card">
            <MapContainer
              center={[
                selectedOrder.pickup_latitude,
                selectedOrder.pickup_longitude,
              ]}
              zoom={12}
              className="track-map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  selectedOrder.pickup_latitude,
                  selectedOrder.pickup_longitude,
                ]}
              >
                <Popup>Pickup: {selectedOrder.pickup_location}</Popup>
              </Marker>

              <Marker
                position={[
                  selectedOrder.destination_latitude,
                  selectedOrder.destination_longitude,
                ]}
              >
                <Popup>Destination: {selectedOrder.drop_off_location}</Popup>
              </Marker>

              <Routing
                from={{
                  lat: selectedOrder.pickup_latitude,
                  lng: selectedOrder.pickup_longitude,
                }}
                to={{
                  lat: selectedOrder.destination_latitude,
                  lng: selectedOrder.destination_longitude,
                }}
              />
            </MapContainer>

            <div className="track-info">
              {selectedOrder.item_type && (
                <p>
                  <strong>Item:</strong> {selectedOrder.item_type}
                </p>
              )}
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Distance:</strong>{" "}
                {selectedOrder.distance?.toFixed(2)} km
              </p>
              <p>
                <strong>Price:</strong> KES {selectedOrder.total_price}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default TrackOrder;
