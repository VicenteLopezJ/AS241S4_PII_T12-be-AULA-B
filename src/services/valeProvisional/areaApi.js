// areaApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

export const AreaService = {
  // Obtener todas las áreas
  getAll: () => api.get('/area'),
  
  // Obtener área por ID
  getById: (id) => api.get(`/area/${id}`),
  
  // Obtener áreas por estado
  getByStatus: (status) => api.get(`/area/status/${status}`),
  
  // Crear nueva área
  create: (data) => api.post('/area/save', data),
  
  // Actualizar área
  update: (data) => api.put('/area/update', data),
  
  // Eliminar (lógico)
  delete: (id) => api.patch(`/area/delete/${id}`),
  
  // Restaurar
  restore: (id) => api.patch(`/area/restore/${id}`),
};

// Alias para mantener compatibilidad
export const areaService = AreaService;

export default api;