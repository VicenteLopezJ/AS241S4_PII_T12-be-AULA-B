import React, { useState, useEffect } from 'react';
import roleService from '../../../services/intranet/role/roleService';

const UserForm = ({ user, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    first_name: '',   // ✅ nuevo campo
    last_name: '',    // ✅ nuevo campo
    email: '',        // ✅ nuevo campo
    password: '',
    role_id: '',
    status: 1
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        user_name: user.user_name || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        role_id: user.role_id || '',
        status: user.status || 1
      });
    }
    loadRoles();
  }, [user, isEditing]);

  const loadRoles = async () => {
    try {
      const rolesData = await roleService.getRoles();
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Nombre de usuario
  if (!formData.user_name.trim()) {
    newErrors.user_name = 'El nombre de usuario es requerido';
  } else if (formData.user_name.length < 4) {
    newErrors.user_name = 'Debe tener al menos 4 caracteres';
  }

  // Nombre
  if (!formData.first_name.trim()) {
    newErrors.first_name = 'El nombre es requerido';
  } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.first_name)) {
    newErrors.first_name = 'Solo se permiten letras';
  }

  // Apellido
  if (!formData.last_name.trim()) {
    newErrors.last_name = 'El apellido es requerido';
  } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.last_name)) {
    newErrors.last_name = 'Solo se permiten letras';
  }

  // Correo
  if (!formData.email.trim()) {
    newErrors.email = 'El correo es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'El correo no es válido';
  }
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }
    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const dataToSend = { 
        ...formData,
        role_id: parseInt(formData.role_id)
      };
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
      {/* Nombre */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-slate-200 mb-2">
          Nombre:
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
        />
        {errors.first_name && <span className="text-red-400 text-sm">{errors.first_name}</span>}
      </div>

      {/* Apellido */}
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-slate-200 mb-2">
          Apellido:
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
        />
        {errors.last_name && <span className="text-red-400 text-sm">{errors.last_name}</span>}
      </div>

      {/* Correo */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
          Correo:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
        />
        {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
      </div>

      {/* Nombre de Usuario */}
      <div>
        <label htmlFor="user_name" className="block text-sm font-medium text-slate-200 mb-2">
          Nombre de Usuario:
        </label>
        <input
          type="text"
          id="user_name"
          name="user_name"
          value={formData.user_name}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
        />
        {errors.user_name && <span className="text-red-400 text-sm">{errors.user_name}</span>}
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
          Contraseña {isEditing ? '(dejar vacío para mantener la actual)' : ''}:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
        />
        {errors.password && <span className="text-red-400 text-sm">{errors.password}</span>}
      </div>

      {/* Rol */}
      <div>
        <label htmlFor="role_id" className="block text-sm font-medium text-slate-200 mb-2">
          Rol:
        </label>
        <select
          id="role_id"
          name="role_id"
          value={formData.role_id}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
        >
          <option value="">Selecciona un rol</option>
          {roles.map(role => (
            <option key={role.role_id} value={role.role_id}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.role_id && <span className="text-red-400 text-sm">{errors.role_id}</span>}
      </div>

      {/* Estado (solo edición) */}
      {isEditing && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-200 mb-2">
            Estado:
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border rounded-md bg-slate-700 text-slate-200"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
        <button type="button" onClick={onCancel} disabled={loading}
          className="px-4 py-2 border rounded-md bg-slate-700 text-slate-200">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
