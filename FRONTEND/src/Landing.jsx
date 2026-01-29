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


      {/* ABOUT */}
      <section className="about-section">
        <h2>What is SendIT?</h2>
        <p>
          SendIT is a modern courier service that allows users to create parcel
          delivery orders, track them in real-time, and receive notifications as
          their parcels move through the delivery pipeline.
        </p>
        <p>
          Whether you are sending documents, packages, or heavy items, SendIT
          ensures fast, transparent, and secure deliveries across cities.
        </p>
      </section>


      {/* FEATURES */}
      <section className="features-section">
        <h2>Core Features</h2>
        <p className="features-subtitle">
          Everything you need for seamless parcel delivery.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Create Orders</h3>
            <p>Place delivery orders easily with item details and destinations.</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Tracking</h3>
            <p>Track your parcel live on a map from pickup to delivery.</p>
          </div>
          <div className="feature-card">
            <h3>Order Management</h3>
            <p>View, cancel, or update your delivery orders anytime.</p>
          </div>
          <div className="feature-card">
            <h3>Admin Control</h3>
            <p>Admins can update order status and present parcel locations.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Pricing</h3>
            <p>Automatic price calculation based on distance, weight, and size.</p>
          </div>
          <div className="feature-card">
            <h3>Email Notifications</h3>
            <p>Receive real-time email updates when your parcel status changes.</p>
          </div>
        </div>
      </section>


       {/* MVP HIGHLIGHT */}
      <section className="mvp-section">
        <h2>What You Can Do with SendIT</h2>
        <div className="mvp-grid">
          <div className="mvp-card">Create an account and log in</div>
          <div className="mvp-card">Create a parcel delivery order</div>
          <div className="mvp-card">Change the destination of an order</div>
          <div className="mvp-card">Cancel a parcel delivery order</div>
          <div className="mvp-card">View order details and routes</div>
          <div className="mvp-card">Admins update order status & location</div>
          <div className="mvp-card">Live map with pickup & destination</div>
          <div className="mvp-card">Email notifications on status updates</div>
        </div>
      </section>
</div>
  );
};