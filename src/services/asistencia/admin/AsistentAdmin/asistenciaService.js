// src/services/asistencia/admin/AsistentAdmin/asistenciaService.js
import { INASISTENCIAS_API } from "../../../api";

const API_PREFIX = '/api/v1';

export const asistenciaService = {
  // 🆕 Función mejorada: acepta múltiples períodos
  obtenerEstadisticasMejoradas: async (periods = "2025-I", careerId = null) => {
    try {
      console.log("📊 Fetching enhanced admin statistics...");

      // 🆕 Convertir array a string separado por comas
      const periodParam = Array.isArray(periods) ? periods.join(',') : periods;

      const params = { period: periodParam };
      if (careerId) {
        params.careerId = careerId;
      }

      const response = await INASISTENCIAS_API.get(
        `${API_PREFIX}/admin/dashboard/statistics/enhanced`,
        {
          params,
          timeout: 60000,
        }
      );

      console.log("✅ Enhanced statistics loaded:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error loading enhanced statistics:", error);

      if (error.response) {
        throw new Error(
          error.response.data?.detail ||
          `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8000"
        );
      } else {
        throw new Error("Error al procesar la solicitud");
      }
    }
  },

  obtenerDetalleSemestre: async (semestreId, periods = "2025-I") => {
    try {
      console.log(`📄 Fetching details for semester ${semestreId}...`);

      const periodParam = Array.isArray(periods) ? periods.join(',') : periods;

      const response = await INASISTENCIAS_API.get(
        `${API_PREFIX}/admin/dashboard/semesters/${semestreId}/details`,
        {
          params: { period: periodParam },
          timeout: 30000,
        }
      );

      console.log("✅ Semester details loaded:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error loading semester details:", error);

      if (error.response?.status === 404) {
        throw new Error("Semestre no encontrado");
      }

      throw new Error(
        error.response?.data?.detail || "Error al cargar detalles del semestre"
      );
    }
  },

  exportarDatos: async (semestreId, periods = "2025-I", formato = "xlsx") => {
    try {
      console.log(`📤 Exporting semester ${semestreId} as ${formato}...`);

      const periodParam = Array.isArray(periods) ? periods.join(',') : periods;

      const response = await INASISTENCIAS_API.get(
        `${API_PREFIX}/admin/dashboard/semesters/${semestreId}/export`,
        {
          params: {
            format: formato,
            period: periodParam,
          },
          responseType: "blob",
          timeout: 120000,
        }
      );

      let filename = `semestre_${semestreId}_${periodParam.replace(/,/g, '_')}.${formato}`;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      console.log(`✅ File downloaded: ${filename}`);

      return {
        success: true,
        mensaje: "Datos exportados correctamente",
        filename: filename,
      };
    } catch (error) {
      console.error("❌ Export error:", error);

      if (error.response?.status === 404) {
        throw new Error("Semestre no encontrado");
      }

      if (error.code === "ECONNABORTED") {
        throw new Error(
          "La exportación está tardando mucho. Intenta con menos datos."
        );
      }

      throw new Error(
        error.response?.data?.detail ||
        "Error al exportar datos. Por favor, intenta nuevamente."
      );
    }
  },

  refrescarDatos: async (periods = "2025-I", careerId = null) => {
    return asistenciaService.obtenerEstadisticasMejoradas(periods, careerId);
  },
};

export const formatUtils = {
  getColorByPercentage: (porcentaje) => {
    if (porcentaje >= 85) return "excelente";
    if (porcentaje >= 70) return "regular";
    return "critico";
  },

  getStatusByPercentage: (porcentaje) => {
    if (porcentaje >= 85) return "ÓPTIMO";
    if (porcentaje >= 70) return "CRÍTICO";
    return "DESAPROBADO";
  },

  formatPercentage: (value) => {
    return `${Number(value).toFixed(1)}%`;
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
};

export default asistenciaService;