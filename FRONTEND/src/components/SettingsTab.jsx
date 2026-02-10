import React from 'react';

const SettingsTab = ({ admin }) => {
  return (
    <div className="settings-tab">
      <div className="settings-card">
        <h3>System Settings</h3>
        <div className="settings-options">
          <div className="setting-item">
            <div>
              <h4>Email Notifications</h4>
              <p>Receive email alerts for new deliveries</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div>
              <h4>SMS Alerts</h4>
              <p>Get SMS notifications for urgent updates</p>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div>
              <h4>Auto-assign Deliveries</h4>
              <p>Automatically assign deliveries to available riders</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
