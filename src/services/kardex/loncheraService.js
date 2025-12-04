import API from "./api";

const loncheraService = {
  // -------------------------------------
  //  LISTAR TODAS LAS LONCHERAS
  // -------------------------------------
  list: async () => {
    try {
      console.log('🔍 [loncheraService] Obteniendo loncheras...');
      const response = await API.get('/lonchera/');
      console.log('✅ [loncheraService] Datos recibidos del backend:', response.data);
      
      // EL BACKEND YA DEVUELVE LOS CAMPOS CORRECTOS
      // No necesitas transformarlos
      return response.data || [];
    } catch (error) {
      console.error('❌ [loncheraService] Error al obtener loncheras:', error);
      
      // Mostrar error más específico
      if (error.response) {
        console.error('📊 Error response:', error.response.data);
        console.error('🔢 Status:', error.response.status);
      }
      
      throw error;
    }
  },

  // -------------------------------------
  //  GET ALL (alias)
  // -------------------------------------
  getAll: async () => {
    return await loncheraService.list();
  },

  // -------------------------------------
  //  CREAR LONCHERA
  // -------------------------------------
  create: async (data) => {
    try {
      console.log('🆕 [loncheraService] Creando lonchera:', data);
      
      // Ajustar nombres al backend
      const payload = {
        lunchboxName: data.nombreLonchera,  // Backend espera lunchboxName
        item: data.item,
        currentQuantity: parseInt(data.cantidadActual) || 0,
        minimumQuantity: parseInt(data.cantidadMinima) || 0,
        cycle: data.ciclo || "",
        school: data.escuela || ""
      };
      
      console.log('📤 [loncheraService] Payload enviado:', payload);
      const response = await API.post('/lonchera/', payload);
      console.log('✅ [loncheraService] Lonchera creada:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [loncheraService] Error al crear lonchera:', error);
      
      if (error.response) {
        console.error('📊 Error response:', error.response.data);
        console.error('🔢 Status:', error.response.status);
      }
      
      throw error;
    }
  },

  // -------------------------------------
  //  ACTUALIZAR LONCHERA
  // -------------------------------------
  update: async (id, data) => {
    try {
      console.log(`✏️ [loncheraService] Actualizando lonchera ${id}:`, data);
      
      const payload = {
        lunchboxName: data.nombreLonchera,
        item: data.item,
        currentQuantity: parseInt(data.cantidadActual) || 0,
        minimumQuantity: parseInt(data.cantidadMinima) || 0,
        cycle: data.ciclo || "",
        school: data.escuela || ""
      };
      
      console.log('📤 [loncheraService] Payload enviado:', payload);
      const response = await API.put(`/lonchera/${id}`, payload);
      console.log('✅ [loncheraService] Lonchera actualizada:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ [loncheraService] Error al actualizar lonchera ${id}:`, error);
      
      if (error.response) {
        console.error('📊 Error response:', error.response.data);
        console.error('🔢 Status:', error.response.status);
      }
      
      throw error;
    }
  },

  // -------------------------------------
  //  ELIMINAR LONCHERA
  // -------------------------------------
  delete: async (id) => {
    try {
      console.log(`🗑️ [loncheraService] Eliminando lonchera ${id}...`);
      const response = await API.patch(`/lonchera/${id}`);
      console.log('✅ [loncheraService] Lonchera eliminada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [loncheraService] Error al eliminar lonchera ${id}:`, error);
      throw error;
    }
  },

  // -------------------------------------
  //  RESTAURAR LONCHERA
  // -------------------------------------
  restore: async (id) => {
    try {
      console.log(`🔄 [loncheraService] Restaurando lonchera ${id}...`);
      const response = await API.patch(`/lonchera/restore/${id}`);
      console.log('✅ [loncheraService] Lonchera restaurada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [loncheraService] Error al restaurar lonchera ${id}:`, error);
      throw error;
    }
  },

  // -------------------------------------
  //  OBTENER POR ID
  // -------------------------------------
  getById: async (id) => {
    try {
      console.log(`🔍 [loncheraService] Obteniendo lonchera ${id}`);
      const response = await API.get(`/lonchera/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ [loncheraService] Error al obtener lonchera:', error);
      throw error;
    }
  },

  // -------------------------------------
  //  OBTENER POR ESTADO
  // -------------------------------------
  getByEstado: async (estado) => {
    try {
      console.log(`🔍 [loncheraService] Obteniendo loncheras por estado: ${estado}`);
      const response = await API.get(`/lonchera/estado/${estado}`);
      return response.data || [];
    } catch (error) {
      console.error(`❌ [loncheraService] Error al obtener loncheras por estado ${estado}:`, error);
      throw error;
    }
  }
};

export default loncheraService;