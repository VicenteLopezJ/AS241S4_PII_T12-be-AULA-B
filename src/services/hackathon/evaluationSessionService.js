import {HACKATHON_API} from '../api';

const extractData = (response) => response.data;

export const getEvaluationSessions = async () => {
    try {
        const response = await HACKATHON_API.get('/evaluationSessions');
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener las sesiones.');
    }
};


export const getEvaluationSessionById = async (idSession) => {
    try {
        const response = await HACKATHON_API.get(`/evaluationSessions/${idSession}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al obtener la sesión con ID ${idSession}.`);
    }
};


export const createEvaluationSession = async (sessionData) => {
    try {
        const response = await HACKATHON_API.post('/evaluationSessions', sessionData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear la sesión.');
    }
};

export const updateEvaluationSession = async (idSession, sessionData) => {
    try {
        const response = await HACKATHON_API.put(`/evaluationSessions/${idSession}`, sessionData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al actualizar la sesión con ID ${idSession}.`);
    }
};

export const deleteEvaluationSession = async (idSession) => {
    try {
        const response = await HACKATHON_API.patch(`/evaluationSessions/delete/${idSession}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al desactivar la sesión con ID ${idSession}.`);
    }
};

export const restoreEvaluationSession = async (idSession) => {
    try {
        const response = await HACKATHON_API.patch(`/evaluationSessions/restore/${idSession}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al activar la sesión con ID ${idSession}.`);
    }
};
