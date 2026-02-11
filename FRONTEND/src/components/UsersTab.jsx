import React, { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { userAPI } from '../api';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('customer');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 8;

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
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name || 'N/A'}</td>
                  <td>
                    <div className="email-cell">
                      {user.email || 'N/A'}
                    </div>
                  </td>
                  <td>{user.phone_number || 'N/A'}</td>
                  <td>{getRoleBadge(user.role_name || (user.role_id === 1 ? "admin" : user.role_id === 3 ? "rider" : "customer"))}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => setSelectedUser(user)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div className="pagination-info">
          Page {currentPage} of {totalPages}
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="modal-body">
              <p><strong>User ID:</strong> #{selectedUser.id}</p>
              <p><strong>Name:</strong> {selectedUser.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedUser.phone_number || 'N/A'}</p>
              <p><strong>Role:</strong> {selectedUser.role_name || (selectedUser.role_id === 1 ? "admin" : selectedUser.role_id === 3 ? "rider" : "customer")}</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedUser(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
