// src/components/roles/RoleViewModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Shield, Users, ListChecks } from 'lucide-react';
import { rolService } from '../../services/rolService';

export const RoleViewModal = ({ rolId, onClose }) => {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await rolService.getRoleById(rolId);
        setRol(data);
        const permisosData = await rolService.getRolePermissions(rolId);
        setPermisos(permisosData.permisos || permisosData);
      } catch (err) {
        console.error('Error al cargar rol:', err);
        setError(err.message || 'Error al cargar el rol');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rolId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto" />
          <p className="text-gray-400 mt-4">Cargando rol...</p>
        </div>
      </div>
    );
  }

  if (error || !rol) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <p className="text-red-400 mb-4">{error || 'Rol no encontrado'}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const permisosLista = Array.isArray(permisos)
    ? permisos
    : permisos.permisos || [];

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {rol.nombre_rol_texto || rol.nombre_rol}
              </h3>
              <p className="text-gray-400 text-sm mt-1">ID: #{rol.id_rol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información general */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Nombre interno</p>
                <p className="text-white font-semibold">{rol.nombre_rol}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Nivel de acceso</p>
                <p className="text-white">
                  {rol.nivel_acceso_texto || `Nivel ${rol.nivel_acceso}`}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Estado</p>
                <p className="text-white">
                  {rol.estado_texto || (rol.estado === 'A' ? 'Activo' : 'Inactivo')}
                </p>
              </div>
              {rol.estadisticas && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-300">
                    {rol.estadisticas.total_usuarios} usuarios con este rol
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          {rol.descripcion && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Descripción</p>
              <p className="text-gray-200 text-sm">{rol.descripcion}</p>
            </div>
          )}

          {/* Permisos */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-blue-400" />
              <p className="text-gray-200 font-semibold text-sm">Permisos</p>
            </div>
            {permisosLista && permisosLista.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {permisosLista.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-full text-xs bg-gray-800 border border-gray-600 text-gray-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Sin permisos configurados.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
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
