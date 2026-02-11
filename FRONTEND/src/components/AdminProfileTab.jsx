import React from 'react';

const AdminProfileTab = ({ admin }) => {
    return (
        <div className="dashboard-content">
            <div className="profile-wrapper-new">
                <div className="profile-card">
                    <h3>My Profile</h3>
                    <div className="profile-fields">
                        <div className="profile-field">
                            <label>Name</label>
                            <span>{admin?.name || 'N/A'}</span>
                        </div>
                        <div className="profile-field">
                            <label>Email</label>
                            <span>{admin?.email || 'N/A'}</span>
                        </div>
                        <div className="profile-field">
                            <label>Phone</label>
                            <span>{admin?.phone_number || 'N/A'}</span>
                        </div>
                        <div className="profile-field">
                            <label>Role</label>
                            <span className="role-badge">ADMINISTRATOR</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileTab;
