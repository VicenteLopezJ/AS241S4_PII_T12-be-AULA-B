// src/services/asistencia/student/asistencia/attendanceService.js

import { INASISTENCIAS_API } from "../../../api";
import { getCurrentStudentId } from "../studentConfig";

const API_BASE_URL = "/api/v1/students";

export const getAcademicConfig = async (studentId = getCurrentStudentId()) => {
  try {
    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/academic-config`
    );
    console.log("✅ Academic config:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching academic config:", error);

    return {
      currentPeriod: "2025-I",
      currentSemester: 3,
      semesterType: "impar",
      availableSprints: [1, 2, 3, 4],
      academicYear: 2025,
      studentId: studentId,
    };
  }
};

/**
 * 📊 Obtiene el dashboard completo del estudiante
 */
export const getStudentDashboard = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/dashboard`,
      { params: { period } }
    );

    console.log("✅ Dashboard data:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching dashboard:", error);
    throw error;
  }
};

/**
 * 📅 Obtiene el historial mensual de asistencias
 */
export const getAttendanceHistory = async (
  studentId = getCurrentStudentId(),
  period = null,
  year = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
      year = year || config.academicYear;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/attendance-history`,
      { params: { period, year } }
    );

    console.log("✅ Attendance history:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching attendance history:", error);
    throw error;
  }
};

/**
 * 📚 Obtiene los cursos del estudiante
 */
export const getStudentCourses = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/courses`,
      { params: { period } }
    );

    console.log("✅ Courses data:", response.data);

    return [
      {
        courseId: "all",
        code: "ALL",
        name: "Todos los cursos",
        label: "Todos los cursos",
      },
      ...response.data,
    ];
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return [
      {
        courseId: "all",
        code: "ALL",
        name: "Todos los cursos",
        label: "Todos los cursos",
      },
    ];
  }
};

/**
 * 👤 Obtiene el header info del estudiante
 */
export const getStudentHeaderInfo = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const dashboard = await getStudentDashboard(studentId, period);

    return {
      name: dashboard.studentInfo.name,
      lastUpdated: dashboard.lastUpdated,
      overallStatus: dashboard.summary.overallStatus,
      currentSemester: dashboard.studentInfo.currentSemester,
      currentPeriod: period,
    };
  } catch (error) {
    console.error("❌ Error fetching header info:", error);
    return {
      name: "ESTUDIANTE",
      lastUpdated: new Date().toLocaleDateString("es-PE"),
      overallStatus: "ÓPTIMO",
      currentSemester: 3,
      currentPeriod: "2025-I",
    };
  }
};

// ========================================
// 📋 FALTAS SIN JUSTIFICAR (🔥 MEJORADO)
// ========================================

/**
 * 📋 Obtiene las faltas sin justificar del estudiante (INCLUYE RECHAZADAS)
 * 🔥 NUEVO: Ahora incluye faltas con justificaciones RECHAZADAS
 */
export const getUnjustifiedAbsences = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    console.log(`📋 Fetching unjustified absences for student ${studentId}, period ${period}`);

    // 🔥 1. Obtener faltas sin justificar
    const unjustifiedResponse = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/unjustified-absences`,
      { params: { period } }
    );

    console.log("✅ Unjustified absences:", unjustifiedResponse.data);

    if (!Array.isArray(unjustifiedResponse.data)) {
      console.warn("⚠️ Response is not an array:", unjustifiedResponse.data);
      return [];
    }

    // 🔥 2. Obtener justificaciones rechazadas
    let rejectedJustifications = [];
    try {
      console.log("🔍 Fetching rejected justifications...");
      const justificationsResponse = await INASISTENCIAS_API.get(
        `/api/v1/justifications`,
        { params: { studentId, status: 'rejected' } }
      );
      
      console.log("📋 Rejected justifications response:", justificationsResponse.data);
      
      rejectedJustifications = justificationsResponse.data
        .filter(just => just.attendanceStatus === 'A') // Solo faltas
        .map(just => ({
          attendanceId: just.attendanceId,
          courseName: just.courseName,
          courseCode: just.courseCode,
          classDate: just.classDate,
          classTime: just.classTime,
          label: `${just.courseName} - ${just.classDate}`,
          isRejected: true // 🔥 Marcar como rechazada
        }));
      
      console.log(`✅ Found ${rejectedJustifications.length} rejected justifications that can be resent`);
    } catch (error) {
      console.warn('⚠️ Error fetching rejected justifications:', error);
      // No hacer throw, continuar con faltas sin justificar
    }

    // 🔥 3. Combinar ambas listas
    const unjustifiedMapped = unjustifiedResponse.data.map(absence => ({
      attendanceId: absence.attendanceId,
      courseName: absence.courseName,
      courseCode: absence.courseCode,
      classDate: absence.classDate,
      classTime: absence.classTime,
      label: `${absence.courseName} - ${absence.classDate}`,
      isRejected: false
    }));

    const allAbsences = [...unjustifiedMapped, ...rejectedJustifications];

    // 🔥 4. Eliminar duplicados (si una falta aparece en ambas listas)
    const uniqueAbsences = Array.from(
      new Map(allAbsences.map(item => [item.attendanceId, item])).values()
    );

    console.log(`✅ Total absences available for justification: ${uniqueAbsences.length}`);
    console.log(`   - Unjustified: ${unjustifiedMapped.length}`);
    console.log(`   - Rejected: ${rejectedJustifications.length}`);

    return uniqueAbsences;

  } catch (error) {
    console.error("❌ Error fetching unjustified absences:", error);

    if (error.response?.status === 404) {
      console.warn("⚠️ Endpoint not found or student has no unjustified absences");
      return [];
    }

    console.error("⚠️ Returning empty array due to error");
    return [];
  }
};

/**
 * 🔥 NUEVO: Obtiene faltas sin justificar filtradas por sprint
 */
export const getUnjustifiedAbsencesBySprint = async (
  studentId = getCurrentStudentId(),
  sprintNumber,
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    console.log(`📋 Fetching unjustified absences for sprint ${sprintNumber}`);
    console.log(`   Student ID: ${studentId}`);
    console.log(`   Period: ${period}`);
    console.log(`   Sprint: ${sprintNumber}`);

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/unjustified-absences-by-sprint`,
      {
        params: {
          period,
          sprint: sprintNumber,
        },
      }
    );

    if (!Array.isArray(response.data)) {
      console.warn("⚠️ Response is not an array:", response.data);
      return [];
    }

    console.log(
      `✅ Found ${response.data.length} unjustified absences for sprint ${sprintNumber}:`
    );
    response.data.forEach((absence, index) => {
      console.log(
        `   ${index + 1}. ${absence.courseCode} - ${absence.courseName} - ${absence.classDate} (ID: ${absence.attendanceId})`
      );
    });

    return response.data.map((absence) => ({
      attendanceId: absence.attendanceId,
      courseId: absence.courseId,
      courseName: absence.courseName,
      courseCode: absence.courseCode,
      classDate: absence.classDate,
      classTime: absence.classTime,
      label: absence.label,
      sprintNumber: absence.sprintNumber,
    }));
  } catch (error) {
    console.error(
      `❌ Error fetching unjustified absences for sprint ${sprintNumber}:`,
      error
    );

    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }

    if (error.response?.status === 404) {
      console.warn(
        `⚠️ No unjustified absences found for sprint ${sprintNumber}`
      );
      return [];
    }

    if (error.response?.status === 400) {
      console.error("⚠️ Invalid sprint parameter:", error.response.data);
      return [];
    }

    return [];
  }
};

