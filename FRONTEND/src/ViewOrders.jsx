import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./ViewOrders.css";
import { deliveryAPI } from "./services/api";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const data = await deliveryAPI.getOrders();
        // Filter orders for current user only
        const userOrders = data.filter(order => order.user_id === currentUser?.id);
        setOrders(userOrders);
      } catch (err) {
        setError("Failed to load orders.");
        console.error("Load orders error:", err);
      }
    };

    loadOrders();
  }, []);

  const handleDelete = async (orderId) => {
    try {
      await deliveryAPI.deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err) {
      setError("Failed to delete order.");
      console.error("Delete order error:", err);
    }
  };

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && !error && <p>No orders found.</p>}

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <p><strong>Item:</strong> {order.item_type || "Not set"}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Pickup:</strong> {order.pickup_location}</p>
          <p><strong>Destination:</strong> {order.drop_off_location}</p>
          <p><strong>Distance:</strong> {order.distance?.toFixed(2)} km</p>
          <p><strong>Price:</strong> KES {order.total_price}</p>

          <p><strong>Driver:</strong> {order.rider?.name || "Not assigned"}</p>
          {order.rider?.phone_number && (
            <p><strong>Driver Phone:</strong> {order.rider.phone_number}</p>
          )}

          <button
            type="button"
            onClick={() => handleDelete(order.id)}
            className="delete-order-btn"
          >
            Remove Order
          </button>

          {order.pickup_latitude && order.pickup_longitude && order.destination_latitude && order.destination_longitude && (
            <MapContainer
              center={[order.pickup_latitude, order.pickup_longitude]}
              zoom={12}
              style={{ height: "250px", width: "100%", marginTop: "1rem" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={[order.pickup_latitude, order.pickup_longitude]}>
                <Popup>Pickup</Popup>
              </Marker>

              <Marker position={[order.destination_latitude, order.destination_longitude]}>
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
