// src/components/boleta_permiso/permisos/PermisosAprobadosJefe.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, Eye, Download } from 'lucide-react';
import { aprobacionService } from '../../../services/boleta_permiso/aprobacionService';
import { solicitudPermisoService } from '../../../services/boleta_permiso/solicitudPermisoService';

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  const fechaStr = String(fecha).split('T')[0];
  const [year, month, day] = fechaStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const PermisosAprobadosJefe = () => {
  const [loading, setLoading] = useState(true);
  const [aprobaciones, setAprobaciones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await aprobacionService.getMisAprobaciones();

        const aprobacionesMapeadas = await Promise.all(
          (data || []).map(async (ap) => {
            let solicitud = null;
            try {
              solicitud = await solicitudPermisoService.getSolicitudById(ap.id_solicitud);
            } catch {
              // ignorar error de detalle, mostramos lo que haya
            }

            const usuario = solicitud?.usuario || {};
            const nombreYApellido =
              usuario.nombres && usuario.apellidos
                ? `${usuario.nombres} ${usuario.apellidos}`
                : null;

            return {
              id_aprobacion: ap.id_aprobacion,
              numero_aprobacion: ap.numero_aprobacion,
              id_solicitud: ap.id_solicitud,
              decision: ap.decision,
              empleado_nombre:
                nombreYApellido ||
                usuario.nombre_completo ||
                solicitud?.usuario_nombre ||
                ap.empleado_nombre ||
                '---',
              fecha_revision: ap.fecha_aprobacion || ap.fecha_revision,
              comentario_general: ap.comentario_general || '',
            };
          })
        );

        setAprobaciones(aprobacionesMapeadas);
      } catch (e) {
        console.error('Error al cargar aprobaciones del jefe', e);
        setError('Error al cargar las aprobaciones del jefe');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const handleDescargarPDF = (id_aprobacion) => {
    const url = `/rrhh/aprobaciones/${id_aprobacion}/print`;
    window.open(url, '_blank');
  };

  const total = aprobaciones.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-green-400" />
            Aprobaciones del Jefe
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Historial de solicitudes que has aprobado o rechazado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total de decisiones</p>
            <p className="text-2xl font-bold text-white mt-1">{total}</p>
            <p className="text-xs text-gray-500 mt-1">Aprobaciones y rechazos registrados</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>
      </div>

      {!loading && total === 0 && (
        <div className="text-center py-12 bg-gray-800/60 border border-gray-700 rounded-xl">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Aún no tienes aprobaciones registradas.</p>
          <p className="text-gray-500 text-sm mt-1">
            Cuando apruebes o rechaces solicitudes desde la vista de revisión, aparecerán aquí.
          </p>
        </div>
      )}

      {!loading && total > 0 && (
        <div className="space-y-3">
          {aprobaciones.map((ap) => (
            <div
              key={ap.id_aprobacion}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/70 hover:bg-gray-800/90 transition-colors flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Aprobación Nº {ap.numero_aprobacion}
                    </p>
                    <p className="text-xs text-gray-400">Solicitud ID: {ap.id_solicitud}</p>
                    <p className="text-xs text-gray-400">Empleado: {ap.empleado_nombre}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 bg-green-900/30 text-green-400 border-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {ap.decision}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>
                    <span className="text-gray-400">Decisión: </span>
                    {ap.decision}
                  </p>
                  {ap.fecha_revision && (
                    <p>
                      <span className="text-gray-400">Fecha de revisión: </span>
                      {formatearFecha(ap.fecha_revision)}
                    </p>
                  )}
                  {ap.comentario_general && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      <span className="font-semibold text-gray-300">Comentario: </span>
                      {ap.comentario_general}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col gap-2 md:items-end">
                <button
                  type="button"
                  onClick={() => handleDescargarPDF(ap.id_aprobacion)}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF Aprobación
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-gray-300 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin" />
          Cargando aprobaciones...
        </div>
      )}

      {error && !loading && (
        <div className="text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};
