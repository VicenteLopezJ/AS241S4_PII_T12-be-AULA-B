// src/pages/MiAsistenciaPage.jsx
import React, { useEffect, useState } from 'react';
import { Clock, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { usuarioService } from '../../services/boleta_permiso/usuarioService';
import { registroAsistenciaService } from '../../services/boleta_permiso/registroAsistenciaService';

const MiAsistenciaPage = () => {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [anio, setAnio] = useState(String(now.getFullYear()));
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [resumenDescuentos, setResumenDescuentos] = useState(null);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await usuarioService.getMyPermissions();
      const usuarioId = me.user_id;

      const [registrosResp, descuentosResp] = await Promise.all([
        registroAsistenciaService.getRegistrosPorUsuario(usuarioId, { mes, anio }),
        registroAsistenciaService.calcularDescuentosUsuario(usuarioId, { mes, anio }),
      ]);

      setRegistros(registrosResp || []);
      setResumenDescuentos(descuentosResp || null);
    } catch (err) {
      console.error('Error al cargar asistencia/descuentos:', err);
      setError(err.message || 'Error al cargar información de asistencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, anio]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  const formatearHora = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const totalHorasAusencia = registros.reduce(
    (acc, r) => acc + (Number(r.horas_ausencia) || 0),
    0
  );

  const totalHorasDescuento = registros.reduce(
    (acc, r) => acc + (Number(r.horas_descuento) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-blue-400" />
            Mi Asistencia y Descuentos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Visualiza tus registros de asistencia asociados a permisos y el resumen de descuentos del periodo seleccionado.
          </p>
        </div>

        {/* Filtros de periodo */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none"
            >
              <option value="01">Ene</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Abr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Ago</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dic</option>
            </select>
            <input
              type="number"
              min="2000"
              max="2100"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="bg-transparent text-sm text-white w-18 focus:outline-none border-l border-gray-700 pl-2"
            />
          </div>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white"
            disabled={loading}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Horas de ausencia registradas</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            {totalHorasAusencia.toFixed(2)} h
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Horas con descuento</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-400" />
            {totalHorasDescuento.toFixed(2)} h
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Resumen de descuentos</p>
          {resumenDescuentos ? (
            <div className="text-sm text-gray-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>
                Monto total: {Number(resumenDescuentos.monto_total || 0).toFixed(2)}
                {resumenDescuentos.moneda ? ` ${resumenDescuentos.moneda}` : ''}
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Sin descuentos registrados en el periodo.</p>
          )}
        </div>
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <div className="text-center py-6 text-gray-400 text-sm">
          Cargando registros de asistencia...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de registros */}
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Registros de asistencia del periodo</h2>
            <span className="text-xs text-gray-400">{registros.length} registros</span>
          </div>

          {registros.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              No hay registros de asistencia para el periodo seleccionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-900/60 text-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Hora Inicio</th>
                    <th className="px-4 py-2 text-left">Hora Fin</th>
                    <th className="px-4 py-2 text-right">Horas Ausencia</th>
                    <th className="px-4 py-2 text-right">Horas Descuento</th>
                    <th className="px-4 py-2 text-left">Justificación</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r) => (
                    <tr key={r.id_detalle || r.id_registro_det || `${r.fecha_dia}-${r.hora_inicio}`} className="border-t border-gray-700/60">
                      <td className="px-4 py-2 text-gray-100">{formatearFecha(r.fecha_dia)}</td>
                      <td className="px-4 py-2 text-gray-200">{formatearHora(r.hora_inicio)}</td>
                      <td className="px-4 py-2 text-gray-200">{formatearHora(r.hora_fin)}</td>
                      <td className="px-4 py-2 text-right text-gray-100">{Number(r.horas_ausencia || 0).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-gray-100">{Number(r.horas_descuento || 0).toFixed(2)}</td>
                      <td className="px-4 py-2 text-gray-300 max-w-xs truncate" title={r.justificacion}>
                        {r.justificacion || 'No especificado'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiAsistenciaPage;
