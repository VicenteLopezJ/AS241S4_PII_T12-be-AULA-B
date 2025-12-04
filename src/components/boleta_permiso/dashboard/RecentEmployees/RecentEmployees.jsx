import React from 'react';
import EmployeeItem from './EmployeeItem';

const RecentEmployees = ({ employees, onEmployeeClick }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Expedientes Recientes</h3>
        <p className="text-slate-400 text-sm mt-1">Empleados agregados recientemente al sistema</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {employees?.map((employee) => (
            <EmployeeItem
              key={employee.employeeId}
              employee={employee}
              onClick={() => onEmployeeClick(employee.employeeId)}
            />
          )) || (
            <p className="text-slate-400 text-center py-4">No hay empleados recientes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentEmployees;