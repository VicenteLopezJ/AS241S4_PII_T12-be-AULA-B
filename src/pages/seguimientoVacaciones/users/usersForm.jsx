import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Users, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { listarEmpleadosSinUsuario, agregarUser, actualizarUser } from '../../../services/seguimientoVacaciones/usersService';

const UsersFormModal = ({ isOpen, onClose, onSuccess, userToEdit }) => {
  const isEdit = !!userToEdit;

  const initialForm = {
    employee_id: '',
    first_name: '',
    last_name: '',
    employee_position: '',
    username: '',
    password: '',
    user_type: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [empleados, setEmpleados] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' });

  // Cargar empleados y precargar datos si es edición
  useEffect(() => {
    if (isOpen) {
      if (isEdit && userToEdit) {
        // Modo edición: precargar datos del usuario
        setFormData({
          employee_id: userToEdit.employee_id || '',
          first_name: userToEdit.first_name || '',
          last_name: userToEdit.last_name || '',
          employee_position: userToEdit.employee_position || '',
          username: userToEdit.username || '',
          password: '', // No precargar password por seguridad
          user_type: userToEdit.user_type || ''
        });
      } else {
        // Modo agregar: resetear formulario y cargar empleados
        setFormData(initialForm);
        cargarEmpleados();
      }
      setErrors({});
      setShowPassword(false);
      setPasswordStrength({ strength: 0, label: '', color: '' });
    }
  }, [isOpen, isEdit, userToEdit]);

  const cargarEmpleados = async () => {
    try {
      const data = await listarEmpleadosSinUsuario();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setEmpleados([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Actualizar fuerza de contraseña en tiempo real
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmpleadoChange = (e) => {
    const selectedId = e.target.value;
    const empleado = empleados.find(emp => emp.employee_id.toString() === selectedId);

    if (empleado) {
      setFormData(prev => ({
        ...prev,
        employee_id: empleado.employee_id,
        first_name: empleado.first_name,
        last_name: empleado.last_name,
        employee_position: empleado.employee_position,
        username: '',
        password: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        employee_id: '',
        first_name: '',
        last_name: '',
        employee_position: '',
        username: '',
        password: ''
      }));
    }

    if (errors.employee_id) {
      setErrors(prev => ({ ...prev, employee_id: '' }));
    }
  };

  // Validación de contraseña fuerte
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#\-+=])[A-Za-z\d@$!%*?&_#\-+=]{8,}$/;
    return regex.test(password);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;

    // Criterios de fuerza
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 20;

    // Determinar label y color
    if (strength <= 40) return { strength, label: 'Débil', color: 'bg-red-500' };
    if (strength <= 70) return { strength, label: 'Media', color: 'bg-yellow-500' };
    return { strength, label: 'Fuerte', color: 'bg-green-500' };
  };

  // Validación completa del formulario
  const validateForm = () => {
    const newErrors = {};

    // Username obligatorio
    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El username debe tener al menos 3 caracteres';
    }

    // Tipo de usuario obligatorio
    if (!formData.user_type) {
      newErrors.user_type = 'Seleccione un tipo de usuario';
    }

    // Empleado obligatorio solo en modo agregar
    if (!isEdit && !formData.employee_id) {
      newErrors.employee_id = 'Seleccione un empleado';
    }

    // Password obligatorio solo en modo agregar
    if (!isEdit) {
      if (!formData.password.trim()) {
        newErrors.password = 'La contraseña es requerida';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial (@$!%*?&_#-+=)';
      }
    } else {
      // En modo edición, validar solo si se ingresó una nueva contraseña
      if (formData.password.trim() && !validatePassword(formData.password)) {
        newErrors.password = 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial (@$!%*?&_#-+=)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, rellene todos los campos',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar
      const dataToSend = { ...formData };

      // Si es edición y no se cambió el password, no enviarlo
      if (isEdit && !dataToSend.password.trim()) {
        delete dataToSend.password;
      }

      if (isEdit) {
        await actualizarUser(userToEdit.users_id, dataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'El usuario se ha actualizado correctamente',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          timer: 2000,
          color: '#fff'
        });
      } else {
        await agregarUser(dataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario se ha creado correctamente',
          confirmButtonColor: '#10b981',
          color: '#fff',
          background: '#243447',
          timer: 2000
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Hubo un problema al guardar el usuario. Intente nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p className="text-emerald-50 text-xs mt-0.5">
                {isEdit ? 'Modifica la información del usuario' : 'Completa la información del nuevo usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <div className="px-6 py-5 space-y-4 bg-gray-900/50">
          {/* Selector de Empleado (solo en modo agregar) */}
          {!isEdit && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Seleccionar Empleado *
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleEmpleadoChange}
                className={`w-full px-4 py-2.5 bg-gray-800/80 border ${errors.employee_id ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all`}
              >
                <option value="">Seleccione un empleado</option>
                {empleados.length > 0 ? (
                  empleados.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} - {emp.employee_position}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay empleados disponibles</option>
                )}
              </select>
              {errors.employee_id && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.employee_id}
                </p>
              )}
            </div>
          )}

          {/* Datos del Empleado (solo lectura) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Nombre</label>
              <input
                type="text"
                value={formData.first_name}
                readOnly
                placeholder="Nombre"
                className="w-full px-3 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Apellido</label>
              <input
                type="text"
                value={formData.last_name}
                readOnly
                placeholder="Apellido"
                className="w-full px-3 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Cargo</label>
              <input
                type="text"
                value={formData.employee_position}
                readOnly
                placeholder="Cargo"
                className="w-full px-3 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Username, Password y Tipo de Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Username */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingrese username"
                className={`w-full px-3 py-2.5 bg-gray-800/80 border ${errors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all`}
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Password {!isEdit && '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEdit ? 'Dejar vacío para no cambiar' : '••••••••'}
                  className={`w-full px-3 py-2.5 pr-10 bg-gray-800/80 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Barra de fuerza de contraseña */}
              {formData.password && (
                <div className="mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.strength <= 40 ? 'text-red-400' :
                      passwordStrength.strength <= 70 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Tipo de Usuario */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Tipo de Usuario *
              </label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-gray-800/80 border ${errors.user_type ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all`}
              >
                <option value="">Seleccione tipo</option>
                <option value="Empleado Comun">Empleado Comun</option>
                <option value="Jefe de Area">Jefe de Área</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.user_type && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.user_type}
                </p>
              )}
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5">
            <p className="text-emerald-300 text-xs flex items-start gap-2">
              <span className="text-base">ℹ️</span>
              <span>
                {isEdit
                  ? 'Puede actualizar el username y tipo de usuario. Si desea cambiar la contraseña, ingrese una nueva.'
                  : 'La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).'}
              </span>
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {isEdit ? '✓ Actualizar Usuario' : '+ Agregar Usuario'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersFormModal;