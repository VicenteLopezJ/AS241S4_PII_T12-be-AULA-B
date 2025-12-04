// trackingApi.js
// src/services/valeProvisional/trackingApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

export const TrackingService = {
  // Obtener todos los trackings
  getAll: () => api.get('/tracking'),
  
  // Obtener tracking por ID
  getById: (trackingId) => api.get(`/tracking/${trackingId}`),
  
  // Obtener tracking por voucher ID
  getByVoucherId: (voucherId) => api.get(`/tracking/voucher/${voucherId}`),
  
  // Crear nuevo tracking
  create: (trackingData) => api.post('/tracking/save', trackingData),
  
  // Actualizar tracking
  update: (trackingData) => api.put('/tracking/update', trackingData),
  
  // Eliminar tracking (lógico)
  delete: (trackingId) => api.patch(`/tracking/delete/${trackingId}`),
  
  // Restaurar tracking
  restore: (trackingId) => api.patch(`/tracking/${trackingId}/restore`),
};

export default api;