import React, { useState } from "react";

import "./AdminPanel.css";

const AdminPanel = () => {
  
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState(
    JSON.parse(localStorage.getItem("orders")) || []
  );

  // 🔐 Route protection
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
      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Control Panel</h2>
       
      </div>

      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Distance (km)</th>
                <th>Price (KES)</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.itemType}</td>
                  <td>
                    {order.pickup
                      ? `${order.pickup.lat.toFixed(3)}, ${order.pickup.lng.toFixed(3)}`
                      : "N/A"}
                  </td>
                  <td>
                    {order.destination
                      ? `${order.destination.lat.toFixed(3)}, ${order.destination.lng.toFixed(3)}`
                      : "N/A"}
                  </td>
                  <td>{order.distance ? order.distance.toFixed(2) : "—"}</td>
                  <td>{order.price ? `KES ${order.price}` : "—"}</td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.createdAt}</td>
                  <td>
                    <div className="action-btn-group">
                      <button
                        className="approve-btn"
                        onClick={() => updateStatus(order.id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => updateStatus(order.id, "Cancelled")}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
