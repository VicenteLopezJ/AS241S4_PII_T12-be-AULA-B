import { INTRANET_VVG_API as API } from '../../api';

export const userService = {
  // Autenticación
  login: async (credentials) => {
    try {
      console.log('userService.login - Enviando credenciales:', credentials);
      const response = await API.post('/login', credentials);
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
      const response = await API.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el registro' };
    }
  },

  // CRUD de usuarios
  getUsers: async (username = '') => {
    try {
      const url = username ? `/users?username=${username}` : '/users';
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  getAllUsers: async (username = '') => {
    try {
      const url = username ? `/users/all?username=${username}` : '/users/all';
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener todos los usuarios' };
    }
  },

  getInactiveUsers: async (username = '') => {
    try {
      const url = username ? `/users/inactive?username=${username}` : '/users/inactive';
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios inactivos' };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await API.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuario' };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await API.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear usuario' };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await API.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar usuario' };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await API.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar usuario' };
    }
  },

  reactivateUser: async (id) => {
    try {
      const response = await API.put(`/users/${id}/reactivar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al reactivar usuario' };
    }
  },

  getRoles: async () => {
    try {
      const response = await API.get('/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener roles' };
    }
  }
};
