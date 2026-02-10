import React, { useState, useEffect } from 'react';
import { Search, BikeIcon, Phone, User } from 'lucide-react';
import { riderAPI } from '../api';

const RidersTab = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      (rider.phone_number && rider.phone_number.includes(searchTerm));
    return matchesSearch;
  });

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
        <button className="add-btn">
          <BikeIcon size={18} />
          <span>Add Rider</span>
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>User ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRiders.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No riders found</td>
              </tr>
            ) : (
              filteredRiders.map((rider) => (
                <tr key={rider.id}>
                  <td>#{rider.id}</td>
                  <td>
                    <div className="rider-name">
                      <User size={16} />
                      {rider.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <Phone size={14} />
                      {rider.phone_number || 'N/A'}
                    </div>
                  </td>
                  <td>{rider.user_id ? `#${rider.user_id}` : 'N/A'}</td>
                  <td>
                    <span className="status-badge active">ACTIVE</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View Details">
                        <BikeIcon size={16} />
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

export default RidersTab;
