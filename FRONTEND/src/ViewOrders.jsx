'use client';

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deliveryAPI } from "./api";
import "./ViewOrders.css";

const ViewOrders = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newDestination, setNewDestination] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser) {
        navigate("/login");
        return;
      }

      try {
        const res = await deliveryAPI.getDeliveries();

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
  }, [storedUser, navigate]);

  const handleChangeDestination = async (deliveryId) => {
    if (!newDestination.trim()) {
      alert("Please enter a new destination");
      return;
    }

    setActionLoading(true);
    try {
      const res = await deliveryAPI.changeDestination(deliveryId, newDestination);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to change destination");
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === deliveryId
            ? { ...order, drop_off_location: newDestination }
            : order
        )
      );

      setShowDestinationModal(false);
      setNewDestination("");
      alert("Destination updated successfully! A confirmation email has been sent.");
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to cancel this delivery? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await deliveryAPI.cancelDelivery(
        deliveryId,
        cancellationReason || "User requested cancellation"
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to cancel order");
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === deliveryId ? { ...order, status: "cancelled" } : order
        )
      );

      setShowCancelModal(false);
      setCancellationReason("");
      alert("Delivery cancelled successfully! A confirmation email has been sent.");
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openDestinationModal = (order) => {
    setSelectedOrderId(order.id);
    setNewDestination(order.drop_off_location || "");
    setShowDestinationModal(true);
  };

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const canModifyOrder = (status) => {
    return status === "pending" || status === "accepted";
  };

  if (!storedUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-message">{error}</p>}
      {orders.length === 0 && !loading && <p>No orders found.</p>}

      <div className="orders-grid">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <p>
              <strong>Order:</strong> {order.order_name ? order.order_name : `#${order.id}`}
            </p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                order.status === "delivered" ? "delivered" : order.status === "cancelled" ? "cancelled" : "pending"
              }
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </p>

          <p>
            <strong>Distance:</strong> {order.distance?.toFixed(2)} km
          </p>
          <p>
            <strong>Price:</strong> KES {order.total_price}
          </p>
          <p>
            <strong>Weight:</strong> {order.weight} kg
          </p>
          <p>
            <strong>Size:</strong> {order.size} cm
          </p>
          <p>
            <strong>Destination:</strong> {order.drop_off_location}
          </p>

          {canModifyOrder(order.status) && (
            <div className="order-actions">
              <button
                className="change-destination-btn"
                onClick={() => openDestinationModal(order)}
              >
                Update
              </button>
              <button
                className="cancel-btn"
                onClick={() => openCancelModal(order.id)}
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
        ))}
      </div>

      {/* Change Destination Modal */}
      {showDestinationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Destination</h3>
            <p>Enter your new destination:</p>
            <textarea
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Enter new destination address or location details"
              rows="4"
            />
            <div className="modal-actions">
              <button
                className="confirm-btn"
                onClick={() => handleChangeDestination(selectedOrderId)}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Confirm Change"}
              </button>
              <button
                className="cancel-modal-btn"
                onClick={() => {
                  setShowDestinationModal(false);
                  setNewDestination("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Delivery Order</h3>
            <p>Are you sure you want to cancel this delivery?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please tell us why you're cancelling (optional)"
              rows="3"
            />
            <div className="modal-actions">
              <button
                className="confirm-cancel-btn"
                onClick={() => handleCancelOrder(selectedOrderId)}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
              <button
                className="cancel-modal-btn"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
                disabled={actionLoading}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
