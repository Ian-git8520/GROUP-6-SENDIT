import React from 'react';

const OverviewTab = ({ loading }) => {
    if (loading) {
        return <div className="loading-state">Loading analytics...</div>;
    }

    return <div className="overview-tab" />;
};

export default OverviewTab;