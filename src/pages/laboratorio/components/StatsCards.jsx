import React, { useEffect, useState } from 'react';
import { Users, FileText, UserCheck, DollarSign } from 'lucide-react';
import { getCompanies, getCotizaciones } from '../../../services/laboratorio/api';

const StatsCards = () => {
  const [stats, setStats] = useState({ empresas: 0, cotizaciones: 0, activos: 0, facturacion: 0 });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [companiesRaw, cotizacionesRaw] = await Promise.all([getCompanies(), getCotizaciones()]);

        const companies = Array.isArray(companiesRaw) ? companiesRaw : (companiesRaw && companiesRaw.data ? companiesRaw.data : []);
        const cotizaciones = Array.isArray(cotizacionesRaw) ? cotizacionesRaw : (cotizacionesRaw && cotizacionesRaw.data ? cotizacionesRaw.data : []);

        const empresasCount = companies.length;
        // Determine active companies: try common fields
        const activosCount = companies.filter(c => {
          const raw = c.status ?? c.estado ?? c.estadoEmpresa ?? '';
          const status = (raw || '').toString().toLowerCase().trim();
          // Exact checks: avoid matching 'inactivo' by using exact equality or whole-word regex
          if (status === 'activo' || status === 'a' || status === '1') return true;
          if (typeof c.activo === 'boolean') return c.activo === true;
          if (/\bactivo\b/.test(status)) return true;
          return false;
        }).length;

        const cotCount = cotizaciones.length;
        const totalFact = cotizaciones.reduce((s, c) => {
          const n = Number(c.total_pagar ?? c.total ?? c.totalPagar ?? c.importe ?? 0);
          return s + (isNaN(n) ? 0 : n);
        }, 0);

        if (!mounted) return;
        setStats({ empresas: empresasCount, cotizaciones: cotCount, activos: activosCount, facturacion: totalFact });
      } catch (e) {
        if (!mounted) return;
        setStats({ empresas: 0, cotizaciones: 0, activos: 0, facturacion: 0 });
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { title: 'Total Clientes', value: stats.empresas.toLocaleString(), bg: 'bg-blue-500', icon: Users },
    { title: 'Cotizaciones', value: stats.cotizaciones.toLocaleString(), bg: 'bg-green-500', icon: FileText },
    { title: 'Clientes Activos', value: stats.activos.toLocaleString(), bg: 'bg-emerald-500', icon: UserCheck },
    { title: 'Facturación Total', value: `S/. ${Number(stats.facturacion || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bg: 'bg-purple-500', icon: DollarSign }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 min-h-[110px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-2">{c.title}</p>
                <p className="text-3xl lg:text-4xl font-extrabold text-gray-900">{c.value}</p>
              </div>
              <div className={`${c.bg} p-4 rounded-lg shadow-sm flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;