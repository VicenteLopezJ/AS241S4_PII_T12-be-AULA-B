// src/services/rolService.js
import API_URL from './config';

const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

export const rolService = {
  async getAllRoles() {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener roles');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getAllRoles:', error);
      throw error;
    }
  },

  async getActiveRoles() {
    try {
      const response = await fetch(`${API_URL}/roles/activos`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener roles activos');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getActiveRoles:', error);
      throw error;
    }
  },

  async getRoleById(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener rol');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getRoleById:', error);
      throw error;
    }
  },

  async createRole(payload) {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al crear rol');
      }
      return data.data;
    } catch (error) {
      console.error('Error en createRole:', error);
      throw error;
    }
  },

  async updateRole(id, payload) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al actualizar rol');
      }
      return data.data;
    } catch (error) {
      console.error('Error en updateRole:', error);
      throw error;
    }
  },

  async getRolePermissions(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}/permisos`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener permisos del rol');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getRolePermissions:', error);
      throw error;
    }
  },

  async getStatistics() {
    try {
      const response = await fetch(`${API_URL}/roles/statistics`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener estadísticas de roles');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getStatistics (roles):', error);
      throw error;
    }
  },

  async healthCheck() {
    try {
      const response = await fetch(`${API_URL}/roles/health`);
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Módulo de roles no disponible');
      }
      return data;
    } catch (error) {
      console.error('Error en healthCheck roles:', error);
      throw error;
    }
  },
};
