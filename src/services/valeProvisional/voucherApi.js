// voucherApi.js
// services/valeProvisional/voucherApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

// Interceptor para debug de requests (Específico de este archivo - MANTENIDO)
api.interceptors.request.use(
  (config) => {
    console.log('🚀 REQUEST:', config.method?.toUpperCase(), config.url);
    // Usamos api.defaults.baseURL para obtener la URL base
    console.log('🔧 FULL URL:', api.defaults.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Interceptor para debug de responses (Específico de este archivo - MANTENIDO)
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ RESPONSE ERROR:', error);
    console.error('🔗 ERROR URL:', error.config?.url);
    console.error('📋 ERROR DETAILS:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const VoucherService = {
  // Obtener todos los vales
  getAll: () => api.get('/voucher'),
  
  // Obtener vale por ID
  getById: (id) => api.get(`/voucher/${id}`),
  
  // Crear nuevo vale
  create: (data) => api.post('/voucher/save', data),
  
  // Actualizar vale
  update: (data) => api.put('/voucher/update', data),
  
  // Eliminar (lógico)
  delete: (id) => api.patch(`/voucher/delete/${id}`),
  
  // Restaurar vale eliminado
  restore: (id) => api.patch(`/voucher/${id}/restore`),
  
  // Restaurar vale rechazado
  restoreRejected: (id) => api.patch(`/voucher/${id}/restore-rejected`),
  
  // Aprobar vale
  approveVoucher: (id) => {
    console.log('🎯 Aprobando vale ID:', id);
    return api.patch(`/voucher/${id}/approve`);
  },
  
  // Rechazar vale
  rejectVoucher: (id) => {
    console.log('🎯 Rechazando vale ID:', id);
    return api.patch(`/voucher/${id}/reject`);
  },
  
  // Completar proceso del vale
  completeProcess: (voucherId) => api.post(`/voucher/${voucherId}/complete`),

  // Justificar vale
  justifyVoucher: (id) => api.patch(`/voucher/${id}/justify`),
  
  // Obtener documento del vale
  getDocument: (id) => api.get(`/voucher/${id}/document`),
};

// Alias para mantener compatibilidad
export const voucherService = VoucherService;

export default api;