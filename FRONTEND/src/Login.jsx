import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import "./Login.css";
import { authAPI } from "./services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call backend API
      const response = await authAPI.login(email, password);

      const loggedInUser = {
        id: response.id,
        name: response.name || email.split("@")[0],
        email: response.email || email,
        phone: response.phone || "",
        role: response.role,
      };

      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

      // Role-based redirect
      if (loggedInUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (loggedInUser.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back, please login</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

