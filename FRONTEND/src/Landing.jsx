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