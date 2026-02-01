import React, { useState } from "react";
import "./ViewOrders.css";

const ViewOrders = () => {
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

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <p><strong>Item:</strong> {order.itemType}</p>

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
        </div>
      ))}
    </div>
  );
};

export default ViewOrders;


