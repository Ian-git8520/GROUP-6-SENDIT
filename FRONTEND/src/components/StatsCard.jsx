import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, change, icon: Icon, gradient }) => {
    const isPositive = change >= 0;

    return (
        <div className={`stats-card ${gradient}`}>
            <div className="stats-header">
                <div className="stats-icon">
                    <Icon size={24} />
                </div>
                <div className={`stats-trend ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>
            <div className="stats-body">
                <h3 className="stats-value">{value}</h3>
                <p className="stats-title">{title}</p>
            </div>
        </div>
    );
};

export default StatsCard;
