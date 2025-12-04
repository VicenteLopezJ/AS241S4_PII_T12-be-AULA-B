// src/pages/BoletaPrintPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import API_URL from '../../services/boleta_permiso/config';
import getAuthHeaders from '../../services/boleta_permiso/authHeaders';

const BoletaPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [boleta, setBoleta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoleta = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/boletas/${id}`, {
          headers: {
            ...getAuthHeaders(),
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la boleta de permiso');
        }

        const data = await response.json();
        setBoleta(data.data || data);
      } catch (err) {
        console.error('Error al cargar boleta para impresión:', err);
        setError(err.message || 'Error al cargar la boleta');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBoleta();
    }
  }, [id]);

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
        Cargando boleta...
      </div>
    );
  }

  if (error || !boleta) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-200">
        <p className="mb-4 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error || 'No se encontró la boleta'}
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

  const numero = boleta.id_solicitud || boleta.id_boleta || id;
  const solicitante = boleta.usuario?.nombre_completo || boleta.usuario_nombre || '---';
  const cargo = boleta.usuario?.cargo || boleta.cargo || '---';
  const area =
    boleta.area_nombre ||
    boleta.area ||
    boleta.usuario?.area_nombre ||
    boleta.usuario?.area?.nombre ||
    '---';
  const tipoPermiso = boleta.tipo_permiso_texto || boleta.tipo_permiso || boleta.tipo_motivo || '---';
  const motivo = boleta.motivo || 'Sin motivo detallado';
  const estado = boleta.estado_solicitud_texto || boleta.estado_texto || boleta.estado || '---';

  const documentos = boleta.documentos || boleta.documentos_adjuntos || [];

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
              navigate('/rrhh/permisos');
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
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
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SOLICITUD DE PERMISO – Nº {numero}
              </h1>
              <p className="text-xs text-gray-500">
                Fecha de solicitud: {formatearFechaCorta(boleta.fecha_solicitud || boleta.fecha_registro)}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Sistema de Gestión de Permisos</p>
          </div>
        </header>

        {/* Datos del solicitante */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Datos del Solicitante
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nombre completo</p>
              <p className="font-medium text-gray-900">{solicitante}</p>
            </div>
            <div>
              <p className="text-gray-500">Cargo</p>
              <p className="font-medium text-gray-900">{cargo}</p>
            </div>
            <div>
              <p className="text-gray-500">Área</p>
              <p className="font-medium text-gray-900">{area}</p>
            </div>
            <div>
              <p className="text-gray-500">Tipo de permiso</p>
              <p className="font-medium text-gray-900">{tipoPermiso}</p>
            </div>
          </div>
        </section>

        {/* Detalles del permiso */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Detalles del Permiso
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Fecha del permiso</p>
              <p className="font-medium text-gray-900">{formatearFecha(boleta.fecha_permiso)}</p>
            </div>
            <div>
              <p className="text-gray-500">Duración</p>
              <p className="font-medium text-gray-900">{boleta.horas_duracion || '-'} horas</p>
            </div>
            <div>
              <p className="text-gray-500">Hora de salida</p>
              <p className="font-medium text-gray-900">{boleta.hora_salida || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Hora de retorno</p>
              <p className="font-medium text-gray-900">{boleta.hora_retorno || '-'}</p>
            </div>
          </div>
        </section>

        {/* Motivo */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Motivo del Permiso</h2>
          <div className="border border-gray-300 rounded-md p-3 text-sm leading-relaxed min-h-[80px]">
            {motivo}
          </div>
        </section>

        {/* Documentos adjuntos */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Documentos Adjuntos (Detalle)</h2>
          {documentos && documentos.length > 0 ? (
            <table className="w-full text-xs border border-gray-300 border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">N°</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Nombre</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Tipo</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Tamaño</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc, index) => (
                  <tr key={doc.id_documento || doc.id_detalle || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.nombre_archivo || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.extension || doc.tipo_documento || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.tamanio_kb ? `${doc.tamanio_kb} KB` : '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{formatearFechaCorta(doc.fecha_subida)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-500">No hay documentos adjuntos registrados.</p>
          )}
        </section>

        {/* Estado y firmas */}
        <section className="mt-8 text-xs">
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-gray-500 mb-1">Estado de la solicitud</p>
              <p className="font-semibold text-gray-900">{estado}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 mb-1">Fecha de impresión</p>
              <p className="text-gray-900">{formatearFechaCorta(new Date())}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-1" />
              <p className="mt-1 text-gray-700 font-medium text-xs">Firma del Empleado</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-1" />
              <p className="mt-1 text-gray-700 font-medium text-xs">Firma del Jefe / RRHH</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BoletaPrintPage;
