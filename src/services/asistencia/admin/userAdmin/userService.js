import { INASISTENCIAS_API as API } from '../../../api.js';
import { INASISTENCIAS_API } from "../../../api.js";

const API_PREFIX = '/api/v1';

export const userService = {
  login: async (credentials) => {
    try {
      console.log('userService.login - Enviando credenciales:', credentials);
      const response = await INASISTENCIAS_API.post(`${API_PREFIX}/users/login`, credentials);
      console.log('userService.login - Respuesta completa:', response);
      console.log('userService.login - Datos de respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en userService.login:', error);
      if (error.code === 'ERR_NETWORK') {
        throw {
          message: 'No se puede conectar al servidor. Verifica que el backend Flask esté ejecutándose.',
          code: 'ERR_NETWORK'
        };
      }
      throw error.response?.data || { message: 'Error en el login' };
    }
  },

  register: async (userData) => {
    try {
      const response = await INASISTENCIAS_API.post(`${API_PREFIX}/users/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el registro' };
    }
  },

  // CRUD de usuarios (Implementación mejorada con filtros y ADAPTADOR)
  getUsers: async (role = '', status = '') => {
    try {
      const params = new URLSearchParams();
      if (role && role !== 'Todos') params.append('role', role.toLowerCase());
      if (status && status !== 'Todos') params.append('status', status.toLowerCase());

      const url = `${API_PREFIX}/users?${params.toString()}`;
      const response = await INASISTENCIAS_API.get(url);

      // ADAPTADOR CRÍTICO: Mapear la respuesta del backend
      const users = response.data.map(user => ({
        id: user.userId,
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
        ...user,
      }));

      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  // Funciones de Estadísticas y Control de Estado (Implementadas previamente)

  getUserStats: async () => {
    try {
      const response = await INASISTENCIAS_API.get(`${API_PREFIX}/users/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      return { totalUsers: 0, byStatus: {}, byRole: {} };
    }
  },

  deactivateUser: async (id) => {
    try {
      // Usa PATCH /users/<id>/delete (eliminación lógica)
      const response = await INASISTENCIAS_API.patch(`${API_PREFIX}/users/${id}/delete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al desactivar usuario' };
    }
  },

  restoreUser: async (id) => {
    try {
      // Usa PATCH /users/<id>/restore (reactivación)
      const response = await INASISTENCIAS_API.patch(`${API_PREFIX}/users/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al reactivar usuario' };
    }
  },

  // --- Manteniendo las funciones de CRUD restantes ---

  getUserById: async (id) => {
    try {
      const response = await INASISTENCIAS_API.get(`${API_PREFIX}/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuario' };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await INASISTENCIAS_API.post(`${API_PREFIX}/users`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear usuario' };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await INASISTENCIAS_API.put(`${API_PREFIX}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar usuario' };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await INASISTENCIAS_API.delete(`${API_PREFIX}/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar usuario' };
    }
  },

  getRoles: async () => {
    try {
      const response = await INASISTENCIAS_API.get(`${API_PREFIX}/roles`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener roles' };
    }
  },

  deletePermanent: async (id) => {
    try {
      const response = await INASISTENCIAS_API.delete(`${API_PREFIX}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario físicamente:', error);
      throw error.response?.data || { message: 'Error al eliminar usuario' };
    }
  },
};