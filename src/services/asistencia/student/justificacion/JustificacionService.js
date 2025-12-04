// src/services/asistencia/student/justificacion/JustificacionService.js

import { INASISTENCIAS_API } from "../../../api";

const API_BASE_URL = "/api/v1/justifications";

class JustificacionService {
  // GET: Listar todas las justificaciones
  static async getAllJustifications(params = {}) {
    try {
      const response = await INASISTENCIAS_API.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching justifications:", error);
      throw this.handleError(error);
    }
  }

  // GET: Justificaciones por estudiante
  static async getJustificationsByStudent(studentId) {
    try {
      const response = await INASISTENCIAS_API.get(API_BASE_URL, {
        params: { studentId },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching justifications for student ${studentId}:`,
        error
      );
      throw this.handleError(error);
    }
  }

  // GET: Justificaciones por estado
  static async getJustificationsByStatus(status, params = {}) {
    try {
      const response = await INASISTENCIAS_API.get(API_BASE_URL, {
        params: { ...params, status },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching justifications by status ${status}:`,
        error
      );
      throw this.handleError(error);
    }
  }

  // POST: Crear nueva justificación
  static async createJustification(justificationData) {
    try {
      const response = await INASISTENCIAS_API.post(
        API_BASE_URL,
        justificationData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating justification:", error);
      throw this.handleError(error);
    }
  }

  // PUT: Aprobar justificación
  static async approveJustification(justificationId, reviewData) {
    // reviewData debe contener { reviewedBy: 141, reviewComments: "..." }
    try {
      const url = `${API_BASE_URL}/${justificationId}/approve`;
      const response = await INASISTENCIAS_API.put(url, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error approving justification ${justificationId}:`, error);
      throw this.handleError(error);
    }
  }

  // PUT: Rechazar justificación
  static async rejectJustification(justificationId, reviewData) {
    // reviewData debe contener { reviewedBy: 141, reviewComments: "..." }
    try {
      const url = `${API_BASE_URL}/${justificationId}/reject`;
      const response = await INASISTENCIAS_API.put(url, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting justification ${justificationId}:`, error);
      throw this.handleError(error);
    }
  }

  // PATCH: Restaurar estado de justificación
  static async restoreJustification(justificationId) {
    try {
      const url = `${API_BASE_URL}/${justificationId}/restore`;
      // La ruta del backend es PATCH y no necesita cuerpo (body)
      const response = await INASISTENCIAS_API.patch(url);
      return response.data;
    } catch (error) {
      console.error(`Error restoring justification ${justificationId}:`, error);
      throw this.handleError(error);
    }
  }

  // Transformar datos del backend al frontend
  static formatJustificationForDisplay(justification) {
    const statusMap = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazada",
    };

    return {
      id: justification.justificationId,
      unidadDidactica: justification.courseName || "Sin curso",
      codigo: justification.courseCode || "N/A",
      fechaFalta: this.formatDate(justification.classDate),
      motivo: justification.reason,
      descripcion: justification.description,
      fechaEnvio: this.formatDateTime(justification.requestDate),
      fechaRevision: justification.reviewDate
        ? this.formatDateTime(justification.reviewDate)
        : null,
      observaciones: justification.reviewComments || null,
      estado: statusMap[justification.status] || "Desconocido",
      estadoRaw: justification.status,
      fueraPlazo: this.isOutOfDeadline(
        justification.classDate,
        justification.requestDate
      ),
      attachmentFile: justification.attachmentFile,
      attendanceId: justification.attendanceId,
      studentName: justification.studentName,
      studentCode: justification.studentCode,
    };
  }

  // Transformar datos del formulario al backend
  static formatJustificationForBackend(formData) {
    return {
      attendanceId: parseInt(formData.attendanceId),
      reason: formData.motivo,
      description: formData.descripcion || null,
      attachmentFile: formData.attachmentFileName || null,
    };
  }

  // Utilidades
  static formatDate(isoDate) {
    if (!isoDate) return "N/A";

    try {
      // 🔥 IMPORTANTE: Asegurarse de parsear correctamente
      const date = new Date(isoDate);

      // Validar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn("⚠️ Invalid date:", isoDate);
        return "Fecha inválida";
      }

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("❌ Error formatting date:", error);
      return "Error en fecha";
    }
  }

  static formatDateTime(isoDateTime) {
    if (!isoDateTime) return "N/A";
    const date = new Date(isoDateTime);
    return date.toLocaleString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  static isOutOfDeadline(classDate, requestDate) {
    if (!classDate || !requestDate) return false;

    const classDT = new Date(classDate);
    const requestDT = new Date(requestDate);
    const diffInHours = (requestDT - classDT) / (1000 * 60 * 60);

    return diffInHours > 48;
  }

  static handleError(error) {
    if (error.response) {
      const message =
        error.response.data?.detail ||
        error.response.data?.message ||
        "Error en el servidor";
      return new Error(message);
    } else if (error.request) {
      return new Error(
        "No se pudo conectar con el servidor. Verifica tu conexión."
      );
    } else {
      return new Error(error.message || "Error desconocido");
    }
  }

  static getJustificationStats(justifications) {
    const total = justifications.length;
    const pendientes = justifications.filter(
      (j) => j.estadoRaw === "pending"
    ).length;
    const aprobadas = justifications.filter(
      (j) => j.estadoRaw === "approved"
    ).length;
    const rechazadas = justifications.filter(
      (j) => j.estadoRaw === "rejected"
    ).length;
    const fueraPlazo = justifications.filter((j) => j.fueraPlazo).length;

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
      fueraPlazo,
      tasaAprobacion: total > 0 ? ((aprobadas / total) * 100).toFixed(1) : 0,
    };
  }
}

export default JustificacionService;
