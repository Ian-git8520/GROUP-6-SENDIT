"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/deliveries", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const deliveries = Array.isArray(data) ? data : data.deliveries;
      if (!Array.isArray(deliveries))
        throw new Error("Invalid deliveries structure");

      setOrders(deliveries);
    } catch (err) {
      console.error(err);
      setError("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch("http://localhost:5000/riders", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : data.riders || []);
    } catch (err) {
      console.error("Error loading drivers:", err);
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
    fetchOrders();
    fetchDrivers();
  }, [user]);

  const assignDriverToOrder = async (orderId, riderId) => {
    try {
      const body = { rider_id: Number(riderId), status: "accepted" };
      const res = await fetch(
        `http://localhost:5000/admin/deliveries/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Failed to assign driver");
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );

      setShowDriverModal(false);
      setSelectedOrderForAssign(null);
      alert("✅ Driver assigned!");
    } catch (err) {
      console.error(err);
      alert("❌ Error assigning driver");
    }
  };

  if (!user || user.role_id !== 1) {
    return (
      <div className="admin-container">
        <h2>Access Denied</h2>
        <p>You must be an admin to view this panel.</p>
      </div>
    );
  }

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Control Panel</h2>
      </div>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pickup</th>
              <th>Drop‑off</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const assigned = drivers.find(
                (d) => d.id === o.rider_id || d.id === o.driver_id
              );
              return (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{String(o.pickup_location)}</td>
                  <td>{String(o.drop_off_location)}</td>
                  <td>{o.status}</td>
                  <td>{assigned ? assigned.name : "—"}</td>
                  <td>
                    {o.status === "pending" && (
                      <button
                        className="assign-btn"
                        onClick={() => {
                          setSelectedOrderForAssign(o.id);
                          setShowDriverModal(true);
                        }}
                      >
                        Assign driver
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showDriverModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign a driver to order #{selectedOrderForAssign}</h3>
            {drivers.length === 0 && <p>No drivers available</p>}

            {drivers.map((d) => (
              <button
                key={d.id}
                onClick={() => assignDriverToOrder(selectedOrderForAssign, d.id)}
              >
                {d.name} ({d.phone_number})
              </button>
            ))}

            <button
              className="close-btn"
              onClick={() => setShowDriverModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;