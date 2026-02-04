import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // Read user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  const [user, setUser] = useState({
    name: storedUser?.name || "User",
    email: storedUser?.email || "Not set",
    phone: storedUser?.phone || "Not set",
    role: storedUser?.role || "user",
  });

  const [editing, setEditing] = useState(false);

  // Redirect if not logged in
  if (!storedUser) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    const updatedUser = { ...storedUser, ...user };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setEditing(false);
  };

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <h3 className="logo">SendIT</h3>

        <div className="nav-links">
          <Link to="/dashboard/create-order">Create Order</Link>
          <Link to="/dashboard/view-orders">View Orders</Link>
          <Link to="/dashboard/track-order">Track Order</Link>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="dashboard-content">
        <h2 className="welcome-text">
          Welcome, <span>{user.name}</span> 👋
        </h2>

        <div className="profile-wrapper">
          <div className="profile-summary">
            <h3>My Profile</h3>

            <div className="profile-row">
              <label>Name</label>
              {editing ? (
                <input
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.name}</span>
              )}
            </div>

            <div className="profile-row">
              <label>Email</label>
              {editing ? (
                <input
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.email}</span>
              )}
            </div>

            <div className="profile-row">
              <label>Phone</label>
              {editing ? (
                <input
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.phone}</span>
              )}
            </div>

            <div className="profile-row">
              <label>Role</label>
              <span className="role-badge">
                {user.role.toUpperCase()}
              </span>
            </div>

            <div className="profile-actions">
              {editing ? (
                <button className="save-btn" onClick={saveProfile}>
                  Save Changes
                </button>
              ) : (
                <button
                  className="edit-btn"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
