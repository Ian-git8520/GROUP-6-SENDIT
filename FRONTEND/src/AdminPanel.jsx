import React, { useState } from "react";
import "./AdminPanel.css";

const AdminPanel = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState(
    JSON.parse(localStorage.getItem("orders")) || []
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-container">
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const updateStatus = (id, status) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  return (
    <div className="admin-container">
      <h2>Admin Control Panel</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div className="admin-order-card" key={order.id}>
          <p><strong>Item:</strong> {order.itemType}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Created At:</strong> {order.createdAt}</p>

          <select
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In-Transit">In-Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
