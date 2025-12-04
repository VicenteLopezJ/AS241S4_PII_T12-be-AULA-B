import React, { useEffect, useState } from 'react';
import { getCotizaciones } from '../../../../services/laboratorio/cotizacionesApi';

const BASE = 'https://as241s4-pii-t06-be.onrender.com/api';

export default function CotizacionesTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // global loading removed — use local `loading` state

  useEffect(() => {
    let mounted = true;
    // Fetch cotizaciones and empresas to show company name
    Promise.all([
      getCotizaciones(),
      fetch(`${BASE}/empresas/`).then(r => r.ok ? r.json() : [])
    ])
    .then(([cotizaciones, empresas]) => {
      if (!mounted) return;
      // build map of empresas by multiple possible id keys and store display name
      const empresasMap = {};
      (empresas || []).forEach(e => {
        const name = e.razon_social || e.razonSocial || e.name || e.nombre || e.razon || (e.razon_social === 0 ? '0' : undefined) || null;
        const display = name || e.id_empresa || e.id || e.idEmpresa || JSON.stringify(e);
        const keys = [e.id_empresa, e.id, e.idEmpresa, e.ID, e.idEmpresaDB];
        keys.forEach(k => {
          if (typeof k !== 'undefined' && k !== null) {
            empresasMap[k] = display;
            empresasMap[String(k)] = display;
          }
        });
      });
      // attach empresaNombre to each cotizacion using robust lookup and keep raw id
      const enriched = (cotizaciones || []).map(c => {
        const rawId = c.id_empresa ?? c.idEmpresa ?? c.empresa_id ?? c.id ?? null;
        const empresaNombre = empresasMap[rawId] || empresasMap[String(rawId)] || (rawId === null ? '' : rawId);
        return ({ ...c, empresaNombre, _empresaRawId: rawId });
      });

      // find which raw ids still show as numeric (no matching name) and fetch them individually
      const missingIds = Array.from(new Set(enriched
        .map(e => e._empresaRawId)
        .filter(id => id !== null && typeof empresasMap[id] === 'undefined' && typeof empresasMap[String(id)] === 'undefined')
      ));

      if (missingIds.length > 0) {
        // fetch each empresa by id and update empresasMap
        Promise.all(missingIds.map(id =>
          fetch(`${BASE}/empresas/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )).then(results => {
          results.forEach((res, idx) => {
            const id = missingIds[idx];
            if (res) {
              const name = res.razon_social || res.razonSocial || res.name || res.nombre || res.razon || null;
              empresasMap[id] = name || res.razon_social || res.id || id;
              empresasMap[String(id)] = empresasMap[id];
            }
          });
          // rebuild final enriched list with resolved names
          const finalEnriched = enriched.map(e => ({ ...e, empresaNombre: empresasMap[e._empresaRawId] || empresasMap[String(e._empresaRawId)] || e.empresaNombre }));
          setData(finalEnriched);
        }).catch(() => {
          setData(enriched);
        });
      } else {
        setData(enriched);
      }
    }).catch(err => { console.error(err); if (mounted) setData([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Cargando cotizaciones...</div>;

  if (!loading && data.length === 0) return <div className="p-8 text-center text-gray-400">No hay cotizaciones para mostrar.</div>;

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Empresas con Cotizaciones Completadas</h3>
          <div>
            <button className="text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-md">Recargar</button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Atención</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Moneda</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((c) => {
                // format date if possible
                let fecha = c.fecha_cotizacion;
                try {
                  const d = new Date(c.fecha_cotizacion);
                  if (!Number.isNaN(d.getTime())) fecha = d.toLocaleDateString();
                } catch (e) { /* keep original */ }

                const total = Number(c.total_pagar || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                // moneda display: prefer explicit field, map common cases to symbol/label
                const rawMoneda = (c.moneda || c.tipo_moneda || c.moneda_tipo || '').toString();
                const monedaLower = rawMoneda.toLowerCase();
                let monedaLabel = rawMoneda;
                if (!monedaLabel) {
                  // try to infer from other fields
                  if (c.moneda === undefined && c.tipo_cambio !== undefined) {
                    monedaLabel = '';
                  }
                }
                let monedaSymbol = '';
                if (monedaLower.includes('nuevo') || monedaLower.includes('sol')) monedaSymbol = 'S/.';
                else if (monedaLower.includes('dólar') || monedaLower.includes('dolar') || monedaLower.includes('usd')) monedaSymbol = '$';
                const monedaDisplay = monedaLabel ? (monedaSymbol ? `${monedaLabel} (${monedaSymbol})` : monedaLabel) : (monedaSymbol || '');

                // estado badge
                const estado = (c.estado || '').toString();
                const estadoUpper = estado.toUpperCase();
                const estadoClass = estadoUpper.includes('ACT') ? 'bg-green-100 text-green-800' : (estadoUpper.includes('INACT') ? 'bg-gray-100 text-gray-800' : (estadoUpper.includes('ANUL') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'));

                return (
                  <tr key={c.num_cotizacion} className="hover:bg-gray-50">
                    <td className="px-6 py-5 whitespace-nowrap text-base font-semibold text-gray-700">{c.num_cotizacion}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-semibold text-gray-700">{c.empresaNombre || c.id_empresa}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-600">{c.atencion}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-600">{fecha}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-semibold text-gray-700">S/. {total}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{monedaDisplay}</td>
                    <td className="px-6 py-5 whitespace-nowrap"><span className={`px-3 py-1 rounded text-sm font-semibold ${estadoClass}`}>{estado}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
