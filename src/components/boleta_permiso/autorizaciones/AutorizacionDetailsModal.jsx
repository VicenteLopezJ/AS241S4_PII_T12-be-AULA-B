// src/components/boleta_permiso/autorizaciones/AutorizacionDetailsModal.jsx
import React from 'react';
import { 
  X, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  FileText,
  CheckCircle,
  XCircle,
  Mail,
  Briefcase,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { autorizacionService } from "../../../services/boleta_permiso/autorizacionService";

export const AutorizacionDetailsModal = ({ autorizacion, onClose }) => {
  if (!autorizacion) return null;

  const { boleta, jefe, admin, documentos = [] } = autorizacion;

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start rounded-t-lg">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-blue-400" />
              Detalle de Autorización #{autorizacion.id_autorizacion}
            </h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${
              autorizacionService.getEstadoColor(autorizacion.estado)
            }`}>
              {autorizacion.estado}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Información del Empleado */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Empleado
            </h4>
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Nombre Completo</p>
                  <p className="text-white font-medium">{boleta?.empleado_nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cargo</p>
                  <p className="text-white font-medium">{boleta?.empleado_cargo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Área
                  </p>
                  <p className="text-white font-medium">{boleta?.area_nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ID Empleado</p>
                  <p className="text-white font-mono">{boleta?.empleado_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Permiso */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detalles del Permiso
            </h4>
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Fecha de Permiso
                  </p>
                  <p className="text-white font-medium">
                    {autorizacionService.formatearFecha(boleta?.fecha_permiso)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hora de Salida
                  </p>
                  <p className="text-white font-medium">
                    {autorizacionService.formatearHora(boleta?.hora_salida)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Duración</p>
                  <p className="text-white font-medium">{boleta?.horas_duracion || 0} horas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-600">
                <div>
                  <p className="text-xs text-gray-400">Tipo de Motivo</p>
                  <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium ${
                    autorizacionService.getTipoMotivoColor(boleta?.tipo_motivo)
                  }`}>
                    {boleta?.tipo_motivo || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Requiere Prueba</p>
                  <p className="text-white font-medium">
                    {boleta?.requiere_prueba === 'S' ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-600">
                <p className="text-xs text-gray-400 mb-2">Motivo Detallado</p>
                <p className="text-white bg-gray-700/50 rounded p-3">
                  {boleta?.motivo || 'Sin descripción'}
                </p>
              </div>
            </div>
          </div>

          {/* Documentos Adjuntos */}
          {documentos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentos Adjuntos ({documentos.length})
              </h4>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="space-y-2">
                  {documentos.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-600/50 rounded p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{doc.nombre_archivo}</p>
                          <p className="text-xs text-gray-400">
                            {doc.tipo_documento} • {doc.tamanio_kb} KB • {doc.extension}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Aprobación del Jefe */}
          {autorizacion.aprobado_jefe !== 'N' && jefe && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                {autorizacion.aprobado_jefe === 'S' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {autorizacion.aprobado_jefe_texto}
              </h4>
              <div className={`rounded-lg p-4 border ${
                autorizacion.aprobado_jefe === 'S' 
                  ? 'bg-green-900/20 border-green-700/30' 
                  : 'bg-red-900/20 border-red-700/30'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`rounded-full p-2 ${
                    autorizacion.aprobado_jefe === 'S' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{jefe.nombre_completo}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {jefe.cargo}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {jefe.correo}
                    </p>
                  </div>
                </div>
                
                {autorizacion.comentario_jefe && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-1">Comentario:</p>
                    <p className="text-white text-sm">{autorizacion.comentario_jefe}</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  {autorizacionService.formatearFecha(autorizacion.fecha_autorizacion_jefe)}
                </p>
              </div>
            </div>
          )}

          {/* Registro en Asistencia */}
          {autorizacion.registrado_asistencia === 'S' && admin && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                Registro en Sistema de Asistencia
              </h4>
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-600 rounded-full p-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{admin.nombre_completo}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {admin.cargo}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {admin.correo}
                    </p>
                  </div>
                </div>
                
                {autorizacion.comentario_admin && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-1">Comentario:</p>
                    <p className="text-white text-sm">{autorizacion.comentario_admin}</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  {autorizacionService.formatearFecha(autorizacion.fecha_registro_admin)}
                </p>
              </div>
            </div>
          )}

          {/* Alerta si está pendiente */}
          {autorizacion.estado === 'Pendiente Jefe' && (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Pendiente de Aprobación</p>
                <p className="text-sm text-gray-300 mt-1">
                  Esta boleta está esperando la aprobación del jefe de área.
                </p>
              </div>
            </div>
          )}

          {autorizacion.estado === 'Pendiente Registro' && (
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium">Pendiente de Registro</p>
                <p className="text-sm text-gray-300 mt-1">
                  Esta boleta fue aprobada y está esperando ser registrada en el sistema de asistencia.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};