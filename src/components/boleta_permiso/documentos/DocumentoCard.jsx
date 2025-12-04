// src/components/documentos/DocumentoCard.jsx
import React, { useState } from 'react';
import { 
  Eye, 
  Trash2, 
  FileText,
  User,
  Calendar,
  HardDrive,
  FileCheck,
  Building2,
  Download,
  Loader2
} from 'lucide-react';
import { documentoService } from '../../services/documentoService';

export const DocumentoCard = ({ documento, onViewDetails, onDelete }) => {
  const [downloading, setDownloading] = useState(false);
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
    <div className="bg-gray-700 rounded-lg p-5 hover:bg-gray-700/80 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Información Principal */}
        <div className="flex-1 space-y-3">
          {/* Header con Tipo */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {documentoService.getFileIcon(documento.extension)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {documento.nombre_archivo}
                  </h3>
                  <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium ${
                    documentoService.getTipoColor(documento.tipo_documento)
                  }`}>
                    {documento.tipo_documento}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {/* Empleado */}
            <div className="flex items-center gap-2 text-gray-300">
              <User className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Empleado</p>
                <p className="font-medium">{empleado?.nombre_completo || 'N/A'}</p>
              </div>
            </div>

            {/* Área */}
            <div className="flex items-center gap-2 text-gray-300">
              <Building2 className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Área</p>
                <p className="font-medium">{empleado?.area_nombre || 'N/A'}</p>
              </div>
            </div>

            {/* Tamaño */}
            <div className="flex items-center gap-2 text-gray-300">
              <HardDrive className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Tamaño</p>
                <p className="font-medium">
                  {documentoService.formatearTamanio(documento.tamanio_kb)}
                </p>
              </div>
            </div>

            {/* Fecha de Subida */}
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Subido</p>
                <p className="font-medium">
                  {new Date(documento.fecha_subida).toLocaleDateString('es-PE')}
                </p>
              </div>
            </div>
          </div>

          {/* Información de la Boleta */}
          {boleta && (
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-600">
              <div className="flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-blue-400" />
                <span>Boleta: <span className="text-white font-mono">#{boleta.id_boleta}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-purple-400" />
                <span>Tipo: <span className="text-white">{boleta.tipo_motivo}</span></span>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  boleta.estado === 'Pendiente Jefe' ? 'bg-yellow-900/30 text-yellow-400' :
                  boleta.estado === 'Pendiente Registro' ? 'bg-blue-900/30 text-blue-400' :
                  boleta.estado === 'Registrado' ? 'bg-green-900/30 text-green-400' :
                  'bg-gray-900/30 text-gray-400'
                }`}>
                  {boleta.estado}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex lg:flex-col gap-2">
          {/* Ver en navegador */}
          <button
            onClick={handleView}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            title="Ver documento en nueva pestaña"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>

          {/* Descargar */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Descargar documento"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </>
            )}
          </button>

          {/* Ver Detalles */}
          <button
            onClick={() => onViewDetails(documento)}
            className="flex-1 lg:flex-none bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            title="Ver detalles completos"
          >
            <FileText className="w-4 h-4" />
            <span>Detalles</span>
          </button>

          {/* Eliminar */}
          <button
            onClick={() => onDelete(documento)}
            className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            title="Eliminar documento"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};