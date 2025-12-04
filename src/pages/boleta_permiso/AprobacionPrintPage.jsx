// src/pages/AprobacionPrintPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import { aprobacionService } from '../../services/boleta_permiso/aprobacionService';
import { solicitudPermisoService } from '../../services/boleta_permiso/solicitudPermisoService';

const AprobacionPrintPage = () => {
  const { idAprobacion } = useParams();
  const navigate = useNavigate();

  const [aprobacion, setAprobacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAprobacion = async () => {
      setLoading(true);
      setError(null);
      try {
        // Detalle de aprobación desde el servicio existente
        const detalle = await aprobacionService.getAprobacionById(idAprobacion);

        // Observaciones asociadas
        let observaciones = [];
        try {
          observaciones = await aprobacionService.getObservaciones(idAprobacion);
        } catch {
          observaciones = [];
        }

        // Detalle de la solicitud (para empleado, fechas, etc.)
        let solicitud = null;
        try {
          if (detalle.id_solicitud) {
            solicitud = await solicitudPermisoService.getSolicitudById(detalle.id_solicitud);
          }
        } catch {
          solicitud = null;
        }

        setAprobacion({ detalle, observaciones, solicitud });
      } catch (err) {
        console.error('Error al cargar aprobación para impresión:', err);
        setError(err.message || 'Error al cargar la aprobación');
      } finally {
        setLoading(false);
      }
    };

    if (idAprobacion) {
      fetchAprobacion();
    }
  }, [idAprobacion]);

  const handlePrint = () => {
    window.print();
  };

  const formatearFechaLarga = (fecha) => {
    if (!fecha) return 'N/A';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return 'N/A';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-200">
        Cargando aprobación...
      </div>
    );
  }

  if (error || !aprobacion) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-200">
        <p className="mb-4 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error || 'No se encontró la aprobación'}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  // Desestructurar los bloques que armamos arriba
  const { detalle, observaciones = [], solicitud } = aprobacion || {};

  // Campos principales esperados desde el backend
  const numeroAprobacion = detalle?.numero_aprobacion || detalle?.numero || idAprobacion;
  const decision = detalle?.decision || 'APROBADO';
  const solicitudId = detalle?.id_solicitud;
  const fechaRevision = detalle?.fecha_aprobacion || detalle?.fecha_revision;
  const fechaPermiso = solicitud?.fecha_permiso || detalle?.fecha_permiso;

  const empleado = solicitud?.usuario || detalle?.empleado || detalle?.usuario || {};
  const nombreEmpleado =
    (empleado.nombres && empleado.apellidos)
      ? `${empleado.nombres} ${empleado.apellidos}`
      : empleado.nombre_completo || detalle?.empleado_nombre || '---';
  const cargoEmpleado = empleado.cargo || detalle?.empleado_cargo || '---';
  const areaEmpleado =
    empleado.area_nombre ||
    empleado.area?.nombre ||
    solicitud?.area_nombre ||
    detalle?.area_nombre ||
    '---';

  const comentarioGeneral = detalle?.comentario_general || detalle?.comentario || '';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-6 print:bg-white print:text-black">
      {/* Barra superior solo para pantalla */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4 print:hidden">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.opener) {
              window.close();
            } else {
              navigate('/rrhh/autorizaciones');
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Contenedor imprimible */}
      <div className="w-full max-w-4xl bg-white text-gray-900 shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none print:px-0 print:bg-white">
        {/* Encabezado */}
        <header className="border-b border-gray-300 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                APROBACIÓN DE JEFE – Nº {numeroAprobacion}
              </h1>
              <p className="text-xs text-gray-500">
                Fecha de revisión: {formatearFechaCorta(fechaRevision)}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Sistema de Gestión de Permisos</p>
          </div>
        </header>

        {/* Datos de la Solicitud */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            Datos de la Solicitud
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Solicitud ID</p>
              <p className="font-medium text-gray-900">{solicitudId}</p>
            </div>
            <div>
              <p className="text-gray-500">Empleado</p>
              <p className="font-medium text-gray-900">{nombreEmpleado}</p>
            </div>
            <div>
              <p className="text-gray-500">Cargo</p>
              <p className="font-medium text-gray-900">{cargoEmpleado}</p>
            </div>
            <div>
              <p className="text-gray-500">Área</p>
              <p className="font-medium text-gray-900">{areaEmpleado}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de permiso</p>
              <p className="font-medium text-gray-900">{formatearFechaLarga(fechaPermiso)}</p>
            </div>
          </div>
        </section>

        {/* Decisión del Jefe */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Decisión del Jefe
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-gray-500">Decisión</p>
              <p className="font-semibold text-emerald-600">{decision}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de revisión</p>
              <p className="font-medium text-gray-900">{formatearFechaCorta(fechaRevision)}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Comentario general</p>
            <div className="border border-gray-300 rounded-md p-3 text-sm leading-relaxed min-h-[60px]">
              {comentarioGeneral || 'Sin comentarios registrados.'}
            </div>
          </div>
        </section>

        {/* Observaciones */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Observaciones</h2>
          {observaciones && observaciones.length > 0 ? (
            <table className="w-full text-xs border border-gray-300 border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">N°</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Tipo</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Descripción</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Crítica</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {observaciones.map((obs, index) => (
                  <tr key={obs.id_observacion || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                    <td className="border border-gray-300 px-2 py-1">{obs.tipo_observacion || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{obs.descripcion_observacion || obs.descripcion || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{obs.es_critica ? 'Sí' : 'No'}</td>
                    <td className="border border-gray-300 px-2 py-1">{formatearFechaCorta(obs.fecha_observacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-500">No hay observaciones registradas.</p>
          )}
        </section>

        {/* Pie con fecha de impresión */}
        <section className="mt-8 text-xs">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 mb-1">Fecha de impresión</p>
              <p className="text-gray-900">{formatearFechaCorta(new Date())}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AprobacionPrintPage;
