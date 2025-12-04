import {HACKATHON_API} from '../api'; 


const extractData = (response) => response.data;

export const getGroups = async () => {
    try {
        const response = await HACKATHON_API.get('/groups');
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error desconocido al obtener grupos.');
    }
};

export const getGroupById = async (groupId) => {
    try {
        const response = await HACKATHON_API.get(`/groups/${groupId}`);
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al obtener el grupo con ID ${groupId}.`);
    }
};

export const createGroup = async (groupData) => {
    try {
        const response = await HACKATHON_API.post('/groups', groupData);
        return extractData(response); 
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear el grupo.');
    }
};

export const updateGroup = async (groupId, groupData) => {
    try {
        const response = await HACKATHON_API.put(`/groups/${groupId}`, groupData);
        return extractData(response); 
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al actualizar el grupo con ID ${groupId}.`);
    }
};

export const deleteGroup = async (groupId) => {
    try {
        const response = await HACKATHON_API.patch(`/groups/delete/${groupId}`);
        return extractData(response); 
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al desactivar el grupo con ID ${groupId}.`);
    }
};

export const restoreGroup = async (groupId) => {
    try {
        const response = await HACKATHON_API.patch(`/groups/restore/${groupId}`);
        return extractData(response); 
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error al activar el grupo con ID ${groupId}.`);
    }
};

export const createGroupWithStudents = async (data) => {
    try {
        // Endpoint: POST /groups
        const response = await HACKATHON_API.post('/groupsWithStudents', data);
        return extractData(response);
    } catch (error) {
        // Capturamos el mensaje de error personalizado del backend (ValueError, etc.)
        const message = error.response?.data?.message || 'Error desconocido al crear el grupo.';
        throw new Error(message);
    }
};

/**
 * Actualiza un grupo existente, incluyendo renombrar, cambiar semestre,
 * y gestionar la adición/remoción de estudiantes.
 * @param {number} groupId - ID del grupo a actualizar.
 * @param {object} data - Contiene campos opcionales (name, semester, maxStudents, addStudentData, removeStudentEmails).
 * @returns {Promise<object>} El grupo actualizado.
 */
export const updateGroupWithStudents = async (groupId, data) => {
    try {
        // Endpoint: PUT /groups/{groupId}
        const response = await HACKATHON_API.put(`/groupsWithStudents/${groupId}`, data);
        return extractData(response);
    } catch (error) {
        // Capturamos el mensaje de error personalizado del backend
        const message = error.response?.data?.message || `Error desconocido al actualizar el grupo con ID ${groupId}.`;
        throw new Error(message);
    }
};