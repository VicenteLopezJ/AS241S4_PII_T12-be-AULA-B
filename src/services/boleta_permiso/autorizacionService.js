// src/services/autorizacionService.js
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

export const autorizacionService = {
  // ==========================================
  // CONSULTAS GENERALES
  // ==========================================

  // MODIFICADO: Obtener todas las autorizaciones (con filtro opcional por jefe)
  getAllAutorizaciones: async (jefeId = null) => {
    try {
      const url = jefeId 
        ? `${API_URL}/autorizaciones/?jefe_id=${jefeId}`
        : `${API_URL}/autorizaciones/`;
        
      const response = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener autorizaciones');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getAllAutorizaciones:', error);
      throw error;
    }
  },

  // Obtener autorización por ID
  getAutorizacionById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/${id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener autorización');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getAutorizacionById:', error);
      throw error;
    }
  },

  // Obtener autorización por ID de boleta
  getAutorizacionByBoleta: async (boletaId) => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/por-boleta/${boletaId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener autorización por boleta');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getAutorizacionByBoleta:', error);
      throw error;
    }
  },

  // ==========================================
  // NUEVA FUNCIÓN: Verificar si es jefe
  // ==========================================

  verificarJefe: async (empleadoId) => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/verificar-jefe/${empleadoId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar jefe');
      }
      
      return data.data; // Retorna: { es_jefe, id_empleado, nombre_completo, cargo, areas, cantidad_areas }
    } catch (error) {
      console.error('Error en verificarJefe:', error);
      throw error;
    }
  },

  // ==========================================
  // CONSULTAS ESPECIALES
  // ==========================================

  // Obtener boletas pendientes de aprobación del jefe
  getPendientesJefe: async (jefeId = null) => {
    try {
      const url = jefeId 
        ? `${API_URL}/autorizaciones/pendientes-jefe/${jefeId}`
        : `${API_URL}/autorizaciones/pendientes-jefe`;
        
      const response = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pendientes de jefe');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getPendientesJefe:', error);
      throw error;
    }
  },

  // Obtener boletas pendientes de registro en asistencia
  getPendientesRegistro: async () => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/pendientes-registro`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pendientes de registro');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getPendientesRegistro:', error);
      throw error;
    }
  },

  // ==========================================
  // ACCIONES DE APROBACIÓN
  // ==========================================

  // Aprobar boleta
  aprobarBoleta: async (solicitudId, comentario = '') => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/aprobar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id_solicitud: solicitudId,
          comentario_general: comentario || 'Aprobado, documentos correctos'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al aprobar boleta');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en aprobarBoleta:', error);
      throw error;
    }
  },

  // Rechazar boleta
  rechazarBoleta: async (solicitudId, comentario, observaciones = []) => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id_solicitud: solicitudId,
          comentario_general: comentario,
          observaciones: observaciones,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al rechazar boleta');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en rechazarBoleta:', error);
      throw error;
    }
  },

  // Observar boleta (devolver para corrección)
  observarBoleta: async (solicitudId, observaciones = []) => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/observar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id_solicitud: solicitudId,
          observaciones: observaciones,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al observar boleta');
      }

      return data.data;
    } catch (error) {
      console.error('Error en observarBoleta:', error);
      throw error;
    }
  },

  // ==========================================
  // ACCIONES DE REGISTRO
  // ==========================================

  // Registrar en sistema de asistencia
  registrarEnAsistencia: async (autorizacionId, adminData) => {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/${autorizacionId}/registrar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          admin_id: adminData.admin_id,
          comentario_admin: adminData.comentario_admin || 'Registrado en sistema de asistencia'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar en asistencia');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en registrarEnAsistencia:', error);
      throw error;
    }
  },

  // ==========================================
  // FUNCIÓN: DESCARGAR REPORTE EXCEL
  // ==========================================

  descargarReporteExcel: async (filtros = {}) => {
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.jefe_id) params.append('jefe_id', filtros.jefe_id);

      const url = `${API_URL}/autorizaciones/reporte-excel${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log(' Descargando reporte Excel desde:', url);
      
      const response = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al generar reporte');
      }
      
      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear un enlace temporal para descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      link.download = `reporte_autorizaciones_${timestamp}.xlsx`;
      
      // Simular click para descargar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('✅ Reporte Excel descargado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al descargar reporte Excel:', error);
      throw error;
    }
  },

  // ==========================================
  // UTILIDADES
  // ==========================================

  async getStatistics() {
    try {
      const response = await fetch(`${API_URL}/autorizaciones/statistics`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener estadísticas de autorizaciones');
      }
      return data.data;
    } catch (error) {
      console.error('Error en getStatistics (autorizaciones):', error);
      throw error;
    }
  },

  // Obtener color del badge según estado
  getEstadoColor: (estado) => {
    const colores = {
      'Pendiente Jefe': 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
      'Pendiente Registro': 'bg-blue-900/30 text-blue-400 border-blue-600',
      'Registrado': 'bg-green-900/30 text-green-400 border-green-600',
      'Rechazado': 'bg-red-900/30 text-red-400 border-red-600',
    };
    return colores[estado] || 'bg-gray-900/30 text-gray-400 border-gray-600';
  },

  // Obtener color del badge según tipo de motivo
  getTipoMotivoColor: (tipoMotivo) => {
    const colores = {
      'Salud': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Personal': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Familiar': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Trabajo': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Otro': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colores[tipoMotivo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  },

  // Formatear fecha para visualización
  formatearFecha: (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },

  // Formatear hora
  formatearHora: (hora) => {
    if (!hora) return 'Sin hora';
    return new Date(hora).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  // Convertir estado de código a filtro
  getEstadoFiltro: (estado) => {
    const mapeo = {
      'Pendiente Jefe': 'N',
      'Pendiente Registro': 'S', 
      'Registrado': 'S',
      'Rechazado': 'R'
    };
    return mapeo[estado] || null;
  },
};