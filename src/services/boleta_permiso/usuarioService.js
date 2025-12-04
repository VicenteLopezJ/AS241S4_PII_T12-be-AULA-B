// src/services/usuarioService.js
// Servicio alineado con el backend de /empleados (modelo Usuario)
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

export const usuarioService = {
  // Listar usuarios (respeta permisos en backend)
  async getAllUsuarios() {
    const response = await fetch(`${API_URL}/empleados`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener usuarios');
    }
    return data.data;
  },

  // Obtener usuario por ID
  async getUsuarioById(id) {
    const response = await fetch(`${API_URL}/empleados/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener usuario');
    }
    return data.data;
  },

  // Crear usuario
  async createUsuario(payload) {
    const response = await fetch(`${API_URL}/empleados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al crear usuario');
    }
    return data.data;
  },

  // Actualizar usuario
  async updateUsuario(id, payload) {
    const response = await fetch(`${API_URL}/empleados/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al actualizar usuario');
    }
    return data.data;
  },

  // Eliminación lógica (A → I)
  async deleteUsuario(id) {
    const response = await fetch(`${API_URL}/empleados/${id}/delete`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al inactivar usuario');
    }
    return data.data;
  },

  // Restaurar usuario (I → A)
  async restoreUsuario(id) {
    const response = await fetch(`${API_URL}/empleados/${id}/restore`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al restaurar usuario');
    }
    return data.data;
  },

  // Buscar usuarios
  async searchUsuarios(query) {
    const response = await fetch(`${API_URL}/empleados/search?q=${encodeURIComponent(query)}`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al buscar usuarios');
    }
    return data.data;
  },

  // Usuarios por área
  async getUsuariosByArea(areaId) {
    const response = await fetch(`${API_URL}/empleados/area/${areaId}`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener usuarios por área');
    }
    return data.data;
  },

  // Usuarios por rol
  async getUsuariosByRol(rolId) {
    const response = await fetch(`${API_URL}/empleados/rol/${rolId}`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener usuarios por rol');
    }
    return data.data;
  },

  // Jefes de área
  async getJefesArea() {
    const response = await fetch(`${API_URL}/empleados/jefes`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener jefes de área');
    }
    return data.data;
  },

  // Estadísticas
  async getStatistics() {
    const response = await fetch(`${API_URL}/empleados/statistics`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener estadísticas de usuarios');
    }
    return data.data;
  },

  // Login
  async login(correo, password) {
    const response = await fetch(`${API_URL}/empleados/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Credenciales inválidas');
    }
    // Guardar token en localStorage para el resto de servicios
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data.data;
  },

  // Obtener permisos del usuario actual
  async getMyPermissions() {
    const response = await fetch(`${API_URL}/empleados/me/permisos`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Error al obtener permisos del usuario actual');
    }
    return data.data;
  },

  // Descargar reporte PDF de usuarios
  async downloadUsuariosReportePdf() {
    const response = await fetch(`${API_URL}/empleados/reporte-pdf`, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error al descargar reporte de usuarios:', text);
      throw new Error('No se pudo descargar el reporte de usuarios');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_usuarios.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Descargar reporte Excel (CSV) de usuarios - solo Admin
  async downloadUsuariosExcel() {
    const response = await fetch(`${API_URL}/empleados/reporte-excel`, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error al descargar usuarios_reporte.csv:', text);
      throw new Error('No se pudo descargar el reporte de usuarios');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_reporte.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
