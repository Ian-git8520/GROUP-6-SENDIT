import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { deliveryAPI, riderAPI } from '../api';

const DeliveriesTab = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [assigningDelivery, setAssigningDelivery] = useState(null);
    const [selectedRiderId, setSelectedRiderId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    useEffect(() => {
        fetchDeliveries();
    }, []);

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await deliveryAPI.getDeliveries();

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch deliveries');
            }

            const data = await res.json();
            setDeliveries(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching deliveries:", err);
            setError(err.message);
            setDeliveries([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRiders = async () => {
        try {
            const res = await riderAPI.getRiders();

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch riders');
            }

            const data = await res.json();
            setRiders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching riders:', err);
            setRiders([]);
        }
    };

    const updateDeliveryStatus = async (deliveryId, newStatus) => {
        try {
            const res = await deliveryAPI.updateDelivery(deliveryId, { status: newStatus });

            if (res.ok) {
                fetchDeliveries();
                alert(`Delivery #${deliveryId} status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error('Error updating delivery:', err);
            alert('Failed to update delivery status');
        }
    };

    const handleAssignRider = async () => {
        if (!assigningDelivery || !selectedRiderId) {
            alert('Please select a rider first');
            return;
        }

        try {
            const payload = {
                rider_id: Number(selectedRiderId),
                status: assigningDelivery.status === 'pending' ? 'accepted' : assigningDelivery.status,
            };
            const res = await deliveryAPI.updateDelivery(assigningDelivery.id, payload);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to assign rider');
            }

            await fetchDeliveries();
            setAssigningDelivery(null);
            setSelectedRiderId('');
        } catch (err) {
            console.error('Error assigning rider:', err);
            alert(err.message || 'Failed to assign rider');
        }
    };

    const filteredDeliveries = deliveries.filter((delivery) => {
        const matchesSearch =
            delivery.id.toString().includes(searchTerm) ||
            (delivery.pickup_location && delivery.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (delivery.drop_off_location && delivery.drop_off_location.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredDeliveries.length / pageSize));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedDeliveries = filteredDeliveries.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const riderLookup = riders.reduce((acc, rider) => {
        acc[rider.id] = rider;
        return acc;
    }, {});

    const getRiderLabel = (riderId) => {
        const rider = riderLookup[riderId];
        if (!rider) {
            return `Rider #${riderId}`;
        }
        return rider.name ? `${rider.name} (Rider #${riderId})` : `Rider #${riderId}`;
    };

    const getStatusBadge = (status) => {
        const statusKey = (status || 'pending').toLowerCase().replace(' ', '-');
        const label = statusKey.replace(/[_-]/g, ' ');
        const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
        return (
            <span className={`status-badge ${statusKey}`}>
                {formattedLabel}
            </span>
        );
    };

    if (loading) {
        return <div className="loading-state">Loading deliveries...</div>;
    }

    if (error) {
        return (
            <div className="loading-state" style={{ color: 'var(--accent-red)' }}>
                Error: {error}
            </div>
        );
    }

    return (
        <div className="deliveries-tab">
            <div className="table-controls">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search deliveries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Status</th>
                            <th>Distance</th>
                            <th>Price</th>
                            <th>Destination</th>
                            <th>Rider</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDeliveries.map((delivery) => (
                            <tr key={delivery.id}>
                                <td>{delivery.order_name ? delivery.order_name : `#${delivery.id}`}</td>
                                <td>{getStatusBadge(delivery.status)}</td>
                                <td>{delivery.distance ? `${Number(delivery.distance).toFixed(2)} km` : 'N/A'}</td>
                                <td>KES {delivery.total_price ? Number(delivery.total_price).toLocaleString() : '0.00'}</td>
                                <td>{delivery.drop_off_location || 'N/A'}</td>
                                <td>{delivery.rider_id ? getRiderLabel(delivery.rider_id) : 'Unassigned'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="action-btn view"
                                            onClick={() => setSelectedDelivery(delivery)}
                                            title="View Details"
                                        >
                                            View
                                        </button>
                                        {!delivery.rider_id && (
                                            <button
                                                className="action-btn assign"
                                                onClick={() => {
                                                    setAssigningDelivery(delivery);
                                                    setSelectedRiderId('');
                                                }}
                                                title="Assign Rider"
                                            >
                                                Assign
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedDeliveries.length === 0 && (
                    <p className="no-orders">No deliveries found.</p>
                )}
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

            {selectedDelivery && (
                <div className="modal-overlay" onClick={() => setSelectedDelivery(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Delivery Details</h3>
                        <div className="modal-body">
                            <p><strong>Order ID:</strong> #{selectedDelivery.id}</p>
                            <p><strong>Status:</strong> {getStatusBadge(selectedDelivery.status)}</p>
                            <p><strong>Pickup:</strong> {selectedDelivery.pickup_location}</p>
                            <p><strong>Drop-off:</strong> {selectedDelivery.drop_off_location}</p>
                            <p><strong>Distance:</strong> {selectedDelivery.distance} km</p>
                            <p><strong>Weight:</strong> {selectedDelivery.weight} kg</p>
                            <p><strong>Size:</strong> {selectedDelivery.size} cm³</p>
                            <p><strong>Total Price:</strong> KES {Number(selectedDelivery.total_price || 0).toLocaleString()}</p>
                            <p><strong>Customer ID:</strong> {selectedDelivery.user_id}</p>
                            <p><strong>Rider ID:</strong> {selectedDelivery.rider_id || 'Not assigned'}</p>
                            <p><strong>Created:</strong> {new Date(selectedDelivery.created_at).toLocaleString()}</p>
                        </div>
                        <button className="modal-close" onClick={() => setSelectedDelivery(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {assigningDelivery && (
                <div className="modal-overlay" onClick={() => setAssigningDelivery(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Assign Rider</h3>
                        <div className="modal-body assign-form">
                            <label htmlFor="assign-rider">Rider</label>
                            <select
                                id="assign-rider"
                                className="assign-select"
                                value={selectedRiderId}
                                onChange={(e) => setSelectedRiderId(e.target.value)}
                            >
                                <option value="">Select a rider</option>
                                {riders.map((rider) => (
                                    <option key={rider.id} value={rider.id}>
                                        {rider.name || `Rider #${rider.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="assign-actions">
                            <button className="btn-secondary" onClick={() => setAssigningDelivery(null)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleAssignRider}>
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveriesTab;
