import API from './api';

export const attentionService = {
  // 🔹 Obtener todas las atenciones
  getAll: async () => {
    try {
      console.log('🔍 [attentionService] Obteniendo todas las atenciones...');
      const response = await API.get('/attention/');
      console.log('✅ [attentionService] Datos recibidos:', response.data);
      
      // Transformar fechas si es necesario
      const transformedData = response.data.map(item => {
        // Si dateAttended es string, convertirlo a formato ISO
        if (item.dateAttended && typeof item.dateAttended === 'string') {
          // Si ya está en formato ISO, dejarlo
          if (item.dateAttended.includes('T')) {
            return item;
          }
          // Si es "YYYY-MM-DD", agregar tiempo
          if (/^\d{4}-\d{2}-\d{2}$/.test(item.dateAttended)) {
            return {
              ...item,
              dateAttended: `${item.dateAttended}T00:00:00`
            };
          }
        }
        return item;
      });
      
      return transformedData;
    } catch (error) {
      console.error('❌ [attentionService] Error al obtener atenciones:', error);
      throw error;
    }
  },

  // 🔹 Obtener una atención por ID
  getById: async (id) => {
    try {
      console.log(`🔍 [attentionService] Obteniendo atención ID: ${id}`);
      const response = await API.get(`/attention/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [attentionService] Error al obtener atención ${id}:`, error);
      throw error;
    }
  },

  // 🔹 Crear nueva atención
  create: async (data) => {
    try {
      console.log('🆕 [attentionService] Creando nueva atención:', data);
      
      // Preparar payload - asegurar formato correcto
      const payload = {
        dateAttended: data.dateAttended ? data.dateAttended.split('T')[0] : new Date().toISOString().split('T')[0],
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender || null,
        occupation: data.occupation || null,
        program: data.program || null,
        dni: data.dni || null,
        address: data.address || null,
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        notes: data.notes || null,
        status: data.status || 'P'
      };
      
      console.log('📤 Payload al backend:', payload);
      const response = await API.post('/attention/', payload);
      console.log('✅ [attentionService] Atención creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [attentionService] Error al crear atención:', error);
      throw error;
    }
  },

  // 🔹 Actualizar atención
  update: async (id, data) => {
    try {
      console.log(`✏️ [attentionService] Actualizando atención ${id}:`, data);
      
      // Preparar fecha correctamente
      let dateAttended = data.dateAttended;
      if (dateAttended) {
        if (typeof dateAttended === 'string') {
          if (dateAttended.includes('T')) {
            dateAttended = dateAttended.split('T')[0];
          }
        } else if (dateAttended instanceof Date) {
          dateAttended = dateAttended.toISOString().split('T')[0];
        }
      }
      
      const payload = {
        dateAttended: dateAttended,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender,
        occupation: data.occupation,
        program: data.program,
        dni: data.dni,
        address: data.address,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
        status: data.status
      };
      
      console.log('📤 Payload al backend:', payload);
      const response = await API.put(`/attention/${id}`, payload);
      console.log('✅ [attentionService] Atención actualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [attentionService] Error al actualizar atención ${id}:`, error);
      throw error;
    }
  },

  // 🔹 Completar atención
  complete: async (id) => {
    try {
      console.log(`✅ [attentionService] Completando atención ${id}...`);
      const response = await API.patch(`/attention/${id}/complete`);
      console.log('✅ [attentionService] Atención completada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [attentionService] Error al completar atención ${id}:`, error);
      throw error;
    }
  },

  // 🔹 Eliminación lógica
  delete: async (id) => {
    try {
      console.log(`🗑️ [attentionService] Eliminando atención ${id}...`);
      const response = await API.patch(`/attention/${id}`);
      console.log('✅ [attentionService] Atención eliminada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [attentionService] Error al eliminar atención ${id}:`, error);
      throw error;
    }
  },

  // 🔹 Restaurar atención eliminada
  restore: async (id) => {
    try {
      console.log(`🔄 [attentionService] Restaurando atención ${id}...`);
      const response = await API.patch(`/attention/restore/${id}`);
      console.log('✅ [attentionService] Atención restaurada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [attentionService] Error al restaurar atención ${id}:`, error);
      throw error;
    }
  }
};