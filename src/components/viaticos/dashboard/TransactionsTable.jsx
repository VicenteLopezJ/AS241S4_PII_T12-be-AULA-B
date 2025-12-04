import React from 'react';

export const TransactionsTable = ({ transactions }) => {
  // Función para traducir estado
  const getEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'p':
      case 'pendiente':
        return { label: 'Pendiente', color: 'bg-yellow-100 text-slate-900' };
      case 'r':
      case 'rechazado':
        return { label: 'Rechazado', color: 'bg-red-200 text-slate-900' };
      case 'a':
      case 'aprobado':
        return { label: 'Aprobado', color: 'bg-cyan-200 text-slate-900' };
      default:
        return { label: estado || 'Desconocido', color: 'bg-slate-400 text-slate-900' };
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg h-full">
      <div className="mb-6">
        <h3 className="text-white font-bold text-lg">Transacciones recientes</h3>
        <p className="text-slate-400 text-sm">Vista previa de las transacciones</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
            <tr>
              <th className="pb-3 font-medium">Trabajador</th>
              <th className="pb-3 font-medium">Destino</th>
              <th className="pb-3 font-medium">Monto estimado</th>
              <th className="pb-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {transactions.slice(0, 4).map((item, index) => {
              const estadoInfo = getEstado(item.estado);
              return (
                <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 font-medium text-slate-200">{item.trabajador}</td>
                  <td className="py-4">{item.destino}</td>
                  <td className="py-4">{item.monto}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${estadoInfo.color}`}>
                      {estadoInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-center">
        <button className="text-emerald-400 text-sm hover:text-emerald-300 font-medium hover:underline underline-offset-4">
          Mostrar más solicitudes
        </button>
      </div>
    </div>
  );
};