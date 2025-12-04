import API from "./api";

export const compraService = {
  getAll: async () => {
    try {
      console.log("🔍 [compraService] Obteniendo todas las compras...");
      const response = await API.get("/compra/");
      console.log("✅ [compraService] Datos recibidos:", response.data);
      
      // Verificar la estructura de los datos
      if (response.data && response.data.length > 0) {
        console.log("📊 Primer registro recibido:", {
          idPurchase: response.data[0].idPurchase,
          idSupplier: response.data[0].idSupplier,
          supplierName: response.data[0].supplierName,
          status: response.data[0].status,
          raw: response.data[0]
        });
      }
      
      return response.data.map(compra => ({
        id: compra.idPurchase,  // Para compatibilidad
        idPurchase: compra.idPurchase,
        idSupplier: compra.idSupplier,
        supplierName: compra.supplierName || "Proveedor no disponible",
        purchaseDate: compra.purchaseDate,
        total: compra.total,
        status: compra.status  // 'A' o 'I'
      }));
    } catch (error) {
      console.error("❌ Error al obtener compras:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`🔍 [compraService] Obteniendo compra ID: ${id}`);
      const response = await API.get(`/compra/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener compra ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log("🆕 [compraService] Creando nueva compra:", data);
      
      const payload = {
        idSupplier: parseInt(data.idSupplier),
        purchaseDate: data.purchaseDate,
        total: parseFloat(data.total)
      };
      
      console.log("📤 Payload al backend:", payload);
      const response = await API.post("/compra/", payload);
      console.log("✅ Compra creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al crear compra:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log(`✏️ [compraService] Actualizando compra ${id}:`, data);
      
      const payload = {
        idSupplier: parseInt(data.idSupplier),
        purchaseDate: data.purchaseDate,
        total: parseFloat(data.total)
      };
      
      console.log("📤 Payload enviado:", payload);
      const response = await API.put(`/compra/${id}`, payload);
      console.log("✅ Compra actualizada:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar compra ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ [compraService] Eliminando compra ${id}...`);
      const response = await API.patch(`/compra/${id}`);
      console.log("✅ Compra eliminada:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar compra ${id}:`, error);
      throw error;
    }
  },

  restore: async (id) => {
    try {
      console.log(`🔄 [compraService] Restaurando compra ${id}...`);
      const response = await API.patch(`/compra/restore/${id}`);
      console.log("✅ Compra restaurada:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al restaurar compra ${id}:`, error);
      throw error;
    }
  }
};