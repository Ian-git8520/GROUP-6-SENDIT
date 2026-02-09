'use client';

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!storedUser) navigate("/login");
  }, [storedUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <h3 className="logo">SendIT</h3>

        <div className="nav-links">
          <Link to="/dashboard/create-order">Create Order</Link>
          <Link to="/dashboard/view-orders">View Orders</Link>
          <Link to="/dashboard/track-order">Track Order</Link>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="holo-orb" />

        <h2 className="welcome-text">
          Welcome, <span>{user?.name || "User"}</span> 
        </h2>

        <div className="profile-wrapper">
          <div
            className="profile-summary"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - r.left;
              const y = e.clientY - r.top;
              const rx = ((y / r.height) - .5) * -10;
              const ry = ((x / r.width) - .5) * 10;
              e.currentTarget.style.transform =
                `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
            }}
            onMouseLeave={(e) => e.currentTarget.style.transform = ""}
          >
            <h3>My Profile</h3>

            <div className="profile-row">
              <label>Name</label>
              {editing
                ? <input name="name" value={user.name || ""} onChange={handleChange} />
                : <span>{user.name}</span>}
            </div>

            <div className="profile-row">
              <label>Email</label>
              <span>{user.email}</span>
            </div>

            <div className="profile-row">
              <label>Phone</label>
              {editing
                ? <input name="phone_number" value={user.phone_number || ""} onChange={handleChange} />
                : <span>{user.phone_number}</span>}
            </div>

            <div className="profile-row">
              <label>Role</label>
              <span className="role-badge">{user.role}</span>
            </div>

            <div className="profile-actions">
              {editing
                ? <button className="save-btn" onClick={() => setEditing(false)}>Save</button>
                : <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
