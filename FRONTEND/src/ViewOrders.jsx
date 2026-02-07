'use client';

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewOrders.css";

const ViewOrders = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser) {
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
  }, [storedUser, navigate]);

  const markAsReceived = async (deliveryId) => {
    // Note: Backend needs an endpoint to update delivery status
    // For now, show placeholder
    alert("Mark as received functionality requires admin panel endpoint");
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

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <p>
            <strong>Order ID:</strong> {order.id}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                order.status === "delivered" ? "delivered" : "pending"
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

          <button
            className="confirm-btn"
            onClick={() => markAsReceived(order.id)}
            disabled={order.status === "delivered"}
          >
            {order.status === "delivered" ? "Delivery Received" : "Mark as Received"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ViewOrders;
