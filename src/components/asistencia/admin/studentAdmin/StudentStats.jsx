// src/components/asistencia/admin/studentAdmin/StudentStats.jsx
import React from 'react';
import '../../../../styles/asistencia/admin/studentAdmin/studentManagement.css';

const StudentStats = ({ stats }) => {
  return (
    <div className="user-stats-grid">
      <div className="stat-card total">
        <span className="stat-number">{stats.total || 0}</span>
        <span className="stat-label">Total Estudiantes</span>
      </div>

      <div className="stat-card active">
        <span className="stat-number">{stats.active || 0}</span>
        <span className="stat-label">Activos</span>
      </div>

      <div className="stat-card inactive">
        <span className="stat-number">{stats.inactive || 0}</span>
        <span className="stat-label">Inactivos</span>
      </div>

      <div className="stat-card graduated">
        <span className="stat-number">{stats.graduated || 0}</span>
        <span className="stat-label">Graduados</span>
      </div>

      <div className="stat-card withdrawn">
        <span className="stat-number">{stats.withdrawn || 0}</span>
        <span className="stat-label">Retirados</span>
      </div>
    </div>
  );
};

export default StudentStats;