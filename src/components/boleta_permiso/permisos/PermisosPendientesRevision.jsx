import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, X, AlertCircle, Clock, FileText } from 'lucide-react';
import { solicitudPermisoService } from '../../../services/boleta_permiso/solicitudPermisoService';
import { usuarioService } from '../../../services/boleta_permiso/usuarioService';
import { aprobacionService } from '../../../services/boleta_permiso/aprobacionService';
import { BoletaDetallesModal } from './permisosDetailsModal';
import { ObservacionModal } from './ObservacionModal';

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

export const PermisosPendientesRevision = () => {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [boletas, setBoletas] = useState([]);
  const [empleados, setEmpleados] = useState({});
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarObservacion, setMostrarObservacion] = useState(false);
  const [boletaParaObservacion, setBoletaParaObservacion] = useState(null);
  const [boletasObsBloqueadas, setBoletasObsBloqueadas] = useState(new Set());

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const info = await usuarioService.getMyPermissions();
        setMe(info);

        const pendientes = await solicitudPermisoService.getPendientesRevision();
        const boletasMapeadas = (pendientes || []).map((s) => ({
          id_boleta: s.id_solicitud,
          empleado_id: s.usuario_id,
          fecha_permiso: s.fecha_permiso,
          horas_duracion: s.horas_duracion,
          tipo_motivo: s.tipo_permiso_texto || s.tipo_permiso,
          motivo: s.motivo,
          estado_codigo: s.estado_solicitud,
          estado_texto: s.estado_solicitud_texto || s.estado_solicitud,
        }));

        setBoletas(boletasMapeadas);

        const empleadosIds = [...new Set(boletasMapeadas.map((b) => b.empleado_id))];
        const empleadosData = {};
        await Promise.all(
          empleadosIds.map(async (id) => {
            try {
              const data = await usuarioService.getUsuarioById(id);
              if (data) {
                empleadosData[id] = data;
              }
            } catch (e) {
              console.error('Error al cargar empleado', id, e);
            }
          })
        );
        setEmpleados(empleadosData);
      } catch (e) {
        console.error('Error al cargar pendientes de revisión', e);
        alert('Error al cargar los permisos pendientes de revisión');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const getNombreEmpleado = (empleadoId) => {
    const empleado = empleados[empleadoId];
    if (empleado) {
      return `${empleado.nombres} ${empleado.apellidos}`;
    }
    return `ID: ${empleadoId}`;
  };

  const refrescar = async () => {
    try {
      const pendientes = await solicitudPermisoService.getPendientesRevision();
      const boletasMapeadas = (pendientes || []).map((s) => ({
        id_boleta: s.id_solicitud,
        empleado_id: s.usuario_id,
        fecha_permiso: s.fecha_permiso,
        horas_duracion: s.horas_duracion,
        tipo_motivo: s.tipo_permiso_texto || s.tipo_permiso,
        motivo: s.motivo,
        estado_codigo: s.estado_solicitud,
        estado_texto: s.estado_solicitud_texto || s.estado_solicitud,
      }));
      setBoletas(boletasMapeadas);
    } catch (e) {
      console.error('Error al refrescar pendientes de revisión', e);
    }
  };

  const manejarAprobar = async (boleta) => {
    const comentario = window.prompt('Comentario general (opcional):', 'Permiso aprobado. Documentos correctos.');
    if (comentario === null) return;
    try {
      await aprobacionService.aprobar({ id_solicitud: boleta.id_boleta, comentario_general: comentario });
      alert('Solicitud aprobada correctamente');
      refrescar();
    } catch (e) {
      console.error('Error al aprobar solicitud', e);
      alert('Error al aprobar la solicitud');
    }
  };

  const manejarRechazar = async (boleta) => {
    const comentario = window.prompt('Motivo general del rechazo:', 'No cumple requisitos.');
    if (comentario === null) return;
    const detalle = window.prompt('Detalle de la observación (opcional):', 'Detalle insuficiente');
    const observaciones = detalle
      ? [
          {
            tipo_observacion: 'JUSTIFICACION_INSUFICIENTE',
            descripcion_observacion: detalle,
          },
        ]
      : [];
    try {
      await aprobacionService.rechazar({
        id_solicitud: boleta.id_boleta,
        comentario_general: comentario,
        observaciones,
      });
      alert('Solicitud rechazada correctamente');
      refrescar();
    } catch (e) {
      console.error('Error al rechazar solicitud', e);
      alert('Error al rechazar la solicitud');
    }
  };

  const manejarObservar = async (boleta) => {
    setBoletaParaObservacion(boleta);
    setMostrarObservacion(true);
  };

  const totalPendientes = boletas.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-400" />
            Permisos Pendientes de Revisión
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Revisa y aprueba las solicitudes de permiso de tu área.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{totalPendientes}</p>
            <p className="text-xs text-gray-500 mt-1">Requieren tu revisión</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>

      {!loading && boletas.length === 0 && (
        <div className="text-center py-12 bg-gray-800/60 border border-gray-700 rounded-xl">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">No tienes solicitudes pendientes de revisión.</p>
          <p className="text-gray-500 text-sm mt-1">Cuando tus empleados registren nuevas solicitudes, aparecerán aquí.</p>
        </div>
      )}

      {!loading && boletas.length > 0 && (
        <div className="space-y-3">
          {boletas.map((boleta) => (
            <div
              key={boleta.id_boleta}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/70 hover:bg-gray-800/90 transition-colors flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center text-sm font-semibold text-blue-200">
                      {getNombreEmpleado(boleta.empleado_id).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{getNombreEmpleado(boleta.empleado_id)}</p>
                      <p className="text-xs text-gray-400">Boleta #{boleta.id_boleta}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 bg-blue-900/30 text-blue-400 border-blue-600">
                    <Clock className="w-4 h-4" />
                    {boleta.estado_texto || 'En revisión del jefe'}
                  </span>
                </div>

                <div className="text-sm text-gray-300">
                  <p className="font-medium mb-1">{boleta.motivo || 'Sin motivo detallado'}</p>
                  <p className="text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 mr-3">
                      {formatearFecha(boleta.fecha_permiso)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {boleta.horas_duracion}h
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 md:items-end">
                <button
                  type="button"
                  onClick={() => {
                    setBoletaSeleccionada(boleta);
                    setMostrarDetalles(true);
                  }}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalle
                </button>
                <button
                  type="button"
                  onClick={() => manejarAprobar(boleta)}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprobar
                </button>
                {!boletasObsBloqueadas.has(boleta.id_boleta) && (
                  <button
                    type="button"
                    onClick={() => manejarObservar(boleta)}
                    className="flex-1 md:flex-none bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Observar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => manejarRechazar(boleta)}
                  className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarDetalles && boletaSeleccionada && (
        <BoletaDetallesModal
          boleta={boletaSeleccionada}
          onClose={() => {
            setMostrarDetalles(false);
            setBoletaSeleccionada(null);
          }}
          onUpdated={refrescar}
        />
      )}

      {/* Modal de Observación */}
      {mostrarObservacion && boletaParaObservacion && (
        <ObservacionModal
          open={mostrarObservacion}
          onClose={() => {
            setMostrarObservacion(false);
            setBoletaParaObservacion(null);
          }}
          onSubmit={async ({ comentario_general, observacion }) => {
            try {
              const jefeId = me?.user_id || me?.id_usuario || null;

              // Intentar crear la aprobación observada por primera vez
              const data = await aprobacionService.observar({
                id_solicitud: boletaParaObservacion.id_boleta,
                jefe_id: jefeId,
                comentario_general,
                observaciones: [observacion],
              });

              // Si se creó bien, simplemente avisamos y refrescamos
              if (data && data.id_aprobacion) {
                alert('Observación registrada correctamente');
                setMostrarObservacion(false);
                setBoletaParaObservacion(null);
                refrescar();
                return;
              }

              alert('Observación registrada correctamente');
              setMostrarObservacion(false);
              setBoletaParaObservacion(null);
              refrescar();
            } catch (e) {
              console.error('Error al registrar la observación', e);
              const msg = e.message || 'Error desconocido';
              console.log('Mensaje de error al registrar observación (lista):', msg);

              // Si el backend indica que ya existe una aprobación para esta solicitud,
              // no mostramos ese error, sino que usamos la aprobación existente
              if (msg.toLowerCase().includes('ya existe una aprob')) {
                try {
                  const aprobacion = await aprobacionService.getAprobacionPorSolicitud(
                    boletaParaObservacion.id_boleta
                  );
                  if (aprobacion?.id_aprobacion) {
                    await aprobacionService.crearObservacion(aprobacion.id_aprobacion, observacion);
                    alert('Observación registrada correctamente');
                    setMostrarObservacion(false);
                    setBoletaParaObservacion(null);
                    refrescar();
                    // Marcamos la boleta como que ya tiene aprobación para no volver a intentar observar
                    setBoletasObsBloqueadas(prev => new Set(prev).add(boletaParaObservacion.id_boleta));
                    return;
                  }
                } catch (innerErr) {
                  console.error('Error al usar aprobación existente para observación', innerErr);
                  alert('Error al registrar la observación: no se pudo usar la aprobación existente');
                  return;
                }

                alert('Error al registrar la observación: no se encontró aprobación existente para esta solicitud');
              } else {
                alert(`Error al registrar la observación: ${msg}`);
              }
            }
          }}
        />
      )}
    </div>
  );
};
