import React, { useState } from "react";
import "./ViewOrders.css";

const ViewOrders = () => {
<<<<<<< HEAD
  const [orders, setOrders] = useState(
    JSON.parse(localStorage.getItem("orders")) || []
  );

  const markAsReceived = (id) => {
    const updatedOrders = orders.map((order) =>
      order.id === id
        ? { ...order, status: "Delivered" }
        : order
    );

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

=======
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

>>>>>>> 19288d4 (errors debugging)
  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <p><strong>Item:</strong> {order.itemType}</p>
<<<<<<< HEAD

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                order.status === "Delivered" ? "delivered" : "pending"
              }
            >
              {order.status}
            </span>
          </p>

          <p><strong>Distance:</strong> {order.distance?.toFixed(2)} km</p>
          <p><strong>Price:</strong> KES {order.price}</p>

          <button
            className="confirm-btn"
            onClick={() => markAsReceived(order.id)}
            disabled={order.status === "Delivered"}
          >
            {order.status === "Delivered"
              ? "Delivery Received"
              : "Mark as Received"}
          </button>
=======
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
>>>>>>> 19288d4 (errors debugging)
        </div>
      ))}
    </div>
  );
};

export default ViewOrders;
<<<<<<< HEAD


=======
>>>>>>> 19288d4 (errors debugging)
