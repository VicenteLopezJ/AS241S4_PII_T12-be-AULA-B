import API from "./api";

// Transformar datos del backend al frontend - SOLO campo id
const transformMedicamentoFromAPI = (med) => ({
  id: med.idMedicamento,
  nombre: med.nombre,
  presentacion: med.presentacion,
  descripcion: med.descripcion,
  categoria: med.categoria,
  estado: med.estado // Mantener como "A" o "I"
});

// Transformar datos del frontend al backend
const transformMedicamentoToAPI = (med) => ({
  nombre: med.nombre,
  presentacion: med.presentacion, // No hacer parseInt
  descripcion: med.descripcion,
  categoria: med.categoria,
  estado: med.estado // Agregar estado si es necesario
});

export const medicamentoService = {
  getAll: async () => {
    try {
      console.log("🔍 [medicamentoService] GET /medicamento/");
      const response = await API.get("/medicamento/");
      console.log("📦 Response:", response.data);

      if (!Array.isArray(response.data)) return [];

      return response.data.map(transformMedicamentoFromAPI);
    } catch (error) {
      console.error("❌ Error en getAll Medicamento", error);
      throw error;
    }
  },

  getByEstado: async (estado) => {
    try {
      console.log(`🔍 [medicamentoService] GET /medicamento/estado/${estado}/`);
      const response = await API.get(`/medicamento/estado/${estado}/`);

      if (!Array.isArray(response.data)) return [];

      return response.data.map(transformMedicamentoFromAPI);
    } catch (error) {
      console.error("❌ Error en getByEstado Medicamento", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`🔍 [medicamentoService] GET /medicamento/${id}/`);
      const response = await API.get(`/medicamento/${id}/`);
      return transformMedicamentoFromAPI(response.data);
    } catch (error) {
      console.error("❌ Error en getById Medicamento", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log("🆕 [medicamentoService] Creando:", data);
      const payload = {
        nombre: data.nombre,
        presentacion: data.presentacion,
        descripcion: data.descripcion || "",
        categoria: data.categoria || "",
        estado: "A" // Por defecto activo al crear
      };
      const response = await API.post("/medicamento/", payload);
      return transformMedicamentoFromAPI(response.data);
    } catch (error) {
      console.error("❌ Error en create Medicamento", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log("✏️ [medicamentoService] Actualizando:", id, data);
      const payload = {
        nombre: data.nombre,
        presentacion: data.presentacion,
        descripcion: data.descripcion || "",
        categoria: data.categoria || "",
        estado: data.estado || "A" // Mantener el estado existente
      };
      const response = await API.put(`/medicamento/${id}/`, payload);
      return transformMedicamentoFromAPI(response.data);
    } catch (error) {
      console.error("❌ Error en update Medicamento", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log("🗑 [medicamentoService] PATCH delete:", id);
      const response = await API.patch(`/medicamento/${id}/`);
      return response.data;
    } catch (error) {
      console.error("❌ Error en delete Medicamento", error);
      throw error;
    }
  },

  restore: async (id) => {
    try {
      console.log("🔄 [medicamentoService] Restaurando:", id);
      const response = await API.patch(`/medicamento/restore/${id}/`);
      return response.data;
    } catch (error) {
      console.error("❌ Error en restore Medicamento", error);
      throw error;
    }
  },
};