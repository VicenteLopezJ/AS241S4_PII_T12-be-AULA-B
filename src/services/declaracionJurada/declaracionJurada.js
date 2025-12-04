const API_URL = 'https://as241s4-pii-t20-be-f0j3.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('🔑 Token siendo enviado:', token); // DEBUG
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};


// ============================================
// DECLARACIONES API
// ============================================
export const declaracionesAPI = {
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/declaraciones?${params}`, {
        headers: getAuthHeaders() // ✅ AGREGAR ESTO
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener declaraciones: ' + error.message);
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/declaraciones/${id}`, {
        headers: getAuthHeaders() // ✅ AGREGAR ESTO
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener declaración: ' + error.message);
    }
  },

  // ⭐ NUEVO
  getByNumero: async (numero) => {
    try {
      const response = await fetch(`${API_URL}/declaraciones/numero/${numero}`, {
        headers: getAuthHeaders() // ✅ AGREGAR ESTO
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener declaración por número: ' + error.message);
    }
  },

  create: async (data) => {
    try {
      const response = await fetch(`${API_URL}/declaraciones`, {
        method: 'POST',
        headers: getAuthHeaders(), // ✅ AGREGAR ESTO
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al crear declaración: ' + error.message);
    }
  },

  getPendientes: async (centroId = null) => {
    try {
      const params = centroId ? `?centro=${centroId}` : '';
      const response = await fetch(`${API_URL}/declaraciones/pendientes${params}`, {
        headers: getAuthHeaders() // ✅ AGREGAR ESTO
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener pendientes: ' + error.message);
    }
  },

  anular: async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/declaraciones/${id}/anular`, {
        method: 'POST',
        headers: getAuthHeaders(), // ✅ AGREGAR ESTO,
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al anular: ' + error.message);
    }
  }
};

// ============================================
// CENTROS DE COSTOS API
// ============================================
// ============================================
// CENTROS DE COSTOS API
// ============================================
export const centrosCostosAPI = {
  getAll: async (tipo = null, estado = null) => {
    try {
      const params = new URLSearchParams();
      
      // Solo agregar si tienen valor
      if (tipo && tipo.trim()) {
        params.append('tipo', tipo);
      }
      if (estado && estado.trim()) {
        params.append('estado', estado);
      }
      
      const queryString = params.toString();
      const url = queryString 
        ? `${API_URL}/centros-costos?${queryString}`
        : `${API_URL}/centros-costos`;
      
      console.log('📡 URL solicitada:', url);
      console.log('📦 Parámetros:', { tipo, estado });
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log('✅ Respuesta del servidor:', data);
      return data;
    } catch (error) {
      throw new Error('Error al obtener centros: ' + error.message);
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/centros-costos/${id}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener centro: ' + error.message);
    }
  },

  getByCodigo: async (codigo) => {
    try {
      const response = await fetch(`${API_URL}/centros-costos/codigo/${codigo}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener centro por código: ' + error.message);
    }
  },

  create: async (data) => {
    try {
      const response = await fetch(`${API_URL}/centros-costos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al crear centro: ' + error.message);
    }
  },

  update: async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/centros-costos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al actualizar centro: ' + error.message);
    }
  },

  toggleEstado: async (id) => {
    try {
      const response = await fetch(`${API_URL}/centros-costos/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al cambiar estado: ' + error.message);
    }
  }
};
// ============================================
// PROYECTOS API
// ============================================
export const proyectosAPI = {
  getAll: async (estado = 'A') => {
    try {
      const response = await fetch(`${API_URL}/proyectos?estado=${estado}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener proyectos: ' + error.message);
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/proyectos/${id}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener proyecto: ' + error.message);
    }
  },

  create: async (data) => {
    try {
      const response = await fetch(`${API_URL}/proyectos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al crear proyecto: ' + error.message);
    }
  },

  update: async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/proyectos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al actualizar proyecto: ' + error.message);
    }
  },

  toggleEstado: async (id) => {
    try {
      const response = await fetch(`${API_URL}/proyectos/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al cambiar estado: ' + error.message);
    }
  }
};

// ============================================
// APROBACIONES API
// ============================================
export const aprobacionesAPI = {
  aprobar: async (data) => {
    try {
      const response = await fetch(`${API_URL}/aprobaciones/aprobar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al aprobar: ' + error.message);
    }
  },

  rechazar: async (data) => {
    try {
      const response = await fetch(`${API_URL}/aprobaciones/rechazar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al rechazar: ' + error.message);
    }
  },

  // ⭐ NUEVO
  info: async () => {
    try {
      const response = await fetch(`${API_URL}/aprobaciones/info`);
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener info: ' + error.message);
    }
  }
};

// ============================================
// REPORTES API
// ============================================
export const reportesAPI = {
  dashboard: async () => {
    try {
      const response = await fetch(`${API_URL}/reportes/dashboard`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener dashboard: ' + error.message);
    }
  },

  porTrabajador: async (dni) => {
    try {
      const response = await fetch(`${API_URL}/reportes/trabajador/${dni}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener reporte: ' + error.message);
    }
  }
};


const API_URLS = 'https://as241s4-pii-t20-be-f0j3.onrender.com/api/auth';

export const authAPI = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URLS}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_usuario: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw new Error('Error al iniciar sesión: ' + error.message);
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URLS}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      return await response.json();
    } catch (error) {
      throw new Error('Error al registrar: ' + error.message);
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('token');

      await fetch(`${API_URLS}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      // Limpiar sesión aunque falle la petición
      console.error('Error al cerrar sesión: ' + error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

