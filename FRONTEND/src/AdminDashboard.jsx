'use client';

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import OverviewTab from "./components/OverviewTab";
import DeliveriesTab from "./components/DeliveriesTab";
import UsersTab from "./components/UsersTab";
import RidersTab from "./components/RidersTab";
import AdminProfileTab from "./components/AdminProfileTab";
import SettingsTab from "./components/SettingsTab";
import { deliveryAPI, userAPI, riderAPI } from "./api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("currentUser"));
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalUsers: 0,
    totalRiders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Route protection
  if (!admin) {
    navigate("/login");
    return null;
  }

  if (admin.role_id !== 1) {
    navigate("/dashboard");
    return null;
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, usersRes, ridersRes] = await Promise.all([
        deliveryAPI.getDeliveries(),
        userAPI.getUsers(),
        riderAPI.getRiders(),
      ]);

      const deliveries = await deliveriesRes.json();
      const users = await usersRes.json();
      const riders = await ridersRes.json();

      const totalRevenue = (Array.isArray(deliveries) ? deliveries : []).reduce(
        (sum, d) => sum + (d.total_price || 0),
        0
      );

      setStats({
        totalDeliveries: Array.isArray(deliveries) ? deliveries.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalRiders: Array.isArray(riders) ? riders.length : 0,
        totalRevenue,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5001/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} loading={loading} />;
      case 'deliveries':
        return <DeliveriesTab />;
      case 'users':
        return <UsersTab />;
      case 'riders':
        return <RidersTab />;
      case 'profile':
        return <AdminProfileTab admin={admin} />;
      case 'settings':
        return <SettingsTab admin={admin} />;
      default:
        return <OverviewTab stats={stats} loading={loading} />;
    }
  };

  const formatKES = (amount) => {
    const numericAmount = Number(amount || 0);
    return `KES ${numericAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const overviewCards = [
    { name: "Total Deliveries", count: stats.totalDeliveries },
    { name: "Total Users", count: stats.totalUsers },
    { name: "Active Riders", count: stats.totalRiders },
    { name: "Total Revenue", count: formatKES(stats.totalRevenue) },
  ];

  const adminDisplayName =
    admin?.name ||
    admin?.username ||
    admin?.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        adminName={admin.name}
      />
      <div className="admin-main-content">
        <div className="admin-header">
          <div className="welcome-section">
            <h2 className="welcome-text">
              Welcome Back, <span>{adminDisplayName}</span>
            </h2>
            <p className="welcome-subtitle">Track and manage your deliveries with ease</p>
          </div>
        </div>

        {activeTab === 'overview' && !loading && (
          <div className="folders-grid">
            {overviewCards.map((card) => (
              <div
                key={card.name}
                className="folder-card"
                style={{ "--folder-color": "#38bdf8" }}
              >
                <div className="folder-header"></div>
                <h4 className="folder-name">{card.name}</h4>
                <div className="folder-count">
                  {card.count} {typeof card.count === "number" ? "items" : ""}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
