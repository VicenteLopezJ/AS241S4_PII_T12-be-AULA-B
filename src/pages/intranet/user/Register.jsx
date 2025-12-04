import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../../services/intranet/user/userService';
import roleService from '../../../services/intranet/role/roleService';

const Register = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    role_id: '' // CAMBIADO: usar role_id en lugar de rol
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      // CAMBIADO: usar roleService en lugar de userService
      const rolesData = await roleService.getRoles();
      console.log('Roles cargados:', rolesData); // Debug
      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setError('No se pudieron cargar los roles');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convertir role_id a número antes de enviar
      const dataToSend = {
        ...formData,
        role_id: parseInt(formData.role_id)
      };
      console.log('Registrando usuario:', dataToSend); // Debug
      await userService.register(dataToSend);
      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.message || error.error || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-2xl border border-slate-600">
        <div className="px-8 py-8 text-center border-b border-slate-600">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            👤
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Registrarse</h2>
          <p className="text-slate-400">Crea una nueva cuenta</p>
        </div>

        <div className="flex border-b border-slate-600">
          <Link 
            to="/login" 
            className="flex-1 py-4 px-6 text-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors border-r border-slate-600"
          >
            Iniciar Sesión
          </Link>
          <div className="flex-1 py-4 px-6 text-center bg-blue-600 text-white font-medium">
            Registrarse
          </div>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 text-red-300 px-4 py-3 rounded-md border border-red-800 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/50 text-green-300 px-4 py-3 rounded-md border border-green-800 text-sm">
                {success}
              </div>
            )}
            
            <div>
              <label htmlFor="user_name" className="block text-sm font-medium text-slate-200 mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-500 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-500 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-slate-200 mb-2">
                Rol
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-500 rounded-md bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <option value="">Selecciona un rol</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;