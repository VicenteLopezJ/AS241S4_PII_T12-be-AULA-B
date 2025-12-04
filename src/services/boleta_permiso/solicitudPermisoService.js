// src/services/solicitudPermisoService.js
// Servicio alineado con el backend de /solicitudes (Solicitudes de Permiso)

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

export const solicitudPermisoService = {
  // ==========================================
  // CRUD BÁSICO DE SOLICITUDES (CABECERA)
  // ==========================================

  // Listar solicitudes con filtros opcionales
  async getAllSolicitudes({ usuario_id, estado, fecha_desde, fecha_hasta } = {}) {
    const params = new URLSearchParams();
    if (usuario_id) params.append('usuario_id', usuario_id);
    if (estado) params.append('estado', estado);
    if (fecha_desde) params.append('fecha_desde', fecha_desde);
    if (fecha_hasta) params.append('fecha_hasta', fecha_hasta);

    const url = `${API_URL}/boletas/${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener solicitudes');
    }
    return data.data;
  },

  // Obtener solicitud por ID
  async getSolicitudById(id) {
    const response = await fetch(`${API_URL}/boletas/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener solicitud');
    }
    return data.data;
  },

  // Crear nueva solicitud (para el usuario actual)
  async createSolicitud(payload) {
    const response = await fetch(`${API_URL}/boletas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al crear solicitud');
    }
    return data.data;
  },

  // Actualizar solicitud (solo si está pendiente)
  async updateSolicitud(id, payload) {
    const response = await fetch(`${API_URL}/boletas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al actualizar solicitud');
    }
    return data.data;
  },

  // Cancelar solicitud
  async cancelarSolicitud(id) {
    const response = await fetch(`${API_URL}/boletas/${id}/cancelar`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al cancelar solicitud');
    }
    return data.data;
  },

  // ==========================================
  // DOCUMENTOS DE SOLICITUD
  // ==========================================

  // Obtener documentos de una solicitud
  async getDocumentosSolicitud(solicitudId) {
    const response = await fetch(`${API_URL}/boletas/${solicitudId}/documentos`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener documentos de la solicitud');
    }
    return data.data;
  },

  // Subir documento (form-data)
  async uploadDocumento(solicitudId, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progreso
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.message || `Error ${xhr.status}`));
          }
        } catch (err) {
          reject(new Error('Error al procesar la respuesta del servidor'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir documento'));
      });

      xhr.open('POST', `${API_URL}/boletas/${solicitudId}/documentos`);
      const headers = getAuthHeaders();
      if (headers.Authorization) {
        xhr.setRequestHeader('Authorization', headers.Authorization);
      }
      xhr.send(formData);
    });
  },

  // Eliminar documento
  async deleteDocumento(solicitudId, documentoId) {
    const response = await fetch(`${API_URL}/boletas/${solicitudId}/documentos/${documentoId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al eliminar documento');
    }
    return true;
  },

  // Descargar documento por ID
  async downloadDocumento(documentoId) {
    const response = await fetch(`${API_URL}/boletas/documentos/${documentoId}/download`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al descargar documento');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documento_${documentoId}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // ==========================================
  // CONSULTAS ESPECIALES
  // ==========================================

  async getPendientesDocumentos() {
    const response = await fetch(`${API_URL}/boletas/pendientes-documentos`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener pendientes de documentos');
    }
    return data.data;
  },

  async getPendientesRevision(areaId = null) {
    const params = new URLSearchParams();
    if (areaId) params.append('area_id', areaId);

    const response = await fetch(`${API_URL}/boletas/pendientes-revision${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener pendientes de revisión');
    }
    return data.data;
  },

  async getMisSolicitudes(usuarioId) {
    // Endpoint específico del backend: /boletas/mis-solicitudes/{usuarioId}
    const response = await fetch(`${API_URL}/boletas/mis-solicitudes/${usuarioId}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener mis solicitudes');
    }
    return data.data;
  },

  async getSolicitudesByArea(areaId) {
    const response = await fetch(`${API_URL}/boletas/por-area/${areaId}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener solicitudes por área');
    }
    return data.data;
  },

  async getStatistics({ usuario_id, area_id, mes, anio } = {}) {
    const params = new URLSearchParams();
    if (usuario_id) params.append('usuario_id', usuario_id);
    if (area_id) params.append('area_id', area_id);
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);

    const response = await fetch(`${API_URL}/boletas/statistics${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener estadísticas de solicitudes');
    }
    return data.data;
  },
};

// placeholder, will be filled in next step
