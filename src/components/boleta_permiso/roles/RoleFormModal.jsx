// src/components/roles/RoleFormModal.jsx
import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Save } from 'lucide-react';
import { rolService } from '../../services/rolService';

export const RoleFormModal = ({ rol, onClose, onSuccess }) => {
  const isEditing = !!rol;
  const [formData, setFormData] = useState({
    nombre_rol: '',
    nivel_acceso: 1,
    descripcion: '',
    permisos: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rol) {
      setFormData({
        nombre_rol: rol.nombre_rol || '',
        nivel_acceso: rol.nivel_acceso || 1,
        descripcion: rol.descripcion || '',
        permisos: Array.isArray(rol.permisos_lista)
          ? rol.permisos_lista.join(', ')
          : rol.permisos || '',
      });
    }
  }, [rol]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre_rol.trim()) {
      newErrors.nombre_rol = 'El nombre del rol es requerido';
    }

    const nivel = Number(formData.nivel_acceso);
    if (!nivel || nivel < 1 || nivel > 3) {
      newErrors.nivel_acceso = 'El nivel de acceso debe estar entre 1 y 3';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        nombre_rol: formData.nombre_rol.trim().toUpperCase(),
        nivel_acceso: Number(formData.nivel_acceso),
        descripcion: formData.descripcion.trim() || null,
        permisos: formData.permisos.trim(),
      };

      if (isEditing) {
        // En backend, update_rol solo permite cambiar descripcion y permisos
        await rolService.updateRole(rol.id_rol, {
          descripcion: payload.descripcion,
          permisos: payload.permisos,
        });
      } else {
        await rolService.createRole(payload);
      }

      await onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar rol:', err);
      alert(err.message || 'Error al guardar rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Campos (máx 6) */}
        <div className="space-y-5">
          {/* Nombre del rol (string) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Rol
            </label>
            <input
              type="text"
              name="nombre_rol"
              value={formData.nombre_rol}
              onChange={handleChange}
              disabled={loading || isEditing}
              className={`w-full bg-gray-700 border ${
                errors.nombre_rol ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500`}
              placeholder="ADMIN_RRHH, JEFE_AREA, EMPLEADO"
            />
            {errors.nombre_rol && (
              <p className="text-red-400 text-sm mt-1">{errors.nombre_rol}</p>
            )}
          </div>

          {/* Nivel de acceso (number) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nivel de Acceso (1-3)
            </label>
            <input
              type="number"
              name="nivel_acceso"
              value={formData.nivel_acceso}
              onChange={handleChange}
              min={1}
              max={3}
              disabled={loading || isEditing}
              className={`w-full bg-gray-700 border ${
                errors.nivel_acceso ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500`}
            />
            {errors.nivel_acceso && (
              <p className="text-red-400 text-sm mt-1">{errors.nivel_acceso}</p>
            )}
          </div>

          {/* Descripción (string) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              disabled={loading}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Descripción del rol (opcional)"
            />
          </div>

          {/* Permisos (string) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permisos (separados por coma)
            </label>
            <input
              type="text"
              name="permisos"
              value={formData.permisos}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="ALL, CREAR_USUARIO, VER_USUARIO, ..."
            />
          </div>

          {/* ID de rol (number, solo edición, readonly) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID de Rol
              </label>
              <input
                type="number"
                value={rol.id_rol}
                readOnly
                disabled
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>
          )}

          {/* Estado (booleano, solo lectura) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado del Rol
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={rol.estado === 'A'}
                  readOnly
                  disabled
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">
                  {rol.estado === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-7">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Actualizar Rol' : 'Crear Rol'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
