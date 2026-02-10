import React, { useState } from 'react';
import { User, Mail, Shield, Edit2, Save } from 'lucide-react';

const AdminProfileTab = ({ admin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: admin?.name || '',
        email: admin?.email || '',
        phone: admin?.phone || ''
    });

    const handleSave = () => {
        // TODO: Implement API call to update admin profile
        console.log('Saving admin profile:', formData);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="tab-content">
            <div className="tab-header">
                <div>
                    <h2>Admin Profile</h2>
                    <p>Manage your administrator account information</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                    {isEditing ? (
                        <>
                            <Save size={18} />
                            Save Changes
                        </>
                    ) : (
                        <>
                            <Edit2 size={18} />
                            Edit Profile
                        </>
                    )}
                </button>
            </div>

            <div className="settings-grid">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <User className="card-icon" />
                        <h3>Profile Information</h3>
                    </div>
                    <div className="settings-card-body">
                        <div className="profile-info-item">
                            <User className="info-icon" size={20} />
                            <div className="info-content">
                                <label>NAME</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <p>{admin?.name || 'N/A'}</p>
                                )}
                            </div>
                        </div>

                        <div className="profile-info-item">
                            <Mail className="info-icon" size={20} />
                            <div className="info-content">
                                <label>EMAIL</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <p>{admin?.email || 'N/A'}</p>
                                )}
                            </div>
                        </div>

                        <div className="profile-info-item">
                            <Shield className="info-icon" size={20} />
                            <div className="info-content">
                                <label>ROLE</label>
                                <div className="role-badge admin-badge">ADMINISTRATOR</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="settings-card-header">
                        <Shield className="card-icon" />
                        <h3>Account Security</h3>
                    </div>
                    <div className="settings-card-body">
                        <div className="profile-info-item">
                            <div className="info-content" style={{ marginLeft: 0 }}>
                                <label>PASSWORD</label>
                                <button className="btn-secondary" style={{ marginTop: '8px' }}>
                                    Change Password
                                </button>
                            </div>
                        </div>

                        <div className="profile-info-item">
                            <div className="info-content" style={{ marginLeft: 0 }}>
                                <label>TWO-FACTOR AUTHENTICATION</label>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                    <span style={{ fontSize: '14px', opacity: 0.7 }}>Not enabled</span>
                                    <button className="btn-secondary" style={{ marginLeft: '12px' }}>
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="settings-card-header">
                        <User className="card-icon" />
                        <h3>Session Information</h3>
                    </div>
                    <div className="settings-card-body">
                        <div className="profile-info-item">
                            <div className="info-content" style={{ marginLeft: 0 }}>
                                <label>USER ID</label>
                                <p>{admin?.id || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="profile-info-item">
                            <div className="info-content" style={{ marginLeft: 0 }}>
                                <label>LAST LOGIN</label>
                                <p>Today at {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>

                        <div className="profile-info-item">
                            <div className="info-content" style={{ marginLeft: 0 }}>
                                <label>ACCOUNT STATUS</label>
                                <span className="status-badge active">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileTab;
