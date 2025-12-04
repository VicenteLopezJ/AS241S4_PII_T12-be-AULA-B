// src/services/boletaPermisoService.js
import API_URL from './config';

export const boletaPermisoService = {
  // Obtener todas las boletas
  async getAllBoletas() {
    try {
      const response = await fetch(`${API_URL}/boletas/`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al obtener boletas');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener boleta por ID
  async getBoletaById(id) {
    try {
      const response = await fetch(`${API_URL}/boletas/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al obtener boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener boletas por estado
  async getBoletasByEstado(estado) {
    try {
      const response = await fetch(`${API_URL}/boletas/estado/${estado}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al obtener boletas');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Crear boleta
  async createBoleta(boletaData) {
    try {
      const response = await fetch(`${API_URL}/boletas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boletaData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al crear boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar boleta
  async updateBoleta(id, boletaData) {
    try {
      const response = await fetch(`${API_URL}/boletas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boletaData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al actualizar boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Eliminar boleta (lógico)
  async deleteBoleta(id) {
    try {
      const response = await fetch(`${API_URL}/boletas/${id}/delete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al eliminar boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Cancelar boleta
  async cancelarBoleta(id, motivo) {
    try {
      const response = await fetch(`${API_URL}/boletas/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observaciones: motivo || 'Cancelado por el usuario'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al cancelar boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Aprobar boleta (jefe)
  async aprobarJefe(id, jefeAreaId, comentario) {
    try {
      const response = await fetch(`${API_URL}/boletas/${id}/aprobar-jefe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jefe_area_id: jefeAreaId,
          comentario_jefe: comentario || ''
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al aprobar boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Rechazar boleta (jefe)
  async rechazarJefe(id, jefeAreaId, comentario) {
    try {
      const response = await fetch(`${API_URL}/boletas/${id}/rechazar-jefe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jefe_area_id: jefeAreaId,
          comentario_jefe: comentario || ''
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Error al rechazar boleta');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Generar PDF de la boleta
  async generarPDF(id) {
    try {
      console.log(`📄 Generando PDF para boleta ${id}`);
      
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/boletas/${id}/pdf`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado para generar el PDF');
      }

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      // Obtener el blob del PDF
      const blob = await response.blob();
      
      // Crear URL temporal
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boleta_permiso_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF generado y descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      throw error;
    }
  }
};