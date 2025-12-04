// src/services/empresaService.js
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

export const empresaService = {
  // Obtener empresas activas (por defecto)
  async getAllEmpresas() {
    try {
      const response = await fetch(`${API_URL}/empresas/activas`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener empresas activas');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getAllEmpresas:', error);
      throw error;
    }
  },

  // Obtener todas las empresas incluyendo inactivas
  async getAllEmpresasConInactivas() {
    try {
      const response = await fetch(`${API_URL}/empresas`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener empresas');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getAllEmpresasConInactivas:', error);
      throw error;
    }
  },

  // Obtener solo empresas inactivas (filtrando en cliente)
  async getEmpresasInactivas() {
    try {
      const todas = await this.getAllEmpresasConInactivas();
      return (todas || []).filter((e) => e.estado === 'I');
    } catch (error) {
      console.error('Error en getEmpresasInactivas:', error);
      throw error;
    }
  },

  // Obtener empresa por ID
  async getEmpresaById(id) {
    try {
      const response = await fetch(`${API_URL}/empresas/${id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener empresa');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getEmpresaById:', error);
      throw error;
    }
  },

  // Crear nueva empresa
  async createEmpresa(empresaData) {
    try {
      const response = await fetch(`${API_URL}/empresas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          nombre_empresa: empresaData.nombre_empresa,
          ruc: empresaData.ruc || null,
          direccion: empresaData.direccion || null,
          telefono: empresaData.telefono || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al crear empresa');
      }
      return data.data;
    } catch (error) {
      console.error('Error en createEmpresa:', error);
      throw error;
    }
  },

  // Actualizar empresa
  async updateEmpresa(id, empresaData) {
    try {
      const response = await fetch(`${API_URL}/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          nombre_empresa: empresaData.nombre_empresa,
          ruc: empresaData.ruc || null,
          direccion: empresaData.direccion || null,
          telefono: empresaData.telefono || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al actualizar empresa');
      }
      return data.data;
    } catch (error) {
      console.error('Error en updateEmpresa:', error);
      throw error;
    }
  },

  // Eliminar empresa (lógica: marca como inactiva)
  async deleteEmpresa(id) {
    try {
      const response = await fetch(`${API_URL}/empresas/${id}/delete`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al eliminar empresa');
      }
      return data.data;
    } catch (error) {
      console.error('Error en deleteEmpresa:', error);
      throw error;
    }
  },

  // Restaurar empresa (marca como activa)
  async restoreEmpresa(id) {
    try {
      const response = await fetch(`${API_URL}/empresas/${id}/restore`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al restaurar empresa');
      }
      return data.data;
    } catch (error) {
      console.error('Error en restoreEmpresa:', error);
      throw error;
    }
  },

  // Buscar empresas por nombre o RUC
  async searchEmpresas(query) {
    try {
      const response = await fetch(`${API_URL}/empresas/search?q=${encodeURIComponent(query)}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al buscar empresas');
      }
      return data.data;
    } catch (error) {
      console.error('Error en searchEmpresas:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async getStatistics() {
    try {
      const response = await fetch(`${API_URL}/empresas/statistics`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getStatistics:', error);
      throw error;
    }
  },

  // Health check del módulo de empresas
  async healthCheck() {
    try {
      const response = await fetch(`${API_URL}/empresas/health`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Módulo de empresas no disponible');
      }
      return data;
    } catch (error) {
      console.error('Error en healthCheck empresas:', error);
      throw error;
    }
  },
};