import React, { useEffect, useState } from "react";
import "./Driver.css";

const Driver = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);

  const markDelivered = (id) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: "Delivered" } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  
  };
    const openInMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank"
    );
  };
  return (
    <div className="driver-container">
      <h2>Driver Dashboard</h2>
      {orders.length === 0 ? (
        <p className="empty">No deliveries available.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>{order.itemType}</h3>