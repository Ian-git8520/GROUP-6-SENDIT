import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Truck } from 'lucide-react';
import { deliveryAPI } from '../api';

const DeliveriesTab = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    useEffect(() => {
        fetchDeliveries();
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

    const filteredDeliveries = deliveries.filter((delivery) => {
        const matchesSearch =
            delivery.id.toString().includes(searchTerm) ||
            (delivery.pickup_location && delivery.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (delivery.drop_off_location && delivery.drop_off_location.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'status-badge pending',
            accepted: 'status-badge accepted',
            in_transit: 'status-badge in-transit',
            delivered: 'status-badge delivered',
            cancelled: 'status-badge cancelled',
        };
        return (
            <span className={statusClasses[status] || 'status-badge'}>
                {status.replace('_', ' ').toUpperCase()}
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
                    <Filter size={20} />
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

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Distance</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Customer</th>
                            <th>Rider</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDeliveries.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">No deliveries found</td>
                            </tr>
                        ) : (
                            filteredDeliveries.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td>#{delivery.id}</td>
                                    <td>{delivery.pickup_location}</td>
                                    <td>{delivery.drop_off_location}</td>
                                    <td>{delivery.distance} km</td>
                                    <td>${delivery.total_price}</td>
                                    <td>{getStatusBadge(delivery.status)}</td>
                                    <td>User #{delivery.user_id}</td>
                                    <td>{delivery.rider_id ? `Rider #${delivery.rider_id}` : 'Unassigned'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn view"
                                                onClick={() => setSelectedDelivery(delivery)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {delivery.status === 'pending' && (
                                                <button
                                                    className="action-btn approve"
                                                    onClick={() => updateDeliveryStatus(delivery.id, 'accepted')}
                                                    title="Accept"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            {delivery.status === 'accepted' && (
                                                <button
                                                    className="action-btn transit"
                                                    onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                                                    title="Mark In Transit"
                                                >
                                                    <Truck size={16} />
                                                </button>
                                            )}
                                            {delivery.status === 'in_transit' && (
                                                <button
                                                    className="action-btn complete"
                                                    onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                                                    title="Mark Delivered"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
                            <p><strong>Total Price:</strong> ${selectedDelivery.total_price}</p>
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
        </div>
    );
};

export default DeliveriesTab;
