// src/components/documentos/DocumentoDetailsModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  HardDrive,
  FileCheck,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import { documentoService } from '../../services/documentoService';

export const DocumentoDetailsModal = ({ documento, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  
  if (!documento) return null;

  const { boleta, empleado } = documento;

  const handleView = () => {
    documentoService.viewDocumento(documento.id_documento);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await documentoService.downloadDocumento(
        documento.id_documento,
        documento.nombre_archivo
      );
    } catch (error) {
      alert(`Error al descargar: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start rounded-t-lg z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">
                {documentoService.getFileIcon(documento.extension)}
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {documento.nombre_archivo}
                </h3>
                <p className="text-sm text-gray-400">
                  ID Documento: #{documento.id_documento}
                </p>
              </div>
            </div>
            <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
              documentoService.getTipoColor(documento.tipo_documento)
            }`}>
              {documento.tipo_documento}
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
          
          {/* Botones de Acción Rápida */}
          <div className="flex gap-3">
            <button
              onClick={handleView}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Ver Documento
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Descargar
                </>
              )}
            </button>
          </div>

          {/* Información del Archivo */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Información del Archivo
            </h4>
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Nombre del Archivo</p>
                  <p className="text-white font-medium break-all">{documento.nombre_archivo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Extensión</p>
                  <p className="text-white font-medium uppercase">{documento.extension}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    Tamaño
                  </p>
                  <p className="text-white font-medium">
                    {documentoService.formatearTamanio(documento.tamanio_kb)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Fecha de Subida
                  </p>
                  <p className="text-white font-medium">
                    {documentoService.formatearFecha(documento.fecha_subida)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Ruta del Archivo</p>
                  <p className="text-white font-mono text-sm bg-gray-700/50 rounded p-2 break-all">
                    {documento.ruta_archivo}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Empleado */}
          {empleado && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Empleado
              </h4>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Nombre Completo</p>
                    <p className="text-white font-medium">{empleado.nombre_completo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Área
                    </p>
                    <p className="text-white font-medium">{empleado.area_nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ID Empleado</p>
                    <p className="text-white font-mono">{empleado.id_empleado}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de la Boleta */}
          {boleta && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Información de la Boleta
              </h4>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">ID Boleta</p>
                    <p className="text-white font-mono font-medium">#{boleta.id_boleta}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Estado</p>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                      boleta.estado === 'Pendiente Jefe' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-600' :
                      boleta.estado === 'Pendiente Registro' ? 'bg-blue-900/30 text-blue-400 border border-blue-600' :
                      boleta.estado === 'Registrado' ? 'bg-green-900/30 text-green-400 border border-green-600' :
                      'bg-gray-900/30 text-gray-400 border border-gray-600'
                    }`}>
                      {boleta.estado}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fecha del Permiso
                    </p>
                    <p className="text-white font-medium">
                      {new Date(boleta.fecha_permiso).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tipo de Motivo</p>
                    <p className="text-white font-medium">{boleta.tipo_motivo}</p>
                  </div>
                  {boleta.motivo && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Motivo</p>
                      <p className="text-white bg-gray-700/50 rounded p-2 text-sm">{boleta.motivo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alerta informativa */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">Documento de Soporte</p>
              <p className="text-sm text-gray-300 mt-1">
                Este documento fue adjuntado como prueba para respaldar la solicitud de permiso.
                {boleta?.estado === 'Pendiente Jefe' && ' La boleta está pendiente de aprobación del jefe de área.'}
                {boleta?.estado === 'Pendiente Registro' && ' La boleta fue aprobada y está pendiente de registro en asistencia.'}
                {boleta?.estado === 'Registrado' && ' La boleta ya fue registrada en el sistema de asistencia.'}
              </p>
            </div>
          </div>
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