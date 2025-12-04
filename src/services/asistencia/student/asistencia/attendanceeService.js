import { INASISTENCIAS_API } from "../../../api";
import { getStudents } from '../../admin/studentAdmin/studentService';
import CourseService from '../../student/cursos/CourseService';

class AttendanceService {
  // 📋 Obtener lista de asistencias con filtros
  static async getAttendances(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros según el backend
      if (filters.studentId) params.append('studentId', filters.studentId);
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.status) params.append('status', filters.status);
      if (filters.skip) params.append('skip', filters.skip || 0);
      if (filters.limit) params.append('limit', filters.limit || 100);

      console.log('Buscando asistencias con params:', params.toString());
      const response = await INASISTENCIAS_API.get(`/api/v1/attendances/?${params.toString()}`);
      console.log('Asistencias encontradas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendances:', error);
      return [];
    }
  }

  // 📋 Obtener asistencia por ID
  static async getAttendanceById(attendanceId) {
    try {
      const response = await INASISTENCIAS_API.get(`/api/v1/attendances/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  // ➕ Crear nueva asistencia
  static async createAttendance(attendanceData) {
    try {
      console.log('Creando asistencia:', attendanceData);
      const response = await INASISTENCIAS_API.post('/api/v1/attendances/', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  }

  // ✏️ Actualizar asistencia
  static async updateAttendance(attendanceId, updateData) {
    try {
      console.log('Actualizando asistencia:', attendanceId, updateData);
      const response = await INASISTENCIAS_API.put(`/api/v1/attendances/${attendanceId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  // 🗑️ Desactivar asistencia
  static async deactivateAttendance(attendanceId) {
    try {
      const response = await INASISTENCIAS_API.patch(`/api/v1/attendances/${attendanceId}/delete`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating attendance:', error);
      throw error;
    }
  }

  // 🔄 Restaurar asistencia
  static async restoreAttendance(attendanceId) {
    try {
      const response = await INASISTENCIAS_API.patch(`/api/v1/attendances/${attendanceId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring attendance:', error);
      throw error;
    }
  }

  // 👥 Obtener estudiantes para tomar asistencia
  static async getStudentsForAttendance(courseId, semesterId) {
    try {
      console.log('🔍 Buscando estudiantes para curso:', courseId, 'semestre:', semesterId);

      // Primero obtener enrollments existentes del curso
      let enrollmentsResponse;
      try {
        enrollmentsResponse = await INASISTENCIAS_API.get(`/api/v1/enrollments`, {
          params: {
            courseId: courseId,
            status: 'enrolled',
            limit: 100
          }
        });
        console.log('✅ Enrollments encontrados:', enrollmentsResponse.data?.length || 0);
      } catch (error) {
        console.warn('⚠️ Error obteniendo enrollments:', error.message);
        enrollmentsResponse = { data: [] };
      }

      // Obtener todos los estudiantes del semestre
      const allStudents = await getStudents({
        semester: semesterId,
        status: 'active',
        limit: 100
      });

      console.log('📋 Total estudiantes en semestre', semesterId, ':', allStudents.length);

      if (allStudents.length === 0) {
        console.warn('⚠️ No se encontraron estudiantes para el semestre', semesterId);
        alert(`⚠️ No hay estudiantes en el semestre ${semesterId}.\n\nVerifica que haya estudiantes registrados.`);
        return [];
      }

      // Crear un mapa de enrollments existentes
      const enrollmentMap = new Map();
      if (enrollmentsResponse.data) {
        enrollmentsResponse.data.forEach(enrollment => {
          enrollmentMap.set(enrollment.studentId, enrollment.enrollmentId);
        });
      }

      // Procesar cada estudiante
      const studentsPromises = allStudents.map(async (student) => {
        try {
          let enrollmentId = enrollmentMap.get(student.studentId);

          // Si no tiene enrollment, intentar crearlo
          if (!enrollmentId) {
            console.log(`📝 Creando enrollment para estudiante ${student.studentId} (${student.firstName} ${student.lastName}) en curso ${courseId}`);
            try {
              const createResponse = await INASISTENCIAS_API.post(`/api/v1/enrollments`, {
                studentId: student.studentId,
                courseId: courseId,
                period: '2025-I', // Ajustar según el periodo actual
                status: 'enrolled'
              });
              enrollmentId = createResponse.data.enrollmentId;
              console.log(`✅ Enrollment creado: ${enrollmentId}`);
            } catch (createError) {
              console.error(`❌ Error creando enrollment para estudiante ${student.studentId}:`, createError.response?.data || createError.message);
              // Si falla la creación, intentar buscar si ya existe
              try {
                const searchResponse = await INASISTENCIAS_API.get(`/api/v1/enrollments`, {
                  params: { studentId: student.studentId, courseId: courseId }
                });
                if (searchResponse.data && searchResponse.data.length > 0) {
                  enrollmentId = searchResponse.data[0].enrollmentId;
                  console.log(`✅ Enrollment encontrado en búsqueda: ${enrollmentId}`);
                }
              } catch (searchError) {
                console.error(`❌ Error buscando enrollment:`, searchError.message);
              }
            }
          }

          // Si finalmente no se pudo obtener enrollmentId, retornar null
          if (!enrollmentId) {
            console.warn(`⚠️ No se pudo obtener enrollmentId para estudiante ${student.studentId} (${student.firstName} ${student.lastName})`);
            return null;
          }

          return {
            studentId: student.studentId,
            enrollmentId: enrollmentId,
            studentName: `${student.firstName} ${student.lastName}`,
            courseId: courseId,
            currentSemester: student.currentSemester,
            academicStatus: student.academicStatus || 'active'
          };
        } catch (error) {
          console.error(`❌ Error procesando estudiante ${student.studentId}:`, error.message);
          return null;
        }
      });

      const students = await Promise.all(studentsPromises);
      const validStudents = students.filter(s => s !== null);

      if (validStudents.length === 0) {
        console.error('❌ No se pudo obtener información de ningún estudiante');
        alert('❌ Error al obtener estudiantes.\n\nNo se pudieron crear los enrollments necesarios.\nContacta al administrador del sistema.');
        return [];
      }

      console.log(`✅ ${validStudents.length} estudiantes listos para tomar asistencia`);

      if (validStudents.length < allStudents.length) {
        const failedCount = allStudents.length - validStudents.length;
        console.warn(`⚠️ ${failedCount} estudiantes no pudieron ser procesados`);
      }

      return validStudents;

    } catch (error) {
      console.error('❌ Error crítico fetching students for attendance:', error);
      alert(`❌ Error crítico al obtener estudiantes:\n\n${error.message}`);
      return [];
    }
  }

  // 📚 Obtener cursos por semestre (usando servicio real)
  static async getCoursesBySemester(semesterId) {
    try {
      console.log('Buscando cursos para semestre:', semesterId);
      const courses = await CourseService.getCoursesBySemester(semesterId);
      console.log('Cursos encontrados:', courses.length);
      return courses;
    } catch (error) {
      console.error('Error fetching courses by semester:', error);
      return [];
    }
  }
}

export default AttendanceService;