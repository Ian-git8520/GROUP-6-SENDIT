import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const OverviewTab = ({ loading }) => {
    const [deliveries, setDeliveries] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        fetch('http://localhost:5001/deliveries', {
            credentials: 'include',
            signal: controller.signal,
        })
            .then((res) => res.json())
            .then((data) => {
                setDeliveries(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (err?.name !== 'AbortError') {
                    console.error('Error fetching deliveries:', err);
                }
            });

        return () => controller.abort();
    }, []);

    const chartData = useMemo(() => {
        // Process data for charts (last 7 days)
        const last7Days = {};
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            last7Days[dateStr] = { date: dateStr, deliveries: 0, revenue: 0 };
        }

        deliveries.forEach((delivery) => {
            const deliveryDate = new Date(delivery.created_at);
            const dateStr = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (last7Days[dateStr]) {
                last7Days[dateStr].deliveries += 1;
                last7Days[dateStr].revenue += Number(delivery.total_price) || 0;
            }
        });

        return Object.values(last7Days);
    }, [deliveries]);

    const statusData = useMemo(() => {
        // Status distribution
        const statusCounts = {};
        deliveries.forEach((d) => {
            statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
        });

        const statusColors = {
            pending: '#fbbf24',
            accepted: '#60a5fa',
            in_transit: '#a78bfa',
            delivered: '#34d399',
            cancelled: '#f87171',
        };

        return Object.entries(statusCounts).map(([name, value]) => ({
            name: name.replace('_', ' ').toUpperCase(),
            value,
            color: statusColors[name] || '#94a3b8',
        }));
    }, [deliveries]);

    const recentDeliveries = deliveries.slice(0, 5);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} className="status-icon pending" />;
            case 'delivered':
                return <CheckCircle size={16} className="status-icon delivered" />;
            case 'cancelled':
                return <XCircle size={16} className="status-icon cancelled" />;
            default:
                return <Package size={16} className="status-icon" />;
        }
    };

    if (loading) {
        return <div className="loading-state">Loading analytics...</div>;
    }

    return (
        <div className="overview-tab">
            <div className="charts-grid">
                {/* Deliveries Trend Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Delivery Trends (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px',
                                    color: '#e5e7eb',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="deliveries"
                                stroke="#38bdf8"
                                fillOpacity={1}
                                fill="url(#colorDeliveries)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Revenue Trends (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px',
                                    color: '#e5e7eb',
                                }}
                            />
                            <Bar dataKey="revenue" fill="#34d399" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution Pie Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Delivery Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px',
                                    color: '#e5e7eb',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="chart-card">
                    <h3 className="chart-title">Recent Deliveries</h3>
                    <div className="recent-deliveries-list">
                        {recentDeliveries.length === 0 ? (
                            <p className="no-data">No recent deliveries</p>
                        ) : (
                            recentDeliveries.map((delivery) => (
                                <div key={delivery.id} className="recent-delivery-item">
                                    <div className="delivery-info">
                                        {getStatusIcon(delivery.status)}
                                        <div>
                                            <p className="delivery-id">Order #{delivery.id}</p>
                                            <p className="delivery-route">
                                                {delivery.pickup_location} → {delivery.drop_off_location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="delivery-price">${delivery.total_price}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;