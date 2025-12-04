import { INASISTENCIAS_API as API } from '../../api.js';

const TEACHER_ENDPOINT = '/api/v1/teachers';

export const getTeachers = async (params = {}) => {
    try {
        const response = await API.get(TEACHER_ENDPOINT, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getTeacherStatusCounts = async () => {
    try {
        const allTeachers = await getTeachers();

        const total = allTeachers.length;
        const active = allTeachers.filter(t => t.status === 'active').length;
        const inactive = allTeachers.filter(t => t.status === 'inactive').length;

        return { total, active, inactive };
    } catch (error) {
        console.error("Error en getTeacherStatusCounts:", error);
        return { total: 0, active: 0, inactive: 0 };
    }
};

export const getActiveTeachersList = async () => {
    const params = { status: 'active' };
    return await getTeachers(params);
};

export const getTeacherById = async (teacherId) => {
    try {
        const response = await API.get(`${TEACHER_ENDPOINT}/${teacherId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createTeacher = async (teacherData) => {
    try {
        const response = await API.post(`${TEACHER_ENDPOINT}`, teacherData);
        return response.data;
    } catch (error) {
        console.error("Error en createTeacher:", error);
        throw error.response?.data || error;
    }
};

export const updateTeacher = async (teacherId, updateData) => {
    try {
        const { teacherId: _, ...allowedData } = updateData;
        const response = await API.put(`${TEACHER_ENDPOINT}/${teacherId}`, allowedData);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar maestro:", error);
        throw error.response?.data || error;
    }
};

export const deactivateTeacher = async (teacherId) => {
    try {
        const response = await API.patch(`${TEACHER_ENDPOINT}/${teacherId}/delete`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const restoreTeacher = async (teacherId) => {
    try {
        const response = await API.patch(`${TEACHER_ENDPOINT}/${teacherId}/restore`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteTeacher = async (teacherId) => {
    try {
        const response = await API.delete(`${TEACHER_ENDPOINT}/${teacherId}`);
        return response.data;
    } catch (error) {
        console.error("Error en deleteTeacher:", error);
        throw error.response?.data || error;
    }
};