import React from 'react';
import { LogOut } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, adminName }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'deliveries', label: 'Deliveries' },
        { id: 'users', label: 'Users' },
        { id: 'riders', label: 'Riders' },
        { id: 'profile', label: 'Admin Profile' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">SendIT</h2>
                <p className="sidebar-subtitle">Admin Panel</p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="admin-info">
                    <div className="admin-avatar">
                        {adminName?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="admin-details">
                        <p className="admin-name">{adminName || 'Admin'}</p>
                        <p className="admin-role">Administrator</p>
                    </div>
                </div>
                <button className="logout-button" onClick={onLogout}>
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
