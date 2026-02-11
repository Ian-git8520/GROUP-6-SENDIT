import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { riderAPI } from '../api';

const RidersTab = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRider, setSelectedRider] = useState(null);
  const pageSize = 8;

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await riderAPI.getRiders();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch riders');
      }

      const data = await res.json();
      setRiders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching riders:", err);
      setError(err.message);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter((rider) => {
    const matchesSearch =
      (rider.name && rider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rider.email && rider.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRiders.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRiders = filteredRiders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getRoleBadge = () => {
    return <span className="role-badge rider-badge">RIDER</span>;
  };

  if (loading) {
    return <div className="loading-state">Loading riders...</div>;
  }

  if (error) {
    return (
      <div className="loading-state" style={{ color: 'var(--accent-red)' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="riders-tab">
      <div className="table-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search riders..."
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
            {filteredRiders.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No riders found</td>
              </tr>
            ) : (
              paginatedRiders.map((rider) => (
                <tr key={rider.id}>
                  <td>#{rider.id}</td>
                  <td>{rider.name || 'N/A'}</td>
                  <td>
                    <div className="email-cell">
                      {rider.email || 'N/A'}
                    </div>
                  </td>
                  <td>{rider.phone_number || 'N/A'}</td>
                  <td>{getRoleBadge()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => setSelectedRider(rider)}
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

      {selectedRider && (
        <div className="modal-overlay" onClick={() => setSelectedRider(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rider Details</h3>
            <div className="modal-body">
              <p><strong>Rider ID:</strong> #{selectedRider.id}</p>
              <p><strong>Name:</strong> {selectedRider.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedRider.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedRider.phone_number || 'N/A'}</p>
              <p><strong>Role:</strong> Rider</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedRider(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RidersTab;
