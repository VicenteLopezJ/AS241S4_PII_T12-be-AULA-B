import { INASISTENCIAS_API } from "../../../api";

const API_PREFIX = '/api/v1';

const CourseService = {
    getCoursesBySemester: async (semesterId) => {
        try {
            const response = await INASISTENCIAS_API.get(`${API_PREFIX}/courses`, {
                params: { semesterId },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener cursos por semestre:", error);
            throw error;
        }
    },

    getAllCourses: async () => {
        try {
            const response = await INASISTENCIAS_API.get(`${API_PREFIX}/courses`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener todos los cursos:", error);
            throw error;
        }
    },

    getAllSemesters: () => {
        return [
            { id: 1, name: "1er Semestre" },
            { id: 2, name: "2do Semestre" },
            { id: 3, name: "3er Semestre" },
            { id: 4, name: "4to Semestre" },
            { id: 5, name: "5to Semestre" },
            { id: 6, name: "6to Semestre" },
        ];
    },

    getAttendancesByCourse: async (courseId) => {
        try {
            const response = await INASISTENCIAS_API.get(`${API_PREFIX}/attendances/`, {
                params: { courseId },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener asistencias por curso:", error);
            throw error;
        }
    },

    getAttendancesByStatus: async (status) => {
        try {
            const response = await INASISTENCIAS_API.get(`${API_PREFIX}/attendances/`, {
                params: { status },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener asistencias por estado:", error);
            throw error;
        }
    },
};

export default CourseService;