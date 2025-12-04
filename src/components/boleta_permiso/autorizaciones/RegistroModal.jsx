// src/components/autorizaciones/RegistroModal.jsx
import React, { useState } from "react";
import { X, FileCheck, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { autorizacionService } from "../../../services/boleta_permiso/autorizacionService";

export const RegistroModal = ({ autorizacion, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    admin_id: '',
    comentario_admin: 'Registrado en sistema de asistencia'
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.admin_id) {
      setError('Debe ingresar el ID del administrador');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await autorizacionService.registrarEnAsistencia(
        autorizacion.id_autorizacion, 
        formData
      );
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
              <FileCheck className="w-6 h-6 text-blue-400" />
              Registrar en Sistema de Asistencia
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Información de la Boleta Aprobada */}
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-400 font-medium mb-2">Boleta Aprobada</p>
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
                </div>
                
                {autorizacion.jefe && (
                  <div className="mt-3 pt-3 border-t border-green-700">
                    <p className="text-xs text-gray-400">Aprobado por:</p>
                    <p className="text-white text-sm">{autorizacion.jefe.nombre_completo}</p>
                    <p className="text-xs text-gray-400">
                      {autorizacionService.formatearFecha(autorizacion.fecha_autorizacion_jefe)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerta Informativa */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">Importante</p>
              <p className="text-sm text-gray-300 mt-1">
                Al registrar esta boleta en el sistema de asistencia, se aplicarán los descuentos 
                correspondientes según las horas de permiso. Este proceso es irreversible.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID del Administrador <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.admin_id}
                onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 9"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Ingrese su ID de empleado como administrador
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comentario
              </label>
              <textarea
                value={formData.comentario_admin}
                onChange={(e) => setFormData({...formData, comentario_admin: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                placeholder="Comentario adicional (opcional)..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  Confirmar Registro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};