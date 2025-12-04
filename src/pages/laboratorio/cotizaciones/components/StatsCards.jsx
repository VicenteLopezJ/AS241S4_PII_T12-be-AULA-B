import React, { useEffect, useState } from 'react';
import { getCotizaciones } from '../../../../services/laboratorio/cotizacionesApi';

export default function StatsCards() {
  const [stats, setStats] = useState({ total: 0, activos: 0, totalFacturacion: 0, empresas: 0 });

  useEffect(() => {
    let mounted = true;
    getCotizaciones()
      .then(list => {
        if (!mounted) return;
        const total = list.length;
        const activos = list.filter(c => c.estado && c.estado.toLowerCase().includes('act')).length;
        const totalFacturacion = list.reduce((s, c) => s + (Number(c.total_pagar) || 0), 0);
        const empresas = Array.from(new Set((list || []).map(c => c.id_empresa))).length;
        setStats({ total, activos, totalFacturacion, empresas });
      })
      .catch(() => {
        if (!mounted) return;
        setStats({ total: 0, activos: 0, totalFacturacion: 0, empresas: 0 });
      });
    return () => { mounted = false; };
  }, []);

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {card('Total Clientes', stats.empresas.toLocaleString(), 'bg-blue-500', '👥')}
      {card('Cotizaciones', stats.total.toLocaleString(), 'bg-green-500', '📄')}
      {card('Clientes Activos', stats.activos.toLocaleString(), 'bg-teal-500', '🟢')}
      {card('Facturación Total', `S/. ${Number(stats.totalFacturacion || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`, 'bg-purple-500', '$')}
    </div>
  );
}
