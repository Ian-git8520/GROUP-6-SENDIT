import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Shield } from 'lucide-react';
import { userAPI } from '../api';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.getUsers();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const roleName = user.role_name || (user.role_id === 1 ? "admin" : user.role_id === 3 ? "rider" : "customer");
    // Only show customers
    const isCustomer = roleName === "customer";
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return isCustomer && matchesSearch;
  });

  const getRoleBadge = (roleName) => {
    if (roleName === "admin") {
      return <span className="role-badge admin-badge">ADMIN</span>;
    }
    if (roleName === "rider") {
      return <span className="role-badge rider-badge">RIDER</span>;
    }
    return <span className="role-badge customer-badge">CUSTOMER</span>;
  };

  if (loading) {
    return <div className="loading-state">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="loading-state" style={{ color: 'var(--accent-red)' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="users-tab">
      <div className="table-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn">
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name || 'N/A'}</td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {user.email || 'N/A'}
                    </div>
                  </td>
                  <td>{user.phone_number || 'N/A'}</td>
                  <td>{getRoleBadge(user.role_name || (user.role_id === 1 ? "admin" : user.role_id === 3 ? "rider" : "customer"))}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View Details">
                        <Shield size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
