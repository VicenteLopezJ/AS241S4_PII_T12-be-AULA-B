// src/services/aprobacionService.js
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

export const aprobacionService = {
  async aprobar({ id_solicitud, comentario_general }) {
    const response = await fetch(`${API_URL}/aprobaciones/aprobar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ id_solicitud, comentario_general }),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al aprobar solicitud');
    }
    return data.data;
  },

  async rechazar({ id_solicitud, comentario_general, observaciones = [] }) {
    const response = await fetch(`${API_URL}/aprobaciones/rechazar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ id_solicitud, comentario_general, observaciones }),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al rechazar solicitud');
    }
    return data.data;
  },

  async observar({ id_solicitud, jefe_id, comentario_general, observaciones }) {
    // Asegurar que siempre haya al menos una observación con descripción
    let obs = Array.isArray(observaciones) ? observaciones : [];
    if ((!obs || obs.length === 0) && comentario_general) {
      obs = [
        {
          id_documento_ref: null,
          tipo_observacion: 'OTRO',
          descripcion_observacion: comentario_general,
          es_critica: 'N',
        },
      ];
    }

    // Normalizar cada observación para que tenga siempre los campos esperados
    obs = (obs || []).map((o) => ({
      id_documento_ref: o.id_documento_ref ?? null,
      tipo_observacion: o.tipo_observacion || 'OTRO',
      descripcion_observacion: o.descripcion_observacion || '',
      es_critica: o.es_critica || 'N',
    }));

    // Si no se pasó jefe_id explícito, intentar obtenerlo de localStorage
    let jefeIdFinal = jefe_id;
    if (!jefeIdFinal && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
          const info = JSON.parse(raw);
          jefeIdFinal = info.user_id || info.usuario_id || info.usuario?.id_usuario || null;
        }
      } catch {
        jefeIdFinal = jefe_id || null;
      }
    }

    const payload = {
      id_solicitud,
      jefe_id: jefeIdFinal,
      comentario_general: comentario_general || null,
      observaciones: obs,
    };

    const response = await fetch(`${API_URL}/aprobaciones/observar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al observar solicitud');
    }
    return data.data;
  },

  async getMisAprobaciones(jefe_id) {
    const params = new URLSearchParams();
    if (jefe_id) {
      params.append('jefe_id', jefe_id);
    }

    const url = `${API_URL}/autorizaciones/aprobaciones-jefe${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener aprobaciones del jefe');
    }
    return data.data;
  },

  async getAprobacionById(id_aprobacion) {
    const response = await fetch(`${API_URL}/aprobaciones/${id_aprobacion}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener detalle de aprobación');
    }
    return data.data;
  },

  async getObservaciones(id_aprobacion) {
    const response = await fetch(`${API_URL}/aprobaciones/${id_aprobacion}/observaciones`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener observaciones');
    }
    return data.data;
  },

  async crearObservacion(id_aprobacion, observacion) {
    const payload = {
      id_documento_ref: observacion.id_documento_ref ?? null,
      tipo_observacion: observacion.tipo_observacion || 'OTRO',
      descripcion_observacion: observacion.descripcion_observacion || '',
      es_critica: observacion.es_critica || 'N',
    };

    const response = await fetch(`${API_URL}/aprobaciones/${id_aprobacion}/observaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al registrar observación');
    }
    return data.data;
  },

  async getAprobacionPorSolicitud(id_solicitud) {
    const response = await fetch(`${API_URL}/aprobaciones/por-solicitud/${id_solicitud}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener aprobación por solicitud');
    }
    return data.data;
  },

  async downloadPdf(id_aprobacion) {
    const response = await fetch(
      `${API_URL}/autorizaciones/aprobaciones-jefe/${id_aprobacion}/pdf`,
      {
        headers: {
          ...getAuthHeaders(),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al descargar PDF de aprobación');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aprobacion_${id_aprobacion}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
