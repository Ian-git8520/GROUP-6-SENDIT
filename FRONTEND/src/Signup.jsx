import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./signup.css";
import { authAPI } from "./services/api";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roleFromLanding = new URLSearchParams(location.search).get("role") || "user";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(roleFromLanding);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.signup({
        name,
        email,
        password,
        phone_number: phone,
        role: role === "user" ? "customer" : role,
      });

      const signedUpUser = {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone || phone,
        role: response.role,
      };

      localStorage.setItem("currentUser", JSON.stringify(signedUpUser));

      // Role-based redirect
      if (signedUpUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (signedUpUser.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Signup</h2>
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <form className="auth-form" onSubmit={handleSignup}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
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
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="auth-btn">
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
