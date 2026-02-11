'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { profileAPI } from "./api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const resolvedUser = storedUser.user || storedUser;

  const [user, setUser] = useState(resolvedUser);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  useEffect(() => {
    if (!storedUser || Object.keys(storedUser).length === 0) {
      navigate("/login");
    }
  }, [storedUser, navigate]);

  useEffect(() => {
    const hasDisplayName = Boolean(
      user?.name ||
      user?.full_name ||
      user?.username ||
      user?.user_name ||
      user?.first_name ||
      user?.last_name
    );

    if (!hasDisplayName) {
      profileAPI
        .getProfile()
        .then(async (res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((profile) => {
          if (!profile) return;
          setUser((prev) => {
            const merged = { ...prev, ...profile };
            localStorage.setItem("currentUser", JSON.stringify(merged));
            return merged;
          });
        })
        .catch((err) => {
          console.error("Failed to load profile:", err);
        });
    }
  }, [user]);

  // Fetch recent orders from backend for current user
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!storedUser || Object.keys(storedUser).length === 0) return;
      try {
        const res = await fetch("http://localhost:5001/deliveries", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await res.json();
        // Filter for current user's orders and get the 5 most recent
        const userId =
          storedUser.id ??
          storedUser.user_id ??
          storedUser.userId ??
          storedUser.user?.id ??
          storedUser.user?.user_id ??
          storedUser.user?.userId;
        const userOrders = data.filter(order => order.user_id === userId);
        const activeOrders = userOrders.filter((order) => {
          const status = (order.status || "").toLowerCase();
          return status !== "delivered" && status !== "cancelled";
        });

        setAllOrders(userOrders);
        setRecentOrders(userOrders.slice(0, 5));
        setTotalOrdersCount(userOrders.length);
        setActiveOrdersCount(activeOrders.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecentOrders();
  }, [storedUser]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setSuggestions([]);
      return;
    }

    const rawSuggestions = [];
    allOrders.forEach((order) => {
      if (order.order_name) rawSuggestions.push(order.order_name);
      if (order.pickup_location) rawSuggestions.push(order.pickup_location);
      if (order.drop_off_location) rawSuggestions.push(order.drop_off_location);
      if (order.status) rawSuggestions.push(order.status);
      if (order.id) rawSuggestions.push(`Order #${order.id}`);
    });

    const uniqueSuggestions = Array.from(new Set(rawSuggestions));
    const filtered = uniqueSuggestions
      .filter((text) => text.toLowerCase().includes(query))
      .slice(0, 6);

    setSuggestions(filtered);
  }, [searchTerm, allOrders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return allOrders.filter((order) => {
      const matchesQuery = !query || [
        order.order_name,
        order.pickup_location,
        order.drop_off_location,
        order.status,
        order.id ? `order #${order.id}` : "",
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all" ||
        (order.status || "").toLowerCase() === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [allOrders, searchTerm, statusFilter]);

  const displayedOrders = filteredOrders.slice(0, 5);

  const displayName = (
    user?.name ||
    user?.full_name ||
    user?.username ||
    user?.user_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "User"
  ).trim() || "User";

  const quickActions = [
    { name: 'Create Order', color: '#38bdf8', count: 'New', path: '/dashboard/create-order' },
    { name: 'Track Orders', color: '#38bdf8', count: activeOrdersCount, path: '/dashboard/track-order' },
    { name: 'My Orders', color: '#38bdf8', count: totalOrdersCount, path: '/dashboard/view-orders' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"></div>
          <h3 className="logo">SendIT</h3>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon"><i className="bx bx-dashboard"></i></span>
            <span>Dashboard</span>
          </button>
          <Link to="/dashboard/create-order" className="nav-item">
            <span className="nav-icon"></span>
            <span>Create Order</span>
          </Link>
          <Link to="/dashboard/view-orders" className="nav-item">
            <span className="nav-icon"></span>
            <span>My Orders</span>
          </Link>
          <Link to="/dashboard/track-order" className="nav-item">
            <span className="nav-icon"></span>
            <span>Track Order</span>
          </Link>
          <button
            className={activeTab === 'profile' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon"><i className="bx bx-user-circle"></i></span>
            <span>Profile</span>
          </button>
          <div className="nav-divider"></div>
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon"><i class="bx bx-arrow-out-right-square-half" /></span>
            <span>Logout</span>
          </button>
        </nav>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="search-controls">
              <div className="search-input-wrapper">
                <input
                  type="search"
                  placeholder="Search deliveries..."
                  className="search-bar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                />
                {isSuggestionsOpen && suggestions.length > 0 && (
                  <div className="search-suggestions">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="search-suggestion-item"
                        onMouseDown={() => {
                          setSearchTerm(suggestion);
                          setIsSuggestionsOpen(false);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                className="search-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="header-right">
            <button className="icon-btn"><i className="bx bx-bell"></i></button>
            <div className="user-avatar">{displayName?.[0] || 'U'}</div>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2 className="welcome-text">
                Welcome Back, <span className="welcome-name">{displayName}</span>
              </h2>
              <p className="welcome-subtitle">Track and manage your deliveries with ease</p>
            </div>

            {/* Quick Actions */}
            <div className="section-header">
              <h3>Quick Actions</h3>
              <Link to="/dashboard/create-order" className="view-all-link">Create New →</Link>
            </div>
            <div className="folders-grid">
              {quickActions.map((action, idx) => (
                <Link
                  to={action.path}
                  key={idx}
                  className="folder-card"
                  style={{ '--folder-color': action.color }}
                >
                  <div className="folder-header">
                    {action.icon && <div className="folder-icon">{action.icon}</div>}
                  </div>
                  <h4 className="folder-name">{action.name}</h4>
                  <div className="folder-count">{action.count} {typeof action.count === 'number' ? 'items' : ''}</div>
                </Link>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="section-header">
              <h3>Recent Orders</h3>
              <Link to="/dashboard/view-orders" className="view-all-link">View All →</Link>
            </div>
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Distance</th>
                    <th>Price</th>
                    <th>Weight</th>
                    <th>Size</th>
                    <th>Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td>{order.order_name ? order.order_name : `#${order.id}`}</td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase().replace(' ', '-')}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td>{order.distance?.toFixed(2)} km</td>
                      <td>KES {order.total_price?.toLocaleString()}</td>
                      <td>{order.weight} kg</td>
                      <td>{order.size} cm</td>
                      <td>{order.drop_off_location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayedOrders.length === 0 && (
                <p className="no-orders">No recent orders found.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="profile-wrapper-new">
              <div className="profile-card">
                <h3>My Profile</h3>
                <div className="profile-fields">
                  <div className="profile-field">
                    <label>Name</label>
                    <span>{user?.name}</span>
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <span>{user?.email}</span>
                  </div>
                  <div className="profile-field">
                    <label>Phone</label>
                    <span>{user?.phone_number}</span>
                  </div>
                  <div className="profile-field">
                    <label>Role</label>
                    <span className="role-badge">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
