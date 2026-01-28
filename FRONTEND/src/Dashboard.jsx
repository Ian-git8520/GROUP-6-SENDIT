import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    navigate("/login");
    return null;
  }

   const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };