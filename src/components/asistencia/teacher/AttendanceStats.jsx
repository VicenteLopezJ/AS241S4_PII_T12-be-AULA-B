import React from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const AttendanceStats = ({ attendances = [] }) => {
  // Calcular estadísticas completas desde las asistencias reales
  const total = attendances.length;
  const present = attendances.filter(a => a.status === 'P').length;
  const late = attendances.filter(a => a.status === 'L').length;
  const absent = attendances.filter(a => a.status === 'A').length;
  const justified = attendances.filter(a => a.status === 'J').length;

  // Calcular porcentajes
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePercentage = total > 0 ? Math.round((late / total) * 100) : 0;
  const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0;
  const justifiedPercentage = total > 0 ? Math.round((justified / total) * 100) : 0;
  
  // Calcular porcentaje de asistencia general (Presentes + Justificados)
  const attendancePercentage = total > 0 ? Math.round(((present + justified) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div className="bg-slate-300 p-4 rounded-xl text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Total Registros</p>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs opacity-70 mt-1">{attendancePercentage}% de asistencia</p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-slate-300 p-4 rounded-xl text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Presentes</p>
            <p className="text-2xl font-bold text-green-600">{present}</p>
            <p className="text-xs opacity-70 mt-1">{presentPercentage}%</p>
          </div>
          <UserGroupIcon className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div className="bg-slate-300 p-4 rounded-xl text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Tardes</p>
            <p className="text-2xl font-bold text-yellow-600">{late}</p>
            <p className="text-xs opacity-70 mt-1">{latePercentage}%</p>
          </div>
          <ClockIcon className="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <div className="bg-slate-300 p-4 rounded-xl text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Ausentes</p>
            <p className="text-2xl font-bold text-red-600">{absent}</p>
            <p className="text-xs opacity-70 mt-1">{absentPercentage}%</p>
          </div>
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="bg-slate-300 p-4 rounded-xl text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Justificados</p>
            <p className="text-2xl font-bold text-blue-600">{justified}</p>
            <p className="text-xs opacity-70 mt-1">{justifiedPercentage}%</p>
          </div>
          <DocumentCheckIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-slate-300 p-4 rounded-xl text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Asistencia Total</p>
            <p className="text-2xl font-bold text-purple-600">{attendancePercentage}%</p>
            <p className="text-xs opacity-70 mt-1">
              {present + justified} de {total}
            </p>
          </div>
          <ChartPieIcon className="w-8 h-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;