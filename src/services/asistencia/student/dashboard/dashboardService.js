// src/services/asistencia/student/dashboard/dashboardService.js

import { INASISTENCIAS_API } from "../../../api";

const API_BASE_URL = "/api/v1/students";
const STUDENT_ID = getCurrentStudentId();
import { getCurrentStudentId } from "../studentConfig";

// 🔥 NUEVA: Obtener configuración académica
export const getAcademicConfig = async (studentId = STUDENT_ID) => {
  try {
    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/academic-config`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching academic config:", error);
    return {
      currentPeriod: "2025-I",
      currentSemester: 3,
      semesterType: "impar",
    };
  }
};

/**
 * 📊 Obtiene todos los datos del dashboard del estudiante
 */
export const fetchStudentDashboard = async (
  studentId = STUDENT_ID,
  period = null
) => {
  try {
    console.log(`📊 Fetching dashboard data for student ${studentId}...`);

    // 🔥 Obtener período dinámicamente si no se proporciona
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/dashboard`,
      {
        params: { period },
      }
    );

    const dashboardData = response.data;
    console.log("✅ Dashboard data received:", dashboardData);

    const studentInfo = dashboardData.studentInfo;
    const courses = dashboardData.courses;
    const optimos = courses.filter((c) => c.estado === "ÓPTIMO").length;
    const alertas = courses.filter((c) => c.estado === "ALERTA").length;
    const criticos = courses.filter((c) => c.estado === "CRÍTICO").length;

    const attendanceSummaryData = [
      {
        title: "ÓPTIMO",
        count: optimos,
        subtitle: "< 10% faltas",
        color: "green",
      },
      {
        title: "ALERTA",
        count: alertas,
        subtitle: "10% - 29% faltas",
        color: "yellow",
      },
      {
        title: "CRÍTICO",
        count: criticos,
        subtitle: "≥ 30% faltas",
        color: "red",
      },
    ];

    const isCriticalAlert = criticos > 0;
    const alertMessage = isCriticalAlert
      ? `Tienes ${criticos} curso(s) en estado crítico. Revisa tus asistencias para evitar la desaprobación.`
      : alertas > 0
        ? `Tienes ${alertas} curso(s) en alerta. Mantén tu asistencia para evitar problemas.`
        : "¡Excelente! Tu asistencia está en buen estado.";

    return {
      studentName: studentInfo.name.split(" ")[0],
      studentId: studentInfo.studentCode,
      semester: `${getOrdinalSemester(studentInfo.currentSemester)} Semestre`,
      career: studentInfo.career,
      isCriticalAlert,
      alertMessage,
      attendanceSummaryData,
      lastUpdated: dashboardData.lastUpdated,
      currentPeriod: period, // 🔥 Incluir período
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard:", error);
    throw error;
  }
};

/**
 * 📅 Obtiene la última asistencia de cada curso
 */
