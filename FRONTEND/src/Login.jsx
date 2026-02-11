'use client';

import React, { useState } from "react";
import { useNavigate, } from "react-router-dom";
import { authAPI } from "./api";
import "./Auth.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleIdMap = {
    1: "admin",
    2: "customer",
    3: "rider",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Store the JWT token
      if (data.token) {
        localStorage.setItem("jwtToken", data.token);
      }

      // Use user data from login response
      const loggedInUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone_number: data.user.phone_number,
        role_id: data.user.role_id,
        role: roleIdMap[data.user.role_id],
      };

      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      if (data.token) {
        localStorage.setItem("jwtToken", data.token);
      }

      // Navigate based on role
      if (data.user.role_id === 1) {
        navigate("/admin/dashboard");
      } else if (data.user.role_id === 3) {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back, please login</p>

        {error && <p className="error-message">{error}</p>}

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className={`auth-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            <span>Login</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
