'use client';

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));

  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!storedUser) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/profile", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: include cookies
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profileData = await res.json();
        const updatedUser = {
          ...storedUser,
          ...profileData,
          role: storedUser.role,
        };
        setUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [storedUser, navigate]);

  if (!storedUser) {
    navigate("/login");
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
    navigate("/");
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({
          name: user.name,
          phone_number: user.phone_number,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  return (
    <div className="dashboard-container">
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

      <div className="dashboard-content">
        <h2 className="welcome-text">
          Welcome, <span>{user.name || "User"}</span> 👋
        </h2>

        <div className="profile-wrapper">
          <div className="profile-summary">
            <h3>My Profile</h3>

            <div className="profile-row">
              <label>Name</label>
              {editing ? (
                <input name="name" value={user.name || ""} onChange={handleChange} />
              ) : (
                <span>{user.name || "Not set"}</span>
              )}
            </div>

            <div className="profile-row">
              <label>Email</label>
              {editing ? (
                <input name="email" value={user.email || ""} onChange={handleChange} />
              ) : (
                <span>{user.email || "Not set"}</span>
              )}
            </div>

            <div className="profile-row">
              <label>Phone</label>
              {editing ? (
                <input name="phone_number" value={user.phone_number || ""} onChange={handleChange} />
              ) : (
                <span>{user.phone_number || "Not set"}</span>
              )}
            </div>

            <div className="profile-row">
              <label>Role</label>
              <span className="role-badge">{user.role.toUpperCase()}</span>
            </div>

            <div className="profile-actions">
              {editing ? (
                <button className="save-btn" onClick={saveProfile}>
                  Save Changes
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
    </div>
  );
};

export default Dashboard;
