// src/services/asistencia/admin/studentAdmin/studentService.js
import { INASISTENCIAS_API } from "../../../api";

const BASE_URL = "/api/v1/students";

// 📊 Obtener estadísticas de estudiantes
export const getStudentStats = async () => {
  try {
    const response = await INASISTENCIAS_API.get(`${BASE_URL}`);
    const students = response.data;

    return {
      total: students.length,
      active: students.filter((s) => s.academicStatus === "active").length,
      inactive: students.filter((s) => s.academicStatus === "inactive").length,
      graduated: students.filter((s) => s.academicStatus === "graduated")
        .length,
      withdrawn: students.filter((s) => s.academicStatus === "withdrawn")
        .length,
    };
  } catch (error) {
    console.error("❌ Error fetching student stats:", error);
    throw error;
  }
};

// 📋 Listar estudiantes con filtros
export const getStudents = async (filters = {}) => {
  try {
    const params = {
      skip: filters.skip || 0,
      limit: filters.limit || 100,
      ...(filters.careerId && { careerId: filters.careerId }),
      ...(filters.semester && { semester: filters.semester }),
      ...(filters.status && { status: filters.status }),
    };

    const response = await INASISTENCIAS_API.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    throw error;
  }
};

// 🔍 Obtener estudiante por ID
export const getStudentById = async (studentId) => {
  try {
    const response = await INASISTENCIAS_API.get(`${BASE_URL}/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching student ${studentId}:`, error);
    throw error;
  }
};

// ➕ Crear nuevo estudiante
export const createStudent = async (studentData) => {
  try {
    const response = await INASISTENCIAS_API.post(BASE_URL, studentData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating student:", error);
    throw error;
  }
};

// ✏️ Actualizar estudiante
export const updateStudent = async (studentId, studentData) => {
  try {
    const response = await INASISTENCIAS_API.put(`${BASE_URL}/${studentId}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating student ${studentId}:`, error);
    throw error;
  }
};

// 🗑️ Eliminación lógica (desactivar)
export const deactivateStudent = async (studentId) => {
  try {
    const response = await INASISTENCIAS_API.patch(`${BASE_URL}/${studentId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deactivating student ${studentId}:`, error);
    throw error;
  }
};

// 🔄 Restaurar estudiante
export const restoreStudent = async (studentId) => {
  try {
    const response = await INASISTENCIAS_API.patch(`${BASE_URL}/${studentId}/restore`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error restoring student ${studentId}:`, error);
    throw error;
  }
};

// 🎓 Obtener carreras (para el dropdown)
export const getCareers = async () => {
  try {
    const response = await INASISTENCIAS_API.get("/api/v1/careers");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching careers:", error);
    throw error;
  }
};

// 📊 Exportar estudiantes a Excel
export const exportStudentsExcel = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.careerId) params.append('careerId', filters.careerId);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.status) params.append('status', filters.status);
    
    const response = await INASISTENCIAS_API.get(
      `${BASE_URL}/export/excel?${params.toString()}`,
      {
        responseType: 'blob',
        timeout: 60000
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Estudiantes_${timestamp}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    throw error;
  }
};

// 📄 Exportar estudiantes a PDF
export const exportStudentsPDF = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.careerId) params.append('careerId', filters.careerId);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.status) params.append('status', filters.status);
    
    const response = await INASISTENCIAS_API.get(
      `${BASE_URL}/export/pdf?${params.toString()}`,
      {
        responseType: 'blob',
        timeout: 60000
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Estudiantes_${timestamp}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error exporting to PDF:', error);
    throw error;
  }
};