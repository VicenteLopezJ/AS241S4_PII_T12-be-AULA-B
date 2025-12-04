import React from 'react';
import ProgressBar from '../../common/ProgressBar/ProgressBar';

const EmployeeItem = ({ employee, onClick }) => {
  const { name, position, progress, status } = employee;

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'text-green-400',
      ON_LEAVE: 'text-yellow-400',
      INACTIVE: 'text-red-400'
    };
    return colors[status] || 'text-slate-400';
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-white">{name}</h4>
          <p className="text-sm text-slate-400">{position}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <ProgressBar value={progress} className="w-16" />
            <span className="text-sm text-slate-300">{progress}%</span>
          </div>
          <span className={`text-xs ${getStatusColor(status)}`}>
            {status === 'ACTIVE' ? 'Activo' : status === 'ON_LEAVE' ? 'En Permiso' : 'Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeItem;