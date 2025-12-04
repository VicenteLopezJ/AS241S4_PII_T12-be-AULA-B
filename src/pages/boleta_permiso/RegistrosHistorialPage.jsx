// src/pages/boleta_permiso/RegistrosHistorialPage.jsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, FileText, Search } from 'lucide-react';
import { registroAsistenciaService } from '../../services/boleta_permiso/registroAsistenciaService';

const RegistrosHistorialPage = () => {
  const [registrosHistorial, setRegistrosHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [mostrarModalDetallesRegistro, setMostrarModalDetallesRegistro] = useState(false);
  const [registroConDetalles, setRegistroConDetalles] = useState(null);

  const cargarRegistros = async () => {
    setLoading(true);
    try {
      const registros = await registroAsistenciaService.getAllRegistros();
      setRegistrosHistorial(registros || []);
    } catch (e) {
      console.error('Error al cargar registros de asistencia', e);
      alert('Error al cargar registros de asistencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const handleVerDetallesRegistro = async (registro) => {
    try {
      const data = await registroAsistenciaService.getRegistroById(registro.id_registro);
      setRegistroConDetalles(data);
      setMostrarModalDetallesRegistro(true);
    } catch (e) {
      console.error('Error al obtener detalles del registro', e);
      alert(e.message || 'Error al obtener detalles del registro');
    }
  };

  const handleCerrarModalDetallesRegistro = () => {
    setMostrarModalDetallesRegistro(false);
    setRegistroConDetalles(null);
  };

  const handleAbrirPdfRegistro = (registro) => {
    if (!registro?.id_registro) return;
    const url = `/rrhh/registros/${registro.id_registro}/print`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const registrosFiltrados = registrosHistorial.filter((reg) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const idText = String(reg.id_registro || '').toLowerCase();
    const numeroText = String(reg.numero_registro || '').toLowerCase();
    return idText.includes(term) || numeroText.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Registros en el sistema</h1>
          <p className="text-gray-400 text-sm">
            Historial de registros de asistencia grabados en el sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID o número de registro"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
        {!loading && registrosFiltrados.length === 0 && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <AlertCircle className="w-4 h-4" />
            <span>No hay registros que coincidan con la búsqueda.</span>
          </div>
        )}

        {!loading && registrosFiltrados.length > 0 && (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {registrosFiltrados.map((reg) => {
              const periodoTexto = reg.periodo_texto || `${reg.periodo_mes || reg.mes}/${reg.periodo_anio || reg.anio}`;
              const estadoTexto = reg.estado_registro_texto || reg.estado_registro || '';
              const empleadoNombre =
                reg.solicitud?.empleado_nombre ||
                reg.solicitud?.usuario_nombre ||
                reg.solicitud?.nombre_empleado ||
                reg.solicitud?.nombre_usuario ||
                '';

              return (
                <div
                  key={reg.id_registro}
                  className="bg-gray-900/40 rounded-lg px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-gray-700"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      Registro #{reg.id_registro}
                      {reg.numero_registro && (
                        <span className="text-gray-300"> · {reg.numero_registro}</span>
                      )}
                      {estadoTexto && (
                        <span className="text-green-400 text-xs ml-2">({estadoTexto})</span>
                      )}
                    </p>

                    {empleadoNombre && (
                      <p className="text-xs text-blue-300">
                        {empleadoNombre}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Periodo: {periodoTexto}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Monto: {typeof reg.monto_descuento === 'number' ? reg.monto_descuento : 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Detalles: {typeof reg.total_detalles === 'number' ? reg.total_detalles : 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto">
                    <button
                      type="button"
                      onClick={() => handleVerDetallesRegistro(reg)}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                      Ver detalles
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAbrirPdfRegistro(reg)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {mostrarModalDetallesRegistro && registroConDetalles && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-3xl space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white">
              Detalles del Registro #{registroConDetalles.id_registro}
            </h3>

            <div className="text-xs text-gray-300 space-y-1">
              {registroConDetalles.numero_registro && (
                <p>Número: {registroConDetalles.numero_registro}</p>
              )}
              {registroConDetalles.periodo_texto && (
                <p>Periodo: {registroConDetalles.periodo_texto}</p>
              )}
              {registroConDetalles.estado_registro_texto && (
                <p>Estado: {registroConDetalles.estado_registro_texto}</p>
              )}
              {registroConDetalles.solicitud?.empleado_nombre && (
                <p>Empleado: {registroConDetalles.solicitud.empleado_nombre}</p>
              )}
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-semibold text-white mb-2">Detalles (REGISTRO_ASISTENCIA_DET)</h4>
              {(!registroConDetalles.detalles || registroConDetalles.detalles.length === 0) && (
                <p className="text-xs text-gray-400">No hay detalles registrados.</p>
              )}

              {registroConDetalles.detalles && registroConDetalles.detalles.length > 0 && (
                <div className="overflow-x-auto border border-gray-700 rounded-lg">
                  <table className="min-w-full text-xs text-gray-200">
                    <thead className="bg-gray-800 text-gray-300">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Fecha</th>
                        <th className="px-3 py-2 text-left">Inicio</th>
                        <th className="px-3 py-2 text-left">Fin</th>
                        <th className="px-3 py-2 text-left">Horas Ausencia</th>
                        <th className="px-3 py-2 text-left">Horas Descuento</th>
                        <th className="px-3 py-2 text-left">Justificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registroConDetalles.detalles.map((det) => (
                        <tr key={det.id_detalle_registro} className="border-t border-gray-700">
                          <td className="px-3 py-2">{det.numero_detalle}</td>
                          <td className="px-3 py-2">{det.fecha_dia_texto || det.fecha_dia}</td>
                          <td className="px-3 py-2">{det.hora_inicio_texto || det.hora_inicio}</td>
                          <td className="px-3 py-2">{det.hora_fin_texto || det.hora_fin}</td>
                          <td className="px-3 py-2">{det.horas_ausencia}</td>
                          <td className="px-3 py-2">{det.horas_descuento}</td>
                          <td className="px-3 py-2 max-w-xs whitespace-pre-wrap">{det.justificacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCerrarModalDetallesRegistro}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrosHistorialPage;
