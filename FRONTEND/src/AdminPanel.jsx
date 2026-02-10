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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});

  // Fetch all orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5001/deliveries", {
          headers: {
            "Content-Type": "application/json",
          },
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
        const res = await fetch("http://localhost:5001/riders", {
          headers: {
            "Content-Type": "application/json",
          },
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

  // Route protection
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
      const res = await fetch(`http://localhost:5001/admin/deliveries/${deliveryId}`, {
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
      const res = await fetch(`http://localhost:5001/admin/deliveries/${orderId}`, {
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

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm === "" ||
      order.order_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.drop_off_location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const toggleRowExpand = (orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <div className="admin-container">
      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Control Panel</h2>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="search-filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filterStatus === "accepted" ? "active" : ""}`}
            onClick={() => setFilterStatus("accepted")}
          >
            Assigned
          </button>
          <button
            className={`filter-btn ${filterStatus === "in_transit" ? "active" : ""}`}
            onClick={() => setFilterStatus("in_transit")}
          >
            In Transit
          </button>
          <button
            className={`filter-btn ${filterStatus === "delivered" ? "active" : ""}`}
            onClick={() => setFilterStatus("delivered")}
          >
            Delivered
          </button>
        </div>
      </div>

      {loading && <p className="loading-message">Loading orders...</p>}
      {error && <p className="error-message">{error}</p>}

      {filteredOrders.length === 0 && !loading ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th></th>
                <th>Order ID</th>
                <th>Pickup Location</th>
                <th>Destination</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const pickupData = typeof order.pickup_location === "string"
                  ? order.pickup_location
                  : JSON.stringify(order.pickup_location);
                const destData = typeof order.drop_off_location === "string"
                  ? order.drop_off_location
                  : JSON.stringify(order.drop_off_location);

                const assignedDriver = drivers.find(d => d.id === order.rider_id);
                const isExpanded = expandedRows[order.id];

                return (
                  <React.Fragment key={order.id}>
                    <tr className="order-row">
                      <td className="expand-cell">
                        <button
                          className={`expand-btn ${isExpanded ? "expanded" : ""}`}
                          onClick={() => toggleRowExpand(order.id)}
                          aria-label="Expand row"
                        >
                          ❯
                        </button>
                      </td>
                      <td className="order-id-cell">
                        <span className="order-id-badge">{order.id}</span>
                        <span className="order-type">{order.order_name || "Standard"}</span>
                      </td>
                      <td className="location-cell">{pickupData || "N/A"}</td>
                      <td className="location-cell">{destData || "N/A"}</td>
                      <td>{order.user_name || "—"}</td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="quantity-cell">{order.distance ? `${order.distance.toFixed(2)} km` : "—"}</td>
                      <td>
                        <div className="row-actions">
                          {order.status === "pending" && (
                            <button
                              className="action-btn assign-btn"
                              onClick={() => {
                                setSelectedOrderForAssign(order.id);
                                setShowDriverModal(true);
                              }}
                              title="Assign Driver"
                            >
                              Assign
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button
                              className="action-btn cancel-btn"
                              onClick={() => updateStatus(order.id, "cancelled")}
                              title="Cancel Order"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="9">
                          <div className="expanded-content">
                            <div className="expanded-grid">
                              <div className="expanded-item">
                                <label>Distance</label>
                                <p>{order.distance ? `${order.distance.toFixed(2)} km` : "—"}</p>
                              </div>
                              <div className="expanded-item">
                                <label>Price</label>
                                <p>KES {order.total_price || "—"}</p>
                              </div>
                              <div className="expanded-item">
                                <label>Created</label>
                                <p>{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="expanded-item">
                                <label>Driver</label>
                                <p>
                                  {assignedDriver ? (
                                    <span>
                                      {assignedDriver.name}
                                      <br />
                                      <span className="phone">{assignedDriver.phone_number}</span>
                                    </span>
                                  ) : (
                                    "Unassigned"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                      <span className="select-btn">Assign</span>
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
