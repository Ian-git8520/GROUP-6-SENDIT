import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roleFromLanding = new URLSearchParams(location.search).get("role") || "user";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roleFromLanding);

  const handleSignup = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          roleFromLanding, // or role_id if backend uses role_id
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }
  
      // optional: save token/user returned by backend
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
  
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Signup</h2>
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
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="auth-btn">Signup</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;