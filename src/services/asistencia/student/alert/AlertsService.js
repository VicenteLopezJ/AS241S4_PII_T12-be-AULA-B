// src/services/asistencia/student/alert/AlertsService.js

import { INASISTENCIAS_API } from "../../../api";
import { getCurrentStudentId } from "../studentConfig";

const API_BASE_URL = "/api/v1/students";
// const STUDENT_ID = getCurrentStudentId(); // Removed to avoid static initialization

// 🔥 Importar función de configuración académica
const getAcademicConfig = async (studentId = getCurrentStudentId()) => {
  try {
    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/academic-config`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching academic config:", error);
    return { currentPeriod: "2025-I" };
  }
};

export const getStudentAlerts = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    console.log(`📊 Fetching alerts for student ${studentId}...`);

    // 🔥 Obtener período dinámicamente
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    // Obtener dashboard completo con todos los cursos
    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/dashboard`,
      {
        params: { period },
      }
    );

    const dashboard = response.data;
    console.log("✅ Dashboard data received:", dashboard);

    // Filtrar cursos por estado
    const allCourses = dashboard.courses;
    const criticalCourses = allCourses.filter((c) => c.estado === "CRÍTICO");
    const warningCourses = allCourses.filter((c) => c.estado === "ALERTA");
    const optimalCourses = allCourses.filter((c) => c.estado === "ÓPTIMO");

    console.log("📚 Sample course data:", allCourses[0]);

    // Métricas para las tarjetas superiores
    const metricData = {
      criticas: {
        count: criticalCourses.length,
        description: "Cursos en riesgo de desaprobación",
      },
      advertencias: {
        count: warningCourses.length,
        description: "Cursos que requieren atención",
      },
      notificaciones: {
        count: criticalCourses.length + warningCourses.length,
        description: "Alertas enviadas por correo",
      },
    };

    // Formatear alertas críticas
    const criticalAlerts = criticalCourses.map((course) => {
      const percentage = parseFloat(course.percent.replace("%", ""));
      const inasistenciaPercentage = 100 - percentage;

      console.log(`🔴 Critical Course: ${course.name} (${course.code})`);

      return {
        unidadDidactica: course.name || course.courseName || "Sin nombre",
        codigo: course.code || course.ud,
        porcentajeInasistencia: `${inasistenciaPercentage.toFixed(1)}%`,
        message: `Has superado el 30% de inasistencias. Estás en riesgo de desaprobar el curso por faltas.`,
        totalClases: course.plan,
        totalFaltas: course.f,
        porcentaje: percentage,
        fechaRevision: new Date().toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        courseId: course.courseId,
        asistencias: course.a,
        tardanzas: course.t,
        justificadas: course.j,
        asistenciasEfectivas: course.asistencias,
      };
    });

    // Formatear alertas de advertencia
    const warningAlerts = warningCourses.map((course) => {
      const percentage = parseFloat(course.percent.replace("%", ""));
      const inasistenciaPercentage = 100 - percentage;

      console.log(`🟡 Warning Course: ${course.name} (${course.code})`);

      return {
        unidadDidactica: course.name || course.courseName || "Sin nombre",
        codigo: course.code || course.ud,
        porcentajeInasistencia: `${inasistenciaPercentage.toFixed(1)}%`,
        message: `Tienes entre 15% y 29.99% de inasistencias. Mantente atento a tu asistencia.`,
        totalClases: course.plan,
        totalFaltas: course.f,
        porcentaje: percentage,
        fechaRevision: new Date().toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        courseId: course.courseId,
        asistencias: course.a,
        tardanzas: course.t,
        justificadas: course.j,
        asistenciasEfectivas: course.asistencias,
      };
    });

    console.log(`🔴 Critical courses: ${criticalCourses.length}`);
    console.log(`🟡 Warning courses: ${warningCourses.length}`);
    console.log(`🟢 Optimal courses: ${optimalCourses.length}`);

    if (criticalAlerts.length > 0) {
      console.log("🔴 First critical alert:", criticalAlerts[0]);
    }
    if (warningAlerts.length > 0) {
      console.log("🟡 First warning alert:", warningAlerts[0]);
    }

    return {
      metricData,
      criticalAlerts,
      warningAlerts,
      studentInfo: dashboard.studentInfo,
      allCourses: allCourses,
      currentPeriod: period, // 🔥 Incluir período
    };
  } catch (error) {
    console.error("❌ Error fetching student alerts:", error);
    console.error("Error details:", error.response?.data);

    return {
      metricData: {
        criticas: {
          count: 0,
          description: "Cursos en riesgo de desaprobación",
        },
        advertencias: {
          count: 0,
          description: "Cursos que requieren atención",
        },
        notificaciones: {
          count: 0,
          description: "Alertas enviadas por correo",
        },
      },
      criticalAlerts: [],
      warningAlerts: [],
      allCourses: [],
      error: error.message,
      currentPeriod: "2025-I",
    };
  }
};

/**
 * 📋 Obtiene solo las alertas críticas (para notificaciones rápidas)
 */
export const getCriticalAlerts = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    const data = await getStudentAlerts(studentId, period);
    return data.criticalAlerts;
  } catch (error) {
    console.error("❌ Error fetching critical alerts:", error);
    return [];
  }
};

/**
 * 📊 Obtiene estadísticas de alertas por semestre
 */
export const getAlertStatistics = async (studentId = getCurrentStudentId()) => {
  try {
    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/alert-statistics`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching alert statistics:", error);
    return {
      totalAlerts: 0,
      resolvedAlerts: 0,
      activeAlerts: 0,
    };
  }
};

export default {
  getStudentAlerts,
  getCriticalAlerts,
  getAlertStatistics,
};