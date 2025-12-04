import React from 'react';
import PageShell from '../PageShell.jsx';
import StatsCards from './components/StatsCards.jsx';
import CotizacionesTable from './components/CotizacionesTable.jsx';

export default function CotizacionesPage() {
  return (
    <PageShell title="Cotizaciones" subtitle="Listado de cotizaciones">
      <div className="p-2 md:p-6 w-full">
        <div className="w-full">
          <StatsCards />

          {/* Search / toolbar similar to empresas listing */}
          <div className="mt-6 w-full flex justify-end">
            <div>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold">+ Nuevo Registro</button>
            </div>
          </div>

          <div className="mt-6 w-full">
            <CotizacionesTable />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
