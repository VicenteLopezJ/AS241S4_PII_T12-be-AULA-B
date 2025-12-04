import API from './api';
import { autoLoginToKardex } from '../utils/autoLoginKardex';

export const authService = {
  // 🔹 Login automático con autoLoginKardex
  login: async (user_name, password) => {
    console.log('🔐 [authService] Iniciando auto-login para Kardex...');
    
    // Usar autoLoginKardex
    const success = await autoLoginToKardex();
    
    if (!success) {
      throw new Error("Error en auto-login del módulo Kardex");
    }
    
    return {
      user_id: 999,
      rol: "admin",
      user_name: "kardex_admin",
      mensaje: "Auto-login exitoso"
    };
  },

  // 🔹 Verificar autenticación usando localStorage específico de Kardex
  isAuthenticated: () => {
    const token = localStorage.getItem('kardex_token');
    const user = localStorage.getItem('kardex_user') || localStorage.getItem('kardex_usuario');
    return !!token && !!user;
  },

  // 🔹 Obtener usuario actual de Kardex
  getCurrentUser: () => {
    const userStr = localStorage.getItem('kardex_user') || localStorage.getItem('kardex_usuario');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return {
          user_id: 999,
          rol: "admin",
          user_name: "kardex_admin"
        };
      }
    }
    return {
      user_id: 999,
      rol: "admin",
      user_name: "kardex_admin"
    };
  },

  // 🔹 Cerrar sesión solo de Kardex
  logout: () => {
    localStorage.removeItem('kardex_token');
    localStorage.removeItem('kardex_user');
    localStorage.removeItem('kardex_usuario');
    console.log('🚪 [authService] Sesión de Kardex cerrada');
  }
};

export const login = authService.login;
export const isAuthenticated = authService.isAuthenticated;
export { authService as default };