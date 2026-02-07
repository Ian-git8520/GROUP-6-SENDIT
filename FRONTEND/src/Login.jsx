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
  const [loading, setLoading] = useState(false); // 👈 NEW

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 start spinner

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();

      let role = "user";
      if (data.role_id === 1) role = "admin";
      else if (data.role_id === 3) role = "driver";

      const displayName = email.split("@")[0];

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: data.id,
          name: displayName,
          email: data.email,
          role,
          token: data.token,
        })
      );

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "driver") navigate("/driver/dashboard");
      else navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false); // 👈 stop spinner
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

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
