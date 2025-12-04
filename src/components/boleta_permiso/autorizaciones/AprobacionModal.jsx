// src/components/boleta_permiso/autorizaciones/AprobacionModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

// ✅ CORRECCIÓN: Cambiar de ../../ a ../../../
import { autorizacionService } from '../../../services/boleta_permiso/autorizacionService';

export const AprobacionModal = ({ autorizacion, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null); // 'aprobar' | 'rechazar' | 'observar'
  const [formData, setFormData] = useState({
    comentario_jefe: '',
    observaciones: [] // { tipo_observacion, descripcion_observacion }
  });

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (accion === 'rechazar' && !formData.comentario_jefe.trim()) {
      setError('El motivo de rechazo es obligatorio');
      return;
    }

    if ((accion === 'rechazar' || accion === 'observar') && formData.observaciones.length === 0) {
      setError('Debe agregar al menos una observación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (accion === 'aprobar') {
        await autorizacionService.aprobarBoleta(autorizacion.boleta_id, formData.comentario_jefe);
      } else if (accion === 'rechazar') {
        await autorizacionService.rechazarBoleta(
          autorizacion.boleta_id,
          formData.comentario_jefe,
          formData.observaciones
        );
      } else if (accion === 'observar') {
        await autorizacionService.observarBoleta(
          autorizacion.boleta_id,
          formData.observaciones
        );
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!autorizacion) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {accion === 'aprobar' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : accion === 'rechazar' ? (
                <XCircle className="w-6 h-6 text-red-400" />
              ) : accion === 'observar' ? (
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              )}
              Gestionar Aprobación
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Boleta #{autorizacion.boleta_id} - {autorizacion.boleta?.empleado_nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Información de la Boleta */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Información del Permiso</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Empleado</p>
                <p className="text-white font-medium">{autorizacion.boleta?.empleado_nombre}</p>
              </div>
              <div>
                <p className="text-gray-400">Área</p>
                <p className="text-white font-medium">{autorizacion.boleta?.area_nombre}</p>
              </div>
              <div>
                <p className="text-gray-400">Fecha Permiso</p>
                <p className="text-white font-medium">
                  {autorizacionService.formatearFecha(autorizacion.boleta?.fecha_permiso)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Duración</p>
                <p className="text-white font-medium">{autorizacion.boleta?.horas_duracion}h</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Motivo</p>
                <p className="text-white">{autorizacion.boleta?.motivo}</p>
              </div>
            </div>
          </div>

          {/* Selección de Acción */}
          {!accion && (
            <div className="space-y-3">
              <p className="text-gray-300 text-center mb-4">
                ¿Qué acción desea realizar con esta boleta?
              </p>
              <button
                onClick={() => setAccion('aprobar')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Aprobar Boleta
              </button>
              <button
                onClick={() => setAccion('rechazar')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Rechazar Boleta
              </button>
              <button
                onClick={() => setAccion('observar')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                Observar Boleta
              </button>
            </div>
          )}

          {/* Formulario */}
          {accion && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`rounded-lg p-4 border ${
                accion === 'aprobar'
                  ? 'bg-green-900/20 border-green-600'
                  : accion === 'rechazar'
                    ? 'bg-red-900/20 border-red-600'
                    : 'bg-yellow-900/20 border-yellow-600'
              }`}>
                <p className="text-white font-medium mb-2">
                  {accion === 'aprobar'
                    ? '✅ Aprobar Boleta'
                    : accion === 'rechazar'
                      ? '❌ Rechazar Boleta'
                      : '⚠️ Observar Boleta'}
                </p>
                <p className="text-sm text-gray-300">
                  {accion === 'aprobar'
                    ? 'La boleta pasará a "Pendiente Registro" y podrá ser registrada en el sistema de asistencia.'
                    : accion === 'rechazar'
                      ? 'La boleta será rechazada y el empleado será notificado.'
                      : 'La boleta quedará en estado "Observada" y el empleado deberá corregir y reenviar.'}
                </p>
              </div>

              {/* Comentario general solo para aprobar/rechazar */}
              {(accion === 'aprobar' || accion === 'rechazar') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Comentario {accion === 'rechazar' && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    value={formData.comentario_jefe}
                    onChange={(e) => setFormData({ ...formData, comentario_jefe: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder={
                      accion === 'aprobar'
                        ? 'Comentario opcional...'
                        : 'Motivo del rechazo (obligatorio)...'
                    }
                    disabled={loading}
                    required={accion === 'rechazar'}
                  />
                </div>
              )}

              {/* Observaciones para rechazar / observar */}
              {(accion === 'rechazar' || accion === 'observar') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-300">
                      Observaciones <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          observaciones: [
                            ...formData.observaciones,
                            { tipo_observacion: 'OTRO', descripcion_observacion: '' }
                          ]
                        });
                        setError(null);
                      }}
                      disabled={loading}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                    >
                      + Agregar observación
                    </button>
                  </div>

                  {formData.observaciones.length === 0 && (
                    <p className="text-xs text-gray-400">
                      Agrega al menos una observación indicando qué debe corregir el empleado.
                    </p>
                  )}

                  {formData.observaciones.map((obs, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start bg-gray-700/50 rounded-lg p-3"
                    >
                      <select
                        value={obs.tipo_observacion}
                        onChange={(e) => {
                          const nuevo = [...formData.observaciones];
                          nuevo[index] = {
                            ...nuevo[index],
                            tipo_observacion: e.target.value
                          };
                          setFormData({ ...formData, observaciones: nuevo });
                        }}
                        className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                      >
                        <option value="DOCUMENTO_INCOMPLETO">DOCUMENTO_INCOMPLETO</option>
                        <option value="DOCUMENTO_ILEGIBLE">DOCUMENTO_ILEGIBLE</option>
                        <option value="FECHA_INVALIDA">FECHA_INVALIDA</option>
                        <option value="HORARIO_CONFLICTO">HORARIO_CONFLICTO</option>
                        <option value="JUSTIFICACION_INSUFICIENTE">JUSTIFICACION_INSUFICIENTE</option>
                        <option value="OTRO">OTRO</option>
                      </select>

                      <textarea
                        value={obs.descripcion_observacion}
                        onChange={(e) => {
                          const nuevo = [...formData.observaciones];
                          nuevo[index] = {
                            ...nuevo[index],
                            descripcion_observacion: e.target.value
                          };
                          setFormData({ ...formData, observaciones: nuevo });
                        }}
                        className="md:col-span-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[50px]"
                        placeholder="Describe brevemente la observación..."
                        disabled={loading}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const nuevo = formData.observaciones.filter((_, i) => i !== index);
                          setFormData({ ...formData, observaciones: nuevo });
                        }}
                        disabled={loading}
                        className="text-xs text-red-400 hover:text-red-300 mt-1"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAccion(null);
                    setFormData({ comentario_jefe: '', observaciones: [] });
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    accion === 'aprobar'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : accion === 'rechazar'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {accion === 'aprobar' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Confirmar Aprobación
                        </>
                      ) : accion === 'rechazar' ? (
                        <>
                          <XCircle className="w-5 h-5" />
                          Confirmar Rechazo
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          Confirmar Observación
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};