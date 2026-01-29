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

}