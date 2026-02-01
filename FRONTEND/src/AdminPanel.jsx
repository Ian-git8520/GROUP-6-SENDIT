import React, { useState, useEffect } from "react";
import "./AdminPanel.css";
import { deliveryAPI, riderAPI } from "./services/api";

const AdminPanel = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [savingRider, setSavingRider] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, ridersData] = await Promise.all([
          deliveryAPI.getOrders(),
          riderAPI.getRiders(),
        ]);
        setOrders(ordersData);
        setRiders(ridersData);
      } catch (err) {
        setError("Failed to load orders or riders.");
        console.error("Load data error:", err);
      }
    };

    if (user && user.role === "admin") {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-container">
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const updateStatus = async (id, status) => {
    try {
      await deliveryAPI.updateStatus(id, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
    } catch (err) {
      setError("Failed to update status.");
      console.error("Update status error:", err);
    }
  };

  const assignRider = async (orderId, riderIdValue) => {
    const riderId = Number(riderIdValue);
    if (!riderId) return;
    try {
      const updated = await deliveryAPI.assignDriver(orderId, riderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, rider: updated.rider } : order
        )
      );
    } catch (err) {
      setError("Failed to assign driver.");
      console.error("Assign driver error:", err);
    }
  };

  const createRider = async (e) => {
    e.preventDefault();
    if (!riderName.trim()) return;
    setSavingRider(true);
    setError("");

    try {
      const newRider = await riderAPI.createRider({
        name: riderName.trim(),
        phone_number: riderPhone.trim() || null,
      });
      setRiders((prev) => [...prev, newRider]);
      setRiderName("");
      setRiderPhone("");
    } catch (err) {
      setError("Failed to create rider.");
      console.error("Create rider error:", err);
    } finally {
      setSavingRider(false);
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Control Panel</h2>

      <form className="admin-rider-form" onSubmit={createRider}>
        <h3>Add Driver</h3>
        <input
          type="text"
          placeholder="Driver name"
          value={riderName}
          onChange={(e) => setRiderName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone number (optional)"
          value={riderPhone}
          onChange={(e) => setRiderPhone(e.target.value)}
        />
        <button type="submit" disabled={savingRider}>
          {savingRider ? "Saving..." : "Add Driver"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && !error && <p>No orders found.</p>}

      {orders.map((order) => (
        <div className="admin-order-card" key={order.id}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Pickup:</strong> {order.pickup_location}</p>
          <p><strong>Destination:</strong> {order.drop_off_location}</p>
          <p><strong>Distance:</strong> {order.distance?.toFixed(2)} km</p>
          <p><strong>Price:</strong> KES {order.total_price}</p>
          <p><strong>User ID:</strong> {order.user_id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Driver:</strong> {order.rider?.name || "Not assigned"}</p>
          {order.rider?.phone_number && (
            <p><strong>Driver Phone:</strong> {order.rider.phone_number}</p>
          )}
          <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>

          <label className="admin-assign-label">
            Assign Driver:
            <select
              value={order.rider?.id || ""}
              onChange={(e) => assignRider(order.id, e.target.value)}
            >
              <option value="">Select driver</option>
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id}>
                  {rider.name}
                </option>
              ))}
            </select>
          </label>

          <select
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in-transit">In-Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
