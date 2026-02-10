import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "./api";
import "./Auth.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await authAPI.login(email, password);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // Store user info from backend response (token is in HTTP-only cookie)
      const loggedInUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone_number: data.user.phone_number,
        role: data.user.role,
        role_id: data.user.role_id,
      };

      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

      // Role-based redirect using backend-provided role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back, please login</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
