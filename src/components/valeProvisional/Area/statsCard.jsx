import React from 'react';
import '../../../styles/valeProvisional/area/statsCard.css';

const StatsCard = ({ title, value, icon, variant = "default", loading = false }) => {
  if (loading) {
    return (
      <div className="stats-card stats-loading">
        <div className="stats-skeleton"></div>
        <div className="stats-skeleton-title"></div>
      </div>
    );
  }

  return (
    <div className={`stats-card stats-${variant}`}>
      <div className="stats-content">
        <div className="stats-main">
          {icon && <div className="stats-icon">{icon}</div>}
          <h3 className="stats-value">{value}</h3>
        </div>
        <p className="stats-title">{title}</p>
      </div>
      {variant !== 'default' && <div className="stats-decoration"></div>}
    </div>
  );
};

export default StatsCard;