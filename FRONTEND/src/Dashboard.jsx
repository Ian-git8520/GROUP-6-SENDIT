import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    navigate("/login");
    return null;
  }

   const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };


  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.role.toUpperCase()}</h2>

      <div className="dashboard-grid">
        {user.role === "user" && (
          <>
            <Link to="/dashboard/create-order" className="dash-card">Create Order</Link>
            <Link to="/dashboard/view-orders" className="dash-card">View Orders</Link>
            <Link to="/dashboard/track-order" className="dash-card">Track Order</Link>
          </>
        )}

        {user.role === "driver" && (
          <>
            <Link to="/dashboard/view-orders" className="dash-card">View Assigned Orders</Link>
            <Link to="/dashboard/track-order" className="dash-card">Track Route</Link>
          </>
        )}

        {user.role === "admin" && (
          <>
            <Link to="/dashboard/admin" className="dash-card admin">Admin Control</Link>
            <Link to="/dashboard/view-orders" className="dash-card">View All Orders</Link>
          </>
        )}
      </div>
      