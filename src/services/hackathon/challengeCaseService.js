import {HACKATHON_API} from '../api';

const extractData = (response) => response.data;

export const getChallengeCases = async () => {
    try {
        const response = await HACKATHON_API.get('/challengeCase');
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener los casos.');
    }
};

export const getChallengeCaseById = async (caseId) => {
    try {
        const response = await HACKATHON_API.get(`/challengeCase/${caseId}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al obtener el caso con ID ${caseId}.`);
    }
};

export const createChallengeCase = async (caseData) => {
    try {
        const response = await HACKATHON_API.post('/challengeCase', caseData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error al crear el caso.');
    }
};

export const updateChallengeCase = async (caseId, caseData) => {
    try {
        const response = await HACKATHON_API.put(`/challengeCase/${caseId}`, caseData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al actualizar el caso con ID ${caseId}.`);
    }
};

export const deleteChallengeCase = async (caseId) => {
    try {
        const response = await HACKATHON_API.patch(`/challengeCase/delete/${caseId}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al desactivar el caso con ID ${caseId}.`);
    }
};

export const restoreChallengeCase = async (caseId) => {
    try {
        const response = await HACKATHON_API.patch(`/challengeCase/restore/${caseId}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al activar el caso con ID ${caseId}.`);
    }
};
