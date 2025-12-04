import React, { useState, useEffect } from 'react';
import { userService } from '../../services/user/userService';

const UserForm = ({ user, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    rol: '',
    status: 1
  });
  const [roles, setRoles] = useState(['admin', 'editor', 'cliente']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        user_name: user.user_name || '',
        password: '',
        rol: user.rol || '',
        status: user.status || 1
      });
    }
    loadRoles();
  }, [user, isEditing]);

  const loadRoles = async () => {
    try {
      const rolesData = await userService.getRoles();
      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'El nombre de usuario es requerido';
    }
    
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Si estamos editando y no hay contraseña, no la incluimos
      const dataToSend = { ...formData };
      if (isEditing && !formData.password.trim()) {
        delete dataToSend.password;
      }
      
      await onSave(dataToSend);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre de Usuario */}
      <div>
        <label 
          htmlFor="user_name" 
          className="block text-sm font-medium text-slate-200 mb-2"
        >
          Nombre de Usuario:
        </label>
        <input
          type="text"
          id="user_name"
          name="user_name"
          value={formData.user_name}
          onChange={handleChange}
          disabled={loading}
          className={`w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
            errors.user_name 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-500 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors.user_name && (
          <span className="text-red-400 text-sm mt-1 block">{errors.user_name}</span>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-slate-200 mb-2"
        >
          Contraseña {isEditing ? '(dejar vacío para mantener la actual)' : ''}:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          className={`w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
            errors.password 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-500 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors.password && (
          <span className="text-red-400 text-sm mt-1 block">{errors.password}</span>
        )}
      </div>

      {/* Rol */}
      <div>
        <label 
          htmlFor="rol" 
          className="block text-sm font-medium text-slate-200 mb-2"
        >
          Rol:
        </label>
        <select
          id="rol"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          disabled={loading}
          className={`w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 transition-colors ${
            errors.rol 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-500 focus:border-blue-500 focus:ring-blue-500'
          }`}
        >
          <option value="">Selecciona un rol</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        {errors.rol && (
          <span className="text-red-400 text-sm mt-1 block">{errors.rol}</span>
        )}
      </div>

      {/* Estado (solo para edición) */}
      {isEditing && (
        <div>
          <label 
            htmlFor="status" 
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            Estado:
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-slate-500 rounded-md bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="px-4 py-2 border border-slate-500 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;