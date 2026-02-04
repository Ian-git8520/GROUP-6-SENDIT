import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const roleFromLanding =
    new URLSearchParams(location.search).get("role") || "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roleFromLanding);

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔐 Fake auth (NO backend yet)
    const loggedInUser = {
      name: email.split("@")[0], // helps profile/dashboard
      email,
      role,
    };

    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

    // 🔁 Role-based redirect
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "driver") {
      navigate("/driver/dashboard");
    } else {
      navigate("/dashboard");
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

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
