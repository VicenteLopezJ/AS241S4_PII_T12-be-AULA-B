// src/services/asistencia/student/cursos/CursosService.js

import { INASISTENCIAS_API } from "../../../api";
import { getCurrentStudentId } from "../studentConfig";
const API_BASE_URL = "/api/v1/students";
// const STUDENT_ID = getCurrentStudentId(); // Removed to avoid static initialization

// 🔥 Función para obtener configuración académica
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

export const getStudentCoursesData = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    console.log(`🔄 Fetching courses dashboard for student ${studentId}...`);

    // 🔥 Obtener período dinámicamente
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/courses-dashboard`,
      {
        params: { period },
      }
    );

    console.log("✅ Courses dashboard data received:", response.data);

    const backendData = response.data;

    // Formatear métricas
    const metricData = {
      "Total Cursos": backendData.metricData.totalCursos,
      "Total Créditos": backendData.metricData.totalCreditos,
      "Asistencia Promedio": backendData.metricData.asistenciaPromedio,
      "Cursos Críticos": backendData.metricData.cursosCriticos,
    };

    // Formatear cursos
    const courses = backendData.courses.map((course) => ({
      id: course.courseId,
      title: course.title,
      codigo: course.codigo,
      docente: course.docente,
      aula: course.aula,
      horario: course.horario,
      creditos: course.creditos,
      asistencia: {
        totalClases: course.asistencia.totalClases,
        asistencias: course.asistencia.asistencias,
        faltas: course.asistencia.faltas,
        tardanzas: course.asistencia.tardanzas,
        justificadas: course.asistencia.justificadas,
        porcentaje: course.asistencia.porcentaje,
      },
      proximaClase: course.proximaClase,
      estado: course.estado,
    }));

    console.log(`📊 Processed ${courses.length} courses`);
    console.log(`📈 Metrics:`, metricData);

    return {
      metricData,
      courses,
      studentInfo: backendData.studentInfo,
      currentPeriod: period, // 🔥 Incluir período
    };
  } catch (error) {
    console.error("❌ Error fetching courses dashboard:", error);

    return {
      metricData: {
        "Total Cursos": 0,
        "Total Créditos": 0,
        "Asistencia Promedio": "0.0%",
        "Cursos Críticos": 0,
      },
      courses: [],
      studentInfo: {
        name: "Estudiante",
        studentCode: "N/A",
        career: "N/A",
        currentSemester: 0,
      },
      error: error.message,
      currentPeriod: "2025-I",
    };
  }
};

/**
 * 📚 Obtiene solo la lista de cursos matriculados (sin estadísticas)
 */
export const getEnrolledCourses = async (
  studentId = getCurrentStudentId(),
  period = null
) => {
  try {
    console.log(`🔄 Fetching enrolled courses for student ${studentId}...`);

    // 🔥 Período dinámico
    if (!period) {
      const config = await getAcademicConfig(studentId);
      period = config.currentPeriod;
    }

    const response = await INASISTENCIAS_API.get(
      `${API_BASE_URL}/${studentId}/enrolled-courses`,
      {
        params: { period },
      }
    );

    console.log("✅ Enrolled courses received:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching enrolled courses:", error);
    return [];
  }
};

/**
 * 📧 Configuración exportada
 */
export const config = {
  API_BASE_URL,
  get STUDENT_ID() { return getCurrentStudentId() },
  DEFAULT_PERIOD: null, // 🔥 null = dinámico
};

// ... resto de funciones helper sin cambios ...

export default {
  getStudentCoursesData,
  getEnrolledCourses,
  getAcademicConfig, // 🔥 Exportar
  config,
};