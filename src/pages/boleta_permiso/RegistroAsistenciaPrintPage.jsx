// src/pages/RegistroAsistenciaPrintPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, AlertCircle } from "lucide-react";
import { registroAsistenciaService } from "../../services/boleta_permiso/registroAsistenciaService";

const RegistroAsistenciaPrintPage = () => {
  const { idRegistro } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistro = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await registroAsistenciaService.getRegistroById(idRegistro);
        setRegistro(data);
      } catch (err) {
        console.error('Error al cargar registro para impresión:', err);
        setError(err.message || 'Error al cargar el registro de asistencia');
      } finally {
        setLoading(false);
      }
    };

    if (idRegistro) {
      fetchRegistro();
    }
  }, [idRegistro]);

  const handlePrint = () => {
    window.print();
  };

  const formatearFecha = (fecha) => {
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
        Cargando registro de asistencia...
      </div>
    );
  }

  if (error || !registro) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-200">
        <p className="mb-4 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error || 'No se encontró el registro de asistencia'}
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

  const numeroRegistro = registro.numero_registro || idRegistro;
  const periodoTexto = registro.periodo_texto || '---';
  const fechaRegistroSistema = formatearFechaCorta(registro.fecha_registro_sistema);
  const estadoRegistro = registro.estado_registro_texto || registro.estado_registro || '---';
  const montoDescuento = typeof registro.monto_descuento === 'number' ? registro.monto_descuento : 0;
  const totalDetalles = typeof registro.total_detalles === 'number' ? registro.total_detalles : (registro.detalles?.length || 0);

  const solicitud = registro.solicitud || {};
  const aprobacion = registro.aprobacion || {};

  const empleadoNombre =
    solicitud.usuario_nombre ||
    solicitud.empleado_nombre ||
    solicitud.nombre_empleado ||
    solicitud.nombre_usuario ||
    '---';

  const tipoPermiso = solicitud.tipo_permiso || solicitud.tipo_permiso_texto || '---';
  const fechaPermiso = formatearFecha(solicitud.fecha_permiso);

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
              navigate('/rrhh/registros/historial');
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
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
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                REGISTRO DE ASISTENCIA – Nº {numeroRegistro}
              </h1>
              <p className="text-xs text-gray-500">Sistema de Gestión de Permisos y Asistencia</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Fecha de impresión: {formatearFechaCorta(new Date())}</p>
          </div>
        </header>

        {/* Datos generales */}
        <section className="mb-6 text-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Datos Generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Periodo</p>
              <p className="font-medium text-gray-900">{periodoTexto}</p>
            </div>
            <div>
              <p className="text-gray-500">Empleado</p>
              <p className="font-medium text-gray-900">{empleadoNombre}</p>
            </div>
            <div>
              <p className="text-gray-500">Tipo de permiso</p>
              <p className="font-medium text-gray-900">{tipoPermiso}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha del permiso</p>
              <p className="font-medium text-gray-900">{fechaPermiso}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de registro en sistema</p>
              <p className="font-medium text-gray-900">{fechaRegistroSistema}</p>
            </div>
            <div>
              <p className="text-gray-500">Estado del registro</p>
              <p className="font-medium text-gray-900">{estadoRegistro}</p>
            </div>
            <div>
              <p className="text-gray-500">Monto de descuento</p>
              <p className="font-medium text-gray-900">S/ {montoDescuento}</p>
            </div>
          </div>
        </section>

        {/* Información de aprobación */}
        <section className="mb-6 text-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Información de Aprobación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Nº de aprobación</p>
              <p className="font-medium text-gray-900">{aprobacion.numero_aprobacion || '---'}</p>
            </div>
            <div>
              <p className="text-gray-500">Decisión</p>
              <p className="font-medium text-gray-900">{aprobacion.decision || 'APROBADO'}</p>
            </div>
          </div>
        </section>

        {/* Detalle por día */}
        <section className="mb-6 text-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Detalle por día</h2>
          {(!registro.detalles || registro.detalles.length === 0) ? (
            <p className="text-xs text-gray-500">No hay detalles registrados.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">Nº</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Fecha</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Hora Inicio</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Hora Fin</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Ausencia (h)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Descuento (h)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Justificación</th>
                  </tr>
                </thead>
                <tbody>
                  {registro.detalles.map((det) => (
                    <tr key={det.id_detalle_registro} className="odd:bg-white even:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">{det.numero_detalle}</td>
                      <td className="border border-gray-300 px-2 py-1">{det.fecha_dia_texto || det.fecha_dia}</td>
                      <td className="border border-gray-300 px-2 py-1">{det.hora_inicio_texto || det.hora_inicio}</td>
                      <td className="border border-gray-300 px-2 py-1">{det.hora_fin_texto || det.hora_fin}</td>
                      <td className="border border-gray-300 px-2 py-1">{det.horas_ausencia}</td>
                      <td className="border border-gray-300 px-2 py-1">{det.horas_descuento}</td>
                      <td className="border border-gray-300 px-2 py-1 max-w-xs whitespace-pre-wrap">{det.justificacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-600 mt-2">Total Detalles: {totalDetalles}</p>
        </section>

        {/* Firmas */}
        <section className="mt-8 text-xs">
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-1" />
              <p className="mt-1 text-gray-700 font-medium text-xs">Firma del Empleado</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-1" />
              <p className="mt-1 text-gray-700 font-medium text-xs">Firma de RRHH</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegistroAsistenciaPrintPage;
