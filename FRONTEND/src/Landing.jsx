import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

   
const Landing = () => {
  return (
    <div className="landing-container">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>SendIT</h1>
          <p>
            Fast, reliable, and secure courier delivery — from pickup to doorstep.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/signup" className="btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      {/* ROLE SELECTION */}
      <section className="role-section">
        <h2>Who are you?</h2>
        <p>Select your role to get the best experience.</p>
        <div className="role-cards">
          <Link to="/login" className="role-card">
            <h3>User</h3>
            <p>Send parcels, track deliveries, and manage your orders.</p>
          </Link>
          <Link to="/login" className="role-card">
            <h3>Driver</h3>
            <p>Deliver parcels, update locations, and manage assignments.</p>
          </Link>
          <Link to="/login" className="role-card">
            <h3>Admin</h3>
            <p>Manage orders, update statuses, and oversee operations.</p>
          </Link>
        </div>
      </section>