// ========================================
// 🔥 SISTEMA DE SPRINTS
// ========================================

/**
 * 📅 Obtiene la configuración de sprints según el semestre del estudiante
 */
export const getSprintsConfig = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/sprints-config`,
      { params: { period } }
    );

    console.log("✅ Sprints config:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching sprints config:", error);
    throw error;
  }
};

/**
 * 📊 Obtiene las asistencias filtradas por sprint
 */
export const fetchAttendancesBySprint = async (
  studentId = getCurrentStudentId(),
  sprintNumber,
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    console.log(
      `📊 Fetching attendances for Sprint ${sprintNumber}, period ${period}`
    );

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/attendances-by-sprint`,
      {
        params: {
          sprint: sprintNumber,
          period: period,
        },
      }
    );

    console.log(`✅ Attendances for Sprint ${sprintNumber}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error fetching sprint ${sprintNumber} attendances:`,
      error
    );
    throw error;
  }
};

/**
 * 📈 Obtiene el resumen de un sprint específico
 */
export const getSprintSummary = async (
  studentId = getCurrentStudentId(),
  sprintNumber,
  period = null
) => {
  try {
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const records = await fetchAttendancesBySprint(
      studentId,
      sprintNumber,
      period
    );

    if (records.length === 0) {
      return {
        enrolledCourses: 0,
        scheduledClasses: 0,
        generalAttendance: "0.00",
      };
    }

    const totalClasses = records.reduce((sum, course) => sum + course.plan, 0);
    const totalEffectiveAttendance = records.reduce(
      (sum, course) => sum + course.asistencias,
      0
    );

    const generalAttendance =
      totalClasses > 0
        ? ((totalEffectiveAttendance / totalClasses) * 100).toFixed(2)
        : "0.00";

    return {
      enrolledCourses: records.length,
      scheduledClasses: totalClasses,
      generalAttendance: generalAttendance,
    };
  } catch (error) {
    console.error("❌ Error calculating sprint summary:", error);
    return {
      enrolledCourses: 0,
      scheduledClasses: 0,
      generalAttendance: "0.00",
    };
  }
};

// ========================================
// 🔧 CONFIGURACIÓN Y UTILIDADES
// ========================================

export const config = {
  API_BASE_URL,
  get STUDENT_ID() { return getCurrentStudentId() },
  DEFAULT_PERIOD: null,
  SPRINT_SYSTEM: true,
  getSemesterType: (semester) => (semester % 2 !== 0 ? "impar" : "par"),
  getSprintsForSemester: (semester) => {
    const isOdd = semester % 2 !== 0;
    return isOdd ? [1, 2, 3, 4] : [5, 6, 7, 8, 9];
  },
};

// ========================================
// 📦 EXPORT DEFAULT
// ========================================

export default {
  getAcademicConfig,
  getStudentDashboard,
  getUnjustifiedAbsences,
  getUnjustifiedAbsencesBySprint,
  getAttendanceHistory,
  getStudentCourses,
  getStudentHeaderInfo,
  getSprintsConfig,
  fetchAttendancesBySprint,
  getSprintSummary,
  config
};