'use client';

import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("currentUser"));

  // 🔐 Route protection
  if (!admin) {
    navigate("/login");
    return null;
  }

  if (admin.role_id !== 1) {
    navigate("/dashboard");
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-container">
      {/* NAVBAR */}
      <nav className="admin-dashboard-navbar">
        <h3 className="logo">SendIT — Admin</h3>

        <div className="nav-right">
          <span className="welcome-text">
            Welcome, {admin.name || "Admin"}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {/* CENTER CONTENT */}
      <div className="admin-dashboard-content">
        <div className="admin-profile-card">
          <h3>My Profile</h3>

          <p>
            <strong>Name:</strong> {admin.name || "Admin"}
          </p>
          <p>
            <strong>Email:</strong> {admin.email}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <span className="role-badge admin">ADMIN</span>
          </p>

          <button
            className="admin-panel-btn"
            onClick={() => navigate("/dashboard/admin")}
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
