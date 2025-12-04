// src/components/empresa/EmpresaViewModal.jsx
import { useState, useEffect } from 'react';
import { X, Building2, Edit, Trash2, RotateCcw, Calendar, FileText } from 'lucide-react';
import { empresaService } from '../../../services/boleta_permiso/empresaService';

export const EmpresaViewModal = ({ empresaId, onClose, onEdit }) => {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEmpresa();
  }, [empresaId]);

  const cargarEmpresa = async () => {
    setLoading(true);
    try {
      const data = await empresaService.getEmpresaById(empresaId);
      setEmpresa(data);
    } catch (error) {
      console.error('Error al cargar empresa:', error);
      alert('Error al cargar los detalles de la empresa');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  const estaActiva = () => {
    return empresa?.estado === 'A';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{empresa.nombre_empresa}</h2>
                <p className="text-gray-400 text-sm mt-1">ID: #{empresa.id_empresa}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Estado */}
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border inline-flex items-center gap-2 ${
              estaActiva()
                ? 'bg-green-900/30 text-green-400 border-green-600' 
                : 'bg-gray-700/30 text-gray-400 border-gray-600'
            }`}>
              {estaActiva() ? '✓ Activa' : '✗ Inactiva'}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información General */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Información General</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">ID Empresa</p>
                <p className="text-white font-semibold">#{empresa.id_empresa}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Nombre</p>
                <p className="text-white font-semibold">{empresa.nombre_empresa}</p>
              </div>
              {empresa.ruc && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">RUC</p>
                  <p className="text-white font-semibold">{empresa.ruc}</p>
                </div>
              )}
              {empresa.telefono && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                  <p className="text-white font-semibold">{empresa.telefono}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm mb-1">Estado</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${
                  estaActiva()
                    ? 'bg-green-900/30 text-green-400 border-green-600' 
                    : 'bg-gray-700/30 text-gray-400 border-gray-600'
                }`}>
                  {estaActiva() ? '✓ Activa' : '✗ Inactiva'}
                </span>
              </div>
              {empresa.fecha_registro && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Fecha de Registro</p>
                  <p className="text-white">{formatearFecha(empresa.fecha_registro)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dirección */}
          {empresa.direccion && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Dirección</h3>
              </div>
              <p className="text-gray-300">{empresa.direccion}</p>
            </div>
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
            {estaActiva() && (
              <button
                onClick={() => onEdit(empresa)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
