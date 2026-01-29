import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "./TrackOrder.css";

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

  React.useEffect(() => {
    if (!from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [from, to]);

  return null;
};
const TrackParcel = () => {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const selectedOrder = orders.find((o) => o.id === Number(selectedOrderId));

  return (
    <div className="track-container">
      <h2>Track Your Order</h2>

      <select
        value={selectedOrderId}
        onChange={(e) => setSelectedOrderId(e.target.value)}
      >
        <option value="">Select an Order</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.itemType} — {order.status}
          </option>
        ))}
      </select>

      {selectedOrder && selectedOrder.pickup && selectedOrder.destination && (
        <div className="track-map">
          <MapContainer
            center={[selectedOrder.pickup.lat, selectedOrder.pickup.lng]}
            zoom={12}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[selectedOrder.pickup.lat, selectedOrder.pickup.lng]}>
              <Popup>Pickup</Popup>
            </Marker>

            <Marker position={[selectedOrder.destination.lat, selectedOrder.destination.lng]}>
              <Popup>Destination</Popup>
            </Marker>

            <Routing
              from={selectedOrder.pickup}
              to={selectedOrder.destination}
            />
          </MapContainer>
           <div className="track-info">
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Distance:</strong> {selectedOrder.distance?.toFixed(2)} km</p>
            <p><strong>Price:</strong> KES {selectedOrder.price}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcel;