import React from 'react';
import StatsCard from '../../common/Card/StatsCard';

const StatsGrid = ({ stats, onCardClick }) => {
  const statsConfig = [
    {
      id: 'totalEmployees',
      title: 'Total Empleados',
      value: stats?.totalEmployees || 0,
      icon: 'users',
      color: 'bg-blue-500',
      textColor: 'text-blue-100'
    },
    {
      id: 'pendingRequests',
      title: 'Solicitudes Pendientes',
      value: stats?.pendingRequests || 0,
      icon: 'clock',
      color: 'bg-orange-500',
      textColor: 'text-orange-100'
    },
    {
      id: 'rejectedRequests',
      title: 'Solicitudes Rechazadas',
      value: stats?.rejectedRequests || 0,
      icon: 'x-circle',
      color: 'bg-red-500',
      textColor: 'text-red-100'
    },
    {
      id: 'totalAreas',
      title: 'Total Areas',
      value: stats?.totalAreas || 0,
      icon: 'building',
      color: 'bg-purple-500',
      textColor: 'text-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat) => (
        <StatsCard
          key={stat.id}
          {...stat}
          onClick={() => onCardClick(stat.id)}
        />
      ))}
    </div>
  );
};

export default StatsGrid;