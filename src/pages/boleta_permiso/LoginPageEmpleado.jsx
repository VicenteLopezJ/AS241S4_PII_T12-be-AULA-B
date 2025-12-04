// src/pages/boleta_permiso/LoginPageEmpleado.jsx
// Login del módulo Boleta Permiso SIN autologin, pensado para empleados.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/boleta_permiso/usuarioService';

const LoginPageEmpleado = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Login -> guarda token en localStorage (usuarioService)
      const loginData = await usuarioService.login(correo, password);

      // Obtener info/permisos del usuario actual
      let me = null;
      try {
        me = await usuarioService.getMyPermissions();
      } catch (permError) {
        console.error('Error al obtener permisos del usuario (empleado):', permError);
      }

      if (me) {
        const userInfo = {
          ...loginData,
          ...me,
        };

        try {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } catch (e) {
          console.warn('No se pudo guardar userInfo en localStorage');
        }
      }

      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('rrhhEntry', 'empleado');
        }
      } catch (e) {
        console.warn('No se pudo guardar rrhhEntry en sessionStorage (empleado):', e);
      }

      // Ir al dashboard RRHH (el dashboard muestra según rol)
      navigate('/rrhh/dashboard', { replace: true });
    } catch (err) {
      console.error('Error en login RRHH empleado:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <div className="p-4">
        <button
          type="button"
          onClick={() => navigate('/empleado')}
          className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <span className="text-base rotate-180">↩</span>
          <span>Volver</span>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
        <p className="text-gray-400 text-sm mb-6">
          Sistema de Gestión de Permisos y Autorizaciones (Empleado)
        </p>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded font-medium mt-2"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default LoginPageEmpleado;
