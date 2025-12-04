// applicantApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

export const applicantService = {
  // Obtener todos los applicants activos
  getAll: () => api.get('/applicant'),
  
  // Obtener applicant por ID
  getById: (id) => api.get(`/applicant/${id}`),
  
  // Obtener applicants por estado
  getByStatus: (status) => api.get(`/applicant/status/${status}`),
  
  // Crear nuevo applicant
  create: (data) => api.post('/applicant/save', data),
  
  // Actualizar applicant
  update: (data) => api.put('/applicant/update', data),
  
  // Eliminar (lógico)
  delete: (id) => api.patch(`/applicant/delete/${id}`),
  
  // Restaurar
  restore: (id) => api.patch(`/applicant/restore/${id}`),
};

// ❌ Se elimina el areaService duplicado. Debe estar solo en areaApi.js

export default api;