export const fetchRecentAttendances = async (
  studentId = STUDENT_ID,
  period = null
) => {
  try {
    console.log(`📅 Fetching recent attendances for student ${studentId}...`);

    // 🔥 Período dinámico
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/recent-attendances`,
      {
        params: { period, limit: 50 },
      }
    );

    const allAttendances = response.data;
    console.log(
      "✅ All attendances received:",
      allAttendances.length,
      "records"
    );

    // Agrupar por curso y obtener solo el más reciente de cada uno
    const attendancesByCourse = new Map();

    allAttendances.forEach((item) => {
      const courseKey = item.courseCode;

      if (!attendancesByCourse.has(courseKey)) {
        attendancesByCourse.set(courseKey, item);
      } else {
        const existing = attendancesByCourse.get(courseKey);
        const itemDate = new Date(
          item.classDate + "T" + (item.classTime || "00:00:00")
        );
        const existingDate = new Date(
          existing.classDate + "T" + (existing.classTime || "00:00:00")
        );

        if (itemDate > existingDate) {
          attendancesByCourse.set(courseKey, item);
        }
      }
    });

    const latestAttendances = Array.from(attendancesByCourse.values());
    console.log(
      "✅ Latest attendances by course:",
      latestAttendances.length,
      "unique courses"
    );

    // Formatear datos para el dashboard
    const formattedData = latestAttendances.map((item) => {
      let status, buttonText, colorClass;

      switch (item.attendanceStatus) {
        case "P":
          status = "Asistió";
          buttonText = "Asistió";
          colorClass = "bg-green-500";
          break;
        case "A":
          status = "Faltó";
          buttonText = "Faltó";
          colorClass = "bg-red-500";
          break;
        case "L":
          status = "Tardanza";
          buttonText = "Tardanza";
          colorClass = "bg-yellow-500";
          break;
        case "J":
          status = "Justificado";
          buttonText = "Justificado";
          colorClass = "bg-blue-500";
          break;
        default:
          status = "Desconocido";
          buttonText = "N/A";
          colorClass = "bg-gray-500";
          console.warn(
            `⚠️ Unknown attendance status: ${item.attendanceStatus}`
          );
      }

      return {
        courseCode: item.courseCode,
        courseName: item.courseName,
        date: formatDate(item.classDate),
        rawDate: item.classDate,
        status,
        buttonText,
        colorClass,
        attendanceId: item.attendanceId,
      };
    });

    // Ordenar por fecha más reciente primero
    formattedData.sort((a, b) => {
      return new Date(b.rawDate) - new Date(a.rawDate);
    });

    // Retornar máximo 5 cursos más recientes
    const result = formattedData.slice(0, 5).map((item) => {
      const { rawDate, ...rest } = item;
      return rest;
    });

    console.log("✅ Formatted data (max 5):", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching recent attendances:", error);
    console.error("Error details:", error.response?.data || error.message);
    return [];
  }
};

/**
 * 📝 Obtiene las justificaciones pendientes
 */
export const fetchPendingJustifications = async (studentId = STUDENT_ID) => {
  try {
    console.log(
      `📝 Fetching pending justifications for student ${studentId}...`
    );

    const response = await INASISTENCIAS_API.get(`/api/v1/justifications`, {
      params: {
        studentId,
        status: "pending",
      },
    });

    const pendingJustifications = response.data;
    console.log("✅ Pending justifications:", pendingJustifications);

    return pendingJustifications.map((just) => ({
      courseCode: just.courseCode,
      date: formatDate(just.classDate),
      reason: just.reason,
      status: "Pendiente",
      justificationId: just.justificationId,
    }));
  } catch (error) {
    console.error("❌ Error fetching pending justifications:", error);
    return [];
  }
};

/**
 * 🎯 Obtiene TODOS los datos del dashboard en una sola llamada
 */
export const fetchCompleteStudentData = async (
  studentId = STUDENT_ID,
  period = null
) => {
  try {
    console.log(`🎯 Fetching complete dashboard data...`);

    // 🔥 Obtener configuración académica primero
    const config = await getAcademicConfig(studentId);
    const activePeriod = period || config.currentPeriod;

    const [dashboardData, recentAttendances, pendingJustifications] =
      await Promise.all([
        fetchStudentDashboard(studentId, activePeriod),
        fetchRecentAttendances(studentId, activePeriod),
        fetchPendingJustifications(studentId),
      ]);

    return {
      ...dashboardData,
      recentAttendanceData: recentAttendances,
      pendingJustificationData: pendingJustifications,
      academicConfig: config, // 🔥 Incluir configuración académica
    };
  } catch (error) {
    console.error("❌ Error fetching complete dashboard data:", error);

    return {
      studentName: "Estudiante",
      studentId: "N/A",
      semester: "Semestre",
      career: "Carrera",
      isCriticalAlert: false,
      alertMessage: "No se pudieron cargar los datos. Intenta de nuevo.",
      attendanceSummaryData: [
        { title: "ÓPTIMO", count: 0, subtitle: "< 10% faltas", color: "green" },
        {
          title: "ALERTA",
          count: 0,
          subtitle: "10% - 29% faltas",
          color: "yellow",
        },
        { title: "CRÍTICO", count: 0, subtitle: "≥ 30% faltas", color: "red" },
      ],
      recentAttendanceData: [],
      pendingJustificationData: [],
      lastUpdated: new Date().toLocaleDateString("es-PE"),
      currentPeriod: "2025-I",
    };
  }
};

/**
 * 📄 Datos de acciones rápidas
 */
export const quickActionsData = [
  {
    text: "Ver Todas las Asistencias",
    colorClass: "bg-blue-600 hover:bg-blue-700",
    icon: "📋",
    route: "/student/asistencias",
  },
  {
    text: "Enviar Justificación",
    colorClass: "bg-green-600 hover:bg-green-700",
    icon: "✉️",
    route: "/student/justificaciones",
  },
  {
    text: "Ver Alertas",
    colorClass: "bg-orange-500 hover:bg-orange-600",
    icon: "⚠️",
    route: "/student/alertas",
  },
];

/**
 * 🛠️ Utilidades
 */
function formatDate(isoDate) {
  if (!isoDate) return "N/A";

  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getOrdinalSemester(semesterNumber) {
  const ordinals = {
    1: "Primer",
    2: "Segundo",
    3: "Tercer",
    4: "Cuarto",
    5: "Quinto",
    6: "Sexto",
  };
  return ordinals[semesterNumber] || `${semesterNumber}°`;
}

export default {
  fetchCompleteStudentData,
  fetchStudentDashboard,
  fetchRecentAttendances,
  fetchPendingJustifications,
  quickActionsData,
  getAcademicConfig, // 🔥 Exportar nueva función
};