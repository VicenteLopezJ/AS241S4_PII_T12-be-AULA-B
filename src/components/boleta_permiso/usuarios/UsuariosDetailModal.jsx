// src/components/usuarios/UsuariosDetailModal.jsx
import React from 'react';
import { X, User, Mail, Phone, Building, Calendar } from 'lucide-react';

export const UsuariosDetailModal = ({ usuario, onClose }) => {
  if (!usuario) return null;

  const formatDate = (value) => {
    if (!value) return 'No especificado';
    try {
      const d = new Date(value);
      return d.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Detalles del Usuario
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Nombre completo</p>
            <p className="text-white font-semibold">{usuario.nombre_completo || `${usuario.nombres || ''} ${usuario.apellidos || ''}`}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Documento</p>
              <p className="text-white">
                {usuario.tipo_documento || 'Documento'}: {usuario.documento || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Cargo</p>
              <p className="text-white">{usuario.cargo || 'No especificado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-green-400" /> Correo
              </p>
              <p className="text-white break-all">{usuario.correo || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-green-400" /> Teléfono
              </p>
              <p className="text-white">{usuario.telefono || 'No especificado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-purple-400" /> Área
              </p>
              <p className="text-white">{usuario.area_nombre || usuario.area?.nombre_area || `Área ID: ${usuario.area_id || 'No especificado'}`}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-400" /> Fecha de ingreso
              </p>
              <p className="text-white">{formatDate(usuario.fecha_ingreso)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Rol</p>
              <p className="text-white">{usuario.rol_nombre || `Rol ID: ${usuario.rol_id || 'No especificado'}`}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Estado</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                usuario.estado === 'A' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {usuario.estado === 'A' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
