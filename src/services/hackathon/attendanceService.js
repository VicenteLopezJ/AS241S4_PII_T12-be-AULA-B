import {HACKATHON_API} from '../api';

const extractData = (response) => response.data;
const AttendanceBaseUrl = '/attendance';
export const getAttendanceDetails = async () => {
    try {
        const response = await HACKATHON_API.get('/attendanceDetail');
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener registros de asistencia.');
    }
};

export const getAttendanceDetailById = async (attendanceId) => {
    try {
        const response = await HACKATHON_API.get(`/attendanceDetail/${attendanceId}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al obtener el registro con ID ${attendanceId}.`);
    }
};

export const handleAttendance = async (payload, idAttendance = null) => {
    let url = AttendanceBaseUrl; // -> '/attendance'
    let method = 'POST'; 

    if (idAttendance) {
        // Para actualizar o eliminar lógicamente
        url = `${AttendanceBaseUrl}/${idAttendance}`;
        method = 'PUT'; 
    }

    try {
        let response;
        
        if (method === 'POST') {
            // Llama a POST /attendance
            response = await HACKATHON_API.post(url, payload);
        } else {
            // Llama a PUT /attendance/{id}
            response = await HACKATHON_API.put(url, payload);
        }

        return response.data;

    } catch (error) {
        const errorMessage = error.response?.data?.message || `Error al ${idAttendance ? 'actualizar' : 'crear'} la asistencia.`;
        console.error(`Error en handleAttendance (${method}):`, errorMessage, error);
        throw new Error(errorMessage);
    }
};

/**
 * Alias para la Creación de Asistencia (Llama a POST /attendance).
 * Esta es la función que usarás en tu componente React.
 */
export const createAttendance = async (payload) => {
    return handleAttendance(payload, null);
};

export const createAttendanceDetail = async (attendanceData) => {
    try {
        const response = await HACKATHON_API.post('/attendanceDetail', attendanceData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear el registro de asistencia.');
    }
};

export const updateAttendanceDetail = async (attendanceId, attendanceData) => {
    try {
        const response = await HACKATHON_API.put(`/attendanceDetail/${attendanceId}`, attendanceData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al actualizar el registro con ID ${attendanceId}.`);
    }
};
