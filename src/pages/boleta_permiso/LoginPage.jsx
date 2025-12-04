// src/pages/boleta_permiso/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/boleta_permiso/usuarioService';
import { autoLoginToBoletaPermiso } from '../../utils/autoLoginBoletaPermiso';

const LoginPage = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Autologin al entrar a /rrhh/login usando las credenciales de RRHH
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const ok = await autoLoginToBoletaPermiso();
        if (!mounted) return;
        if (ok) {
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('rrhhEntry', 'dashboard');
            }
          } catch (e) {
            console.warn('No se pudo guardar rrhhEntry en sessionStorage:', e);
          }
          navigate('/rrhh/dashboard', { replace: true });
        }
      } catch (e) {
        if (!mounted) return;
        console.error('Error en autologin RRHH:', e);
        setError('No se pudo iniciar sesión automática. Ingresa tus credenciales manualmente.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => { mounted = false; };
  }, [navigate]);

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
        console.error('Error al obtener permisos del usuario:', permError);
      }

      if (me) {
        // Combinar datos de login y permisos para tener toda la info del usuario
        const userInfo = {
          // Datos base del login (suelen traer nombres, apellidos, cargo, rol, etc.)
          ...loginData,
          // Datos de permisos/me (user_id, rol_id, area_id, permisos, etc.)
          ...me,
        };

        // Guardar info de usuario en localStorage para Sidebar y Dashboard
        try {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } catch (e) {
          console.warn('No se pudo guardar userInfo en localStorage');
        }

        // Redirección: todos los roles van al dashboard de RRHH,
        // que ya muestra la vista específica según rol
        navigate('/rrhh/dashboard', { replace: true });
      } else {
        // Si no tenemos info de permisos, al menos ir al dashboard de RRHH
        navigate('/rrhh/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
        <p className="text-gray-400 text-sm mb-6">
          Sistema de Gestión de Permisos y Autorizaciones
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
  );
};

export default LoginPage;
