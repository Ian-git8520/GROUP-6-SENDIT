import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./ViewOrders.css";

const ViewOrders = () => {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <p><strong>Item:</strong> {order.itemType}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Distance:</strong> {order.distance?.toFixed(2)} km</p>
          <p><strong>Price:</strong> KES {order.price}</p>

          {order.pickup && order.destination && (
            <MapContainer
              center={[order.pickup.lat, order.pickup.lng]}
              zoom={12}
              style={{ height: "250px", width: "100%", marginTop: "1rem" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={[order.pickup.lat, order.pickup.lng]}>
                <Popup>Pickup</Popup>
              </Marker>

              <Marker position={[order.destination.lat, order.destination.lng]}>
                <Popup>Destination</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewOrders;

