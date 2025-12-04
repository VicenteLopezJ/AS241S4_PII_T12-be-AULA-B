// src/components/permisos/permisosDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, AlertCircle, Upload, File, Eye, Download, CheckCircle } from 'lucide-react';
import { documentoService } from '../../../services/boleta_permiso/documentoService';
import { solicitudPermisoService } from '../../../services/boleta_permiso/solicitudPermisoService';
import API_URL from '../../../services/boleta_permiso/config';
import getAuthHeaders from '../../../services/boleta_permiso/authHeaders';
import { aprobacionService } from '../../../services/boleta_permiso/aprobacionService';
import { ObservacionModal } from './ObservacionModal';

export const BoletaDetallesModal = ({ boleta, onClose, onUpdated }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [empleado, setEmpleado] = useState(null);
  const [loadingEmpleado, setLoadingEmpleado] = useState(false);
  const [rolId, setRolId] = useState(null);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [jefeId, setJefeId] = useState(null);
  const [mostrarObservacion, setMostrarObservacion] = useState(false);
  const [bloquearObservacion, setBloquearObservacion] = useState(false);
  const [aprobacionId, setAprobacionId] = useState(null);

  const cargarEmpleado = async () => {
    if (!boleta?.empleado_id) return;
    
    setLoadingEmpleado(true);
    try {
      const response = await fetch(`${API_URL}/empleados/${boleta.empleado_id}`, {
        headers: {
          ...getAuthHeaders(),
        },
        credentials: 'include',
      });
      const data = await response.json();
      setEmpleado(data.data || null);
    } catch (err) {
      console.error('Error al cargar empleado:', err);
      setEmpleado(null);
    } finally {
      setLoadingEmpleado(false);
    }
  };

  const getEstadoCodigo = () => {
    return (
      boleta.estado_codigo ||
      boleta.estado_solicitud ||
      boleta.estado ||
      ''
    );
  };

  const esJefe = rolId === 2;
  const estadoCodigo = getEstadoCodigo();
  const puedeRevisar = esJefe && estadoCodigo === 'EN_REVISION_JEFE';

  const handleAprobar = async () => {
    const comentario = window.prompt(
      'Comentario general (opcional):',
      'Permiso aprobado. Documentos correctos.'
    );
    if (comentario === null) return;
    setLoadingAccion(true);
    try {
      await aprobacionService.aprobar({
        id_solicitud: boleta.id_boleta,
        comentario_general: comentario,
      });
      alert('Solicitud aprobada correctamente');
      if (onUpdated) {
        await onUpdated();
      }
      onClose();
    } catch (e) {
      console.error('Error al aprobar solicitud', e);
      alert('Error al aprobar la solicitud');
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleRechazar = async () => {
    const comentario = window.prompt(
      'Motivo general del rechazo:',
      'No cumple requisitos.'
    );
    if (comentario === null) return;
    const detalle = window.prompt(
      'Detalle de la observación (opcional):',
      'Detalle insuficiente'
    );
    const observaciones = detalle
      ? [
          {
            tipo_observacion: 'JUSTIFICACION_INSUFICIENTE',
            descripcion_observacion: detalle,
          },
        ]
      : [];

    setLoadingAccion(true);
    try {
      await aprobacionService.rechazar({
        id_solicitud: boleta.id_boleta,
        comentario_general: comentario,
        observaciones,
      });
      alert('Solicitud rechazada correctamente');
      if (onUpdated) {
        await onUpdated();
      }
      onClose();
    } catch (e) {
      console.error('Error al rechazar solicitud', e);
      alert('Error al rechazar la solicitud');
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleObservar = async () => {
    setMostrarObservacion(true);
  };

  const cargarDocumentos = async () => {
    setLoadingDocs(true);
    try {
      const docs = await solicitudPermisoService.getDocumentosSolicitud(boleta.id_boleta);
      setDocumentos(docs || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (boleta?.id_boleta) {
      cargarDocumentos();
      cargarEmpleado();
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
          const info = JSON.parse(raw);
          const usuario = info.usuario || {};
          const rol = info.rol_id ?? info.rolId ?? usuario.rol_id ?? null;
          setRolId(rol);
          const idJefe = info.user_id || info.usuario_id || usuario.id_usuario || null;
          setJefeId(idJefe);
        }
      } catch (e) {
        console.warn('No se pudo leer userInfo para el modal de detalles', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boleta]);

  const handleVerDocumento = async (docId) => {
    try {
      await solicitudPermisoService.downloadDocumento(docId);
    } catch (err) {
      console.error('Error al descargar:', err);
      alert('Error al descargar el documento');
    }
  };

  const handleDescargarDocumento = async (docId) => {
    try {
      await solicitudPermisoService.downloadDocumento(docId);
    } catch (err) {
      console.error('Error al descargar:', err);
      alert('Error al descargar el documento');
    }
  };

  if (!boleta) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHoraCompleta = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  const formatearFechaHora = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente Documento':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600';
      case 'Pendiente Jefe':
        return 'bg-orange-900/30 text-orange-400 border-orange-600';
      case 'Pendiente Registro':
        return 'bg-blue-900/30 text-blue-400 border-blue-600';
      case 'Registrado':
        return 'bg-green-900/30 text-green-400 border-green-600';
      case 'Rechazado':
        return 'bg-red-900/30 text-red-400 border-red-600';
      case 'Cancelado':
        return 'bg-gray-700/30 text-gray-400 border-gray-600';
      default:
        return 'bg-gray-700/30 text-gray-400 border-gray-600';
    }
  };

  const getTipoMotivoColor = (tipo) => {
    switch (tipo) {
      case 'Salud':
        return 'bg-red-900/30 text-red-400';
      case 'Personal':
        return 'bg-purple-900/30 text-purple-400';
      case 'Familiar':
        return 'bg-pink-900/30 text-pink-400';
      case 'Trámite':
        return 'bg-blue-900/30 text-blue-400';
      case 'Emergencia':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Detalles de Boleta #{boleta.id_boleta}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Estado</label>
              <span className={`px-4 py-2 rounded-lg text-sm font-medium border inline-block ${getEstadoColor(boleta.estado)}`}>
                {boleta.estado}
              </span>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Tipo de Motivo</label>
              <span className={`px-4 py-2 rounded-lg text-sm font-medium inline-block ${getTipoMotivoColor(boleta.tipo_motivo)}`}>
                {boleta.tipo_motivo}
              </span>
            </div>
          </div>

          {/* Información del Empleado */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Información del Empleado
            </h3>
            {loadingEmpleado ? (
              <div className="text-center py-2">
                <Clock className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
              </div>
            ) : empleado ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Nombre Completo</label>
                  <p className="text-white">{empleado.nombres} {empleado.apellidos}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Documento</label>
                  <p className="text-white">{empleado.tipo_documento}: {empleado.documento}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Cargo</label>
                  <p className="text-white">{empleado.cargo || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Correo</label>
                  <p className="text-white">{empleado.correo || 'No especificado'}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-gray-400 text-sm">ID Empleado</label>
                <p className="text-white font-mono">{boleta.empleado_id}</p>
              </div>
            )}
          </div>

          {/* Información del Permiso */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Información del Permiso
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Fecha del Permiso</label>
                  <p className="text-white">{formatearFecha(boleta.fecha_permiso)}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Duración</label>
                  <p className="text-white flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {boleta.horas_duracion} horas
                  </p>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Hora de Salida</label>
                <p className="text-white">{formatearHoraCompleta(boleta.hora_salida)}</p>
              </div>
            </div>
          </div>

          {/* Motivo */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Motivo
            </h3>
            <p className="text-gray-300">{boleta.motivo || 'No especificado'}</p>
          </div>

          {/* Información Adicional */}
          {(boleta.requiere_prueba || boleta.observaciones) && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Información Adicional</h3>
              <div className="space-y-3">
                {boleta.requiere_prueba && (
                  <div>
                    <label className="text-gray-400 text-sm">Requiere Documento</label>
                    <p className="text-white">
                      {boleta.requiere_prueba === 'S' ? 'Sí' : 'No'}
                    </p>
                  </div>
                )}
                {boleta.observaciones && (
                  <div>
                    <label className="text-gray-400 text-sm">Observaciones</label>
                    <p className="text-gray-300">{boleta.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fechas de Registro */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-400">Fecha de Solicitud</label>
              <p className="text-white">{formatearFechaHora(boleta.fecha_solicitud)}</p>
            </div>
          </div>

          {/* Documentos de Respaldo */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Documentos de Respaldo
            </h3>
            {loadingDocs ? (
              <div className="text-center py-4">
                <Clock className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Cargando documentos...</p>
              </div>
            ) : documentos.length > 0 ? (
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div key={doc.id_detalle || doc.id_documento} className="bg-gray-600 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{doc.nombre_archivo}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded ${documentoService.getTipoColor(doc.tipo_documento)}`}>
                            {doc.tipo_documento}
                          </span>
                          <span>{documentoService.formatearTamanio(doc.tamanio_kb)}</span>
                          <span>•</span>
                          <span>{doc.extension?.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerDocumento(doc.id_detalle || doc.id_documento)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        title="Ver documento"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDescargarDocumento(doc.id_detalle || doc.id_documento)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                        title="Descargar documento"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No hay documentos de respaldo</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t border-gray-700">
          <div className="flex gap-2">
            {puedeRevisar && (
              <>
                <button
                  type="button"
                  onClick={handleAprobar}
                  disabled={loadingAccion}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprobar
                </button>
                {!bloquearObservacion && (
                  <button
                    type="button"
                    onClick={() => setMostrarObservacion(true)}
                    disabled={loadingAccion}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Observar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRechazar}
                  disabled={loadingAccion}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    {/* Modal de Observación del Jefe */}
    {mostrarObservacion && (
      <ObservacionModal
        open={mostrarObservacion}
        onClose={() => setMostrarObservacion(false)}
        onSubmit={async ({ comentario_general, observacion }) => {
          setLoadingAccion(true);
          try {
            // Si ya tenemos id de aprobación, solo agregamos una nueva observación
            if (aprobacionId) {
              await aprobacionService.crearObservacion(aprobacionId, observacion);
            } else {
              // Primera vez: crear aprobación observada
              const data = await aprobacionService.observar({
                id_solicitud: boleta.id_boleta,
                jefe_id: jefeId,
                comentario_general,
                observaciones: [observacion],
              });
              if (data && data.id_aprobacion) {
                setAprobacionId(data.id_aprobacion);
              }
            }

            alert('Observación registrada correctamente');
            if (onUpdated) {
              await onUpdated();
            }
            setMostrarObservacion(false);
            onClose();
          } catch (e) {
            console.error('Error al registrar la observación', e);
            const msg = e.message || 'Error desconocido';
            console.log('Mensaje de error al registrar observación:', msg);

            // Si el backend dice que ya existe una aprobación, no mostramos este error
            // e intentamos directamente el flujo alternativo: obtener la aprobación y agregar observación
            if (msg.toLowerCase().includes('ya existe una aprob')) {
              try {
                const aprobacion = await aprobacionService.getAprobacionPorSolicitud(boleta.id_boleta);
                if (aprobacion?.id_aprobacion) {
                  setAprobacionId(aprobacion.id_aprobacion);
                  await aprobacionService.crearObservacion(aprobacion.id_aprobacion, observacion);
                  alert('Observación registrada correctamente');
                  if (onUpdated) {
                    await onUpdated();
                  }
                  setMostrarObservacion(false);
                  onClose();
                  return;
                }
              } catch (innerErr) {
                console.error('Error al recuperar aprobación existente', innerErr);
                alert('Error al registrar la observación: no se pudo usar la aprobación existente');
                return;
              }

              // Si llegamos aquí es porque no se pudo obtener id_aprobacion
              alert('Error al registrar la observación: no se encontró aprobación existente para esta solicitud');
            } else {
              // Cualquier otro error sí se muestra tal cual
              alert(`Error al registrar la observación: ${msg}`);
            }
          } finally {
            setLoadingAccion(false);
          }
        }}
      />
    )}
    </>
  );
};
