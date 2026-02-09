'use client';

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    2: "user",
    3: "driver",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: include cookies
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      const profileRes = await fetch("http://localhost:5000/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
      });

      if (!profileRes.ok) {
        setError("Failed to fetch profile");
        return;
      }

      const profileData = await profileRes.json();

      const loggedInUser = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phone_number,
        role_id: profileData.role_id,
        role: roleIdMap[profileData.role_id],
      };

      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

      if (profileData.role_id === 1) {
        navigate("/admin/dashboard");
      } else if (profileData.role_id === 3) {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
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
