import {HACKATHON_API} from '../api'; 

const extractData = (response) => response.data;

export const getCriteria = async () => {
    try {
        const response = await HACKATHON_API.get('/criterion'); 
        return extractData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error desconocido al obtener criterios.');
    }
};