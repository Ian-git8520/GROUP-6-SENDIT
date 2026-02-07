'use client';

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

  // Fetch all orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/deliveries", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Fetch available drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!user) return;

      try {
        const res = await fetch("http://localhost:5000/riders", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch drivers");
        }

        const data = await res.json();
        setDrivers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDrivers();
  }, [user]);

  // 🔐 Route protection
  if (!user || user.role_id !== 1) {
    return (
      <div className="admin-container">
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const updateStatus = async (deliveryId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      const updatedOrders = orders.map((order) =>
        order.id === deliveryId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };

  const assignDriverToOrder = async (orderId, riderId) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/deliveries/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rider_id: riderId,
          status: "accepted"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to assign driver");
      }

      // Update local state
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            rider_id: riderId,
            status: "accepted"
          };
        }
        return order;
      });
      setOrders(updatedOrders);
      setShowDriverModal(false);
      setSelectedOrderForAssign(null);
      alert("Driver assigned successfully");
    } catch (err) {
      console.error(err);
      alert("Error assigning driver");
    }
  };

  return (
    <div className="admin-container">
      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Control Panel</h2>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-message">{error}</p>}

      {orders.length === 0 && !loading ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>User</th>
                <th>Pickup Location</th>
                <th>Destination</th>
                <th>Distance (km)</th>
                <th>Price (KES)</th>
                <th>Status</th>
                <th>Assigned Driver</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const pickupData = typeof order.pickup_location === "string"
                  ? JSON.parse(order.pickup_location)
                  : order.pickup_location;
                const destData = typeof order.drop_off_location === "string"
                  ? JSON.parse(order.drop_off_location)
                  : order.drop_off_location;

                const assignedDriver = drivers.find(d => d.id === order.rider_id);

                return (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>{order.id}</td>
                    <td>User #{order.user_id}</td>
                    <td>{pickupData?.display_name || "N/A"}</td>
                    <td>{destData?.display_name || "N/A"}</td>
                    <td>{order.distance ? order.distance.toFixed(2) : "—"}</td>
                    <td>{order.total_price ? `KES ${order.total_price}` : "—"}</td>
                    <td>
                      <span className={`status-badge ${order.status?.toLowerCase()}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {assignedDriver ? (
                        <div className="driver-info">
                          <p>{assignedDriver.name}</p>
                          <p className="phone">{assignedDriver.phone_number}</p>
                        </div>
                      ) : (
                        <span className="no-driver">Unassigned</span>
                      )}
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btn-group">
                        {order.status === "pending" && (
                          <>
                            <button
                              className="assign-btn"
                              onClick={() => {
                                setSelectedOrderForAssign(order.id);
                                setShowDriverModal(true);
                              }}
                            >
                              Assign Driver
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => updateStatus(order.id, "cancelled")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status !== "pending" && order.status !== "cancelled" && (
                          <button
                            className="cancel-btn"
                            onClick={() => updateStatus(order.id, "cancelled")}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showDriverModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign Driver to Order #{selectedOrderForAssign}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDriverModal(false);
                  setSelectedOrderForAssign(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {drivers.length === 0 ? (
                <p className="no-drivers">No drivers available</p>
              ) : (
                <div className="driver-list">
                  {drivers.map((driver) => (
                    <button
                      key={driver.id}
                      className="driver-option"
                      onClick={() => assignDriverToOrder(selectedOrderForAssign, driver.id)}
                    >
                      <div className="driver-details">
                        <h4>{driver.name}</h4>
                        <p>{driver.phone_number}</p>
                      </div>
                      <span className="select-btn">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
