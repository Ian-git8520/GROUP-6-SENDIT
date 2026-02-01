import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!storedUser) {
    navigate("/login");
    return null;
  }

  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    setEditing(false);
  };

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <h3 className="logo">SendIT</h3>

        <div className="nav-links">
          {(user.role === "user" || user.role === "customer") && (
            <>
              <Link to="/dashboard/create-order">Create Order</Link>
              <Link to="/dashboard/view-orders">View Orders</Link>
              <Link to="/dashboard/track-order">Track Order</Link>
            </>
          )}

          {user.role === "driver" && (
            <>
              <Link to="/dashboard/view-orders">Assigned Orders</Link>
              <Link to="/dashboard/track-order">Track Route</Link>
            </>
          )}

          {user.role === "admin" && (
            <>
              <Link to="/dashboard/admin">Admin</Link>
              <Link to="/dashboard/view-orders">All Orders</Link>
            </>
          )}

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="dashboard-content">
        <h2>Welcome, {user.role === "customer" ? "CUSTOMER" : user.role.toUpperCase()}</h2>

        {/* PROFILE CARD */}
        <div className="profile-summary">
          <h3>My Profile</h3>

          <div className="profile-row">
            <strong>Name:</strong>
            {editing ? (
              <input
                name="name"
                value={user.name || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.name || "Not set"}</span>
            )}
          </div>

          <div className="profile-row">
            <strong>Email:</strong>
            {editing ? (
              <input
                name="email"
                value={user.email || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.email || "Not set"}</span>
            )}
          </div>

          <div className="profile-row">
            <strong>Phone:</strong>
            {editing ? (
              <input
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.phone || "Not set"}</span>
            )}
          </div>

          <div className="profile-row">
            <strong>Role:</strong>
            <span className={`role-badge ${user.role}`}>
              {user.role.toUpperCase()}
            </span>
          </div>

          <div className="profile-actions">
            {editing ? (
              <button className="save-btn" onClick={saveProfile}>
                Save
              </button>
            ) : (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


