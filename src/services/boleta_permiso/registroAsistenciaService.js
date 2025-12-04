// src/services/registroAsistenciaService.js
// Servicio alineado con el backend de /registros (Registro de Asistencia)

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

export const registroAsistenciaService = {
  // ==========================================
  // REGISTROS (CABECERA)
  // ==========================================

  async getAllRegistros({ periodo_mes, periodo_anio, estado_registro } = {}) {
    const params = new URLSearchParams();
    if (periodo_mes) params.append('periodo_mes', periodo_mes);
    if (periodo_anio) params.append('periodo_anio', periodo_anio);
    if (estado_registro) params.append('estado_registro', estado_registro);

    const url = `${API_URL}/registros${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener registros');
    }
    return data.data;
  },

  async getRegistroById(id) {
    const response = await fetch(`${API_URL}/registros/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener registro');
    }
    return data.data;
  },

  async getRegistroBySolicitud(solicitudId) {
    const response = await fetch(`${API_URL}/registros/por-solicitud/${solicitudId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener registro por solicitud');
    }
    return data.data;
  },

  // Registrar permiso aprobado (POST /registros/registrar)
  async registrarPermiso(payload) {
    const response = await fetch(`${API_URL}/registros/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al registrar permiso en asistencia');
    }
    return data.data;
  },

  async procesarRegistro(registroId) {
    const response = await fetch(`${API_URL}/registros/${registroId}/procesar`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al procesar registro');
    }
    return data.data;
  },

  async anularRegistro(registroId, motivo_anulacion) {
    const response = await fetch(`${API_URL}/registros/${registroId}/anular`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ motivo_anulacion }),
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al anular registro');
    }
    return data.data;
  },

  async downloadRegistroPdf(registroId) {
    const url = `${API_URL}/registros/${registroId}/pdf`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al descargar PDF del registro');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `registro_asistencia_${registroId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // ==========================================
  // DETALLES DE REGISTRO
  // ==========================================

  async getDetalles(registroId) {
    const response = await fetch(`${API_URL}/registros/${registroId}/detalles`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener detalles del registro');
    }
    return data.data;
  },

  async addDetalle(registroId, detallePayload) {
    const response = await fetch(`${API_URL}/registros/${registroId}/detalles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(detallePayload),
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al agregar detalle');
    }
    return data.data;
  },

  // ==========================================
  // CONSULTAS ESPECIALES
  // ==========================================

  async getPendientesRegistro() {
    const response = await fetch(`${API_URL}/registros/pendientes-registro`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener pendientes de registro');
    }
    return data.data;
  },

  async getPendientesProcesar() {
    const response = await fetch(`${API_URL}/registros/pendientes-procesar`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener pendientes de procesar');
    }
    return data.data;
  },

  async getRegistrosPorPeriodo(mes, anio) {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);

    const response = await fetch(`${API_URL}/registros/por-periodo?${params.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener registros por periodo');
    }
    return data.data;
  },

  async getRegistrosPorUsuario(usuarioId, { mes, anio } = {}) {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);

    const url = `${API_URL}/registros/por-usuario/${usuarioId}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener registros por usuario');
    }
    return data.data;
  },

  async calcularDescuentosUsuario(usuarioId, { mes, anio } = {}) {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);

    const url = `${API_URL}/registros/calcular-descuentos/${usuarioId}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al calcular descuentos');
    }
    return data.data;
  },

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================

  async getReportePlanillaJson({ mes, anio, area_id } = {}) {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);
    if (area_id) params.append('area_id', area_id);
    params.append('formato', 'json');

    const response = await fetch(`${API_URL}/registros/reporte-planilla?${params.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener reporte de planilla');
    }
    return data.data;
  },

  async downloadReportePlanillaExcel({ mes, anio, area_id } = {}) {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);
    if (area_id) params.append('area_id', area_id);
    params.append('formato', 'excel');

    const url = `${API_URL}/registros/reporte-planilla?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al generar reporte de planilla');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `reporte_planilla_${timestamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  async getStatistics({ mes, anio, area_id } = {}) {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);
    if (area_id) params.append('area_id', area_id);

    const response = await fetch(`${API_URL}/registros/statistics${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener estadísticas de registros');
    }
    return data.data;
  },
};

// placeholder, will be filled in next step
