import React from 'react';
import {
    LayoutDashboard,
    Package,
    Users,
    Bike,
    Settings,
    User,
    LogOut
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, adminName }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'deliveries', label: 'Deliveries', icon: Package },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'riders', label: 'Riders', icon: Bike },
        { id: 'profile', label: 'Admin Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">SendIT</h2>
                <p className="sidebar-subtitle">Admin Panel</p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
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
