import API from "./api";

// Transformar datos del backend al frontend
const transformProveedorFromAPI = (prov) => ({
  id: prov.idProveedor,
  razonSocial: prov.nombre,
  telefono: prov.telefono,
  direccion: prov.direccion,
  ruc: prov.ruc,
  correo: prov.correo,
  estado: prov.estado === "A" ? "Activo" : "Inactivo"
});

// Transformar datos del frontend al backend
const transformProveedorToAPI = (prov) => ({
  nombre: prov.razonSocial,
  telefono: prov.telefono,
  direccion: prov.direccion,
  ruc: prov.ruc || "00000000000",
  correo: prov.correo
});

export const proveedorService = {
  getAll: async () => {
    try {
      console.log("🔍 [proveedorService] GET /proveedor/");
      const response = await API.get("/proveedor/");

      if (!Array.isArray(response.data)) return [];

      return response.data.map(transformProveedorFromAPI);
    } catch (error) {
      console.error("❌ Error getAll Proveedor", error);
      throw error;
    }
  },

  getByEstado: async (estado) => {
    try {
      console.log(`🔍 [proveedorService] GET /proveedor/estado/${estado}/`);
      const response = await API.get(`/proveedor/estado/${estado}/`);

      if (!Array.isArray(response.data)) return [];

      return response.data.map(transformProveedorFromAPI);
    } catch (error) {
      console.error("❌ Error getByEstado Proveedor", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`🔍 [proveedorService] GET /proveedor/${id}/`);
      const response = await API.get(`/proveedor/${id}/`);
      return transformProveedorFromAPI(response.data);
    } catch (error) {
      console.error("❌ Error getById Proveedor", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log("🆕 [proveedorService] Creando:", data);
      const payload = transformProveedorToAPI(data);
      const response = await API.post("/proveedor/", payload);
      return transformProveedorFromAPI(response.data);
    } catch (error) {
      console.error("❌ Error create Proveedor", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log("✏️ [proveedorService] Actualizando:", id, data);
      const payload = transformProveedorToAPI(data);
      const response = await API.put(`/proveedor/${id}/`, payload);
      return transformProveedorFromAPI(response.data);
    } catch (error) {
      console.error("❌ Error update Proveedor", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log("🗑 [proveedorService] Eliminando:", id);
      const response = await API.patch(`/proveedor/${id}/`);
      return response.data;
    } catch (error) {
      console.error("❌ Error delete Proveedor", error);
      throw error;
    }
  },

  restore: async (id) => {
    try {
      console.log("🔄 [proveedorService] Restaurando:", id);
      const response = await API.patch(`/proveedor/restore/${id}/`);
      return response.data;
    } catch (error) {
      console.error("❌ Error restore Proveedor", error);
      throw error;
    }
  }
};
