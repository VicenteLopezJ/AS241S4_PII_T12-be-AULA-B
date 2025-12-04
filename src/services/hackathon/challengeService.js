import {HACKATHON_API} from '../api';

const extractData = (response) => response.data;

export const getChallenges = async () => {
    try {
        const response = await HACKATHON_API.get('/challenge');
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener los retos.');
    }
};

export const getChallengeById = async (idChallenge) => {
    try {
        const response = await HACKATHON_API.get(`/challenge/${idChallenge}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al obtener el reto con ID ${idChallenge}.`);
    }
};

export const createChallenge = async (challengeData) => {
    try {
        const response = await HACKATHON_API.post('/challenge', challengeData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear el reto.');
    }
};

export const updateChallenge = async (idChallenge, challengeData) => {
    try {
        const response = await HACKATHON_API.put(`/challenge/${idChallenge}`, challengeData);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al actualizar el reto con ID ${idChallenge}.`);
    }
};

export const deleteChallenge = async (idChallenge) => {
    try {
        const response = await HACKATHON_API.patch(`/challenge/delete/${idChallenge}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al desactivar el reto con ID ${idChallenge}.`);
    }
};

export const restoreChallenge = async (idChallenge) => {
    try {
        const response = await HACKATHON_API.patch(`/challenge/restore/${idChallenge}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al activar el reto con ID ${idChallenge}.`);
    }
};
