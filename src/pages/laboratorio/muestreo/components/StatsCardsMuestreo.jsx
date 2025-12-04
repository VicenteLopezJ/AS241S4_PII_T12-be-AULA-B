import React from 'react';

export default function StatsCardsMuestreo({ list = [] }) {
  const total = (list || []).length;
  const activos = (list || []).filter(i => (i.estado || '').toString().toLowerCase().includes('aprob')).length;
  const muestreadores = Array.from(new Set((list || []).map(i => i.muestreador))).filter(Boolean).length;
  const procesadas = (list || []).filter(i => (i.estado || '').toString().toLowerCase() === 'aprobada').length;

  const card = (title, value, iconBg, icon) => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between min-h-[110px]">
      <div>
        <div className="text-base lg:text-sm text-gray-600 font-medium">{title}</div>
        <div className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">{value}</div>
      </div>
      <div className={`w-14 h-14 flex items-center justify-center rounded-full ${iconBg}`}>
        <span className="text-white text-2xl font-bold">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
      {card('Total Muestreos', total.toLocaleString(), 'bg-blue-500', '📋')}
      {card('Muestreos Activos', activos.toLocaleString(), 'bg-green-500', '🟢')}
      {card('Muestras Procesadas', procesadas.toLocaleString(), 'bg-purple-500', '🧪')}
      {card('Muestreadores', muestreadores.toLocaleString(), 'bg-teal-500', '👷')}
    </div>
  );
}
