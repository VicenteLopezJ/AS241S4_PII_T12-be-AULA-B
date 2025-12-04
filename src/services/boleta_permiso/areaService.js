// src/services/areaService.js
import API_URL from './config';

// Usar el mismo estilo de auth que empresaService: solo header Authorization
const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

export const areaService = {
  // Obtener todas las áreas
  getAllAreas: async () => {
    try {
      const response = await fetch(`${API_URL}/areas`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener áreas');
      }

      return data.data;
    } catch (error) {
      console.error('Error en getAllAreas:', error);
      throw error;
    }
  },

  // Obtener área por ID
  getAreaById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/areas/${id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener área');
      }

      return data.data;
    } catch (error) {
      console.error('Error en getAreaById:', error);
      throw error;
    }
  },

  // Crear nueva área
  createArea: async (areaData) => {
    try {
      const response = await fetch(`${API_URL}/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(areaData),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al crear área');
      }

      return data.data;
    } catch (error) {
      console.error('Error en createArea:', error);
      throw error;
    }
  },

  // Actualizar área
  updateArea: async (id, areaData) => {
    try {
      const response = await fetch(`${API_URL}/areas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(areaData),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al actualizar área');
      }

      return data.data;
    } catch (error) {
      console.error('Error en updateArea:', error);
      throw error;
    }
  },

  // Inactivar área (A → I)
  deleteArea: async (id) => {
    try {
      const response = await fetch(`${API_URL}/areas/${id}/delete`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al inactivar área');
      }

      return data.data;
    } catch (error) {
      console.error('Error en deleteArea:', error);
      throw error;
    }
  },

  // Descargar reporte Excel/CSV de áreas
  downloadReporteExcel: async () => {
    try {
      const response = await fetch(`${API_URL}/areas/reporte-excel`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error al descargar reporte de áreas:', text);
        throw new Error('No se pudo descargar el reporte de áreas');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'areas_reporte.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error en downloadReporteExcel:', error);
      throw error;
    }
  },

  // Activar área (I → A)
  restoreArea: async (id) => {
    try {
      const response = await fetch(`${API_URL}/areas/${id}/restore`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al activar área');
      }

      return data.data;
    } catch (error) {
      console.error('Error en restoreArea:', error);
      throw error;
    }
  },

  // Eliminar físicamente
  deleteAreaPermanent: async (id) => {
    try {
      const response = await fetch(`${API_URL}/areas/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al eliminar área permanentemente');
      }

      return data.data;
    } catch (error) {
      console.error('Error en deleteAreaPermanent:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getStatistics: async () => {
    try {
      const response = await fetch(`${API_URL}/areas/statistics`, {
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

  // Buscar áreas
  searchAreas: async (query) => {
    try {
      const response = await fetch(`${API_URL}/areas/search?q=${encodeURIComponent(query)}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al buscar áreas');
      }

      return data.data;
    } catch (error) {
      console.error('Error en searchAreas:', error);
      throw error;
    }
  },

  // Listar áreas por estado (A/I)
  getAreasByStatus: async (status) => {
    try {
      const response = await fetch(`${API_URL}/areas/status/${status}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener áreas por estado');
      }

      return data.data;
    } catch (error) {
      console.error('Error en getAreasByStatus:', error);
      throw error;
    }
  },

  // Obtener empleados de un área específica
  getAreaEmployees: async (areaId) => {
    try {
      const response = await fetch(`${API_URL}/areas/${areaId}/empleados`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener empleados del área');
      }

      // Soporta tanto data.data (array directo) como data.data.empleados
      const payload = data?.data;
      if (Array.isArray(payload)) {
        return payload;
      }

      if (payload && Array.isArray(payload.empleados)) {
        return payload.empleados;
      }

      console.warn('getAreaEmployees: formato de respuesta inesperado', data);
      return [];
    } catch (error) {
      console.error('Error en getAreaEmployees:', error);
      throw error;
    }
  },

  // Health check del módulo de áreas
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_URL}/areas/health`);

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Módulo de áreas no disponible');
      }

      return data;
    } catch (error) {
      console.error('Error en healthCheck:', error);
      throw error;
    }
  },
};