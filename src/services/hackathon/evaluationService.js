import {HACKATHON_API} from '../api'; 



const extractData = (response) => response.data;


const handleError = (error, defaultMessage) => {
    
    const errorMessage = error.response?.data?.message || defaultMessage;
    const validationErrors = error.response?.data?.errors; 
    const customError = new Error(errorMessage);
    if (validationErrors) {
        customError.errors = validationErrors; 
    }
    throw customError;
};


export const getEvaluations = async () => {
    try {
        const response = await HACKATHON_API.get('/evaluation');
        return extractData(response);
    } catch (error) {
        handleError(error, 'Error desconocido al obtener las evaluaciones.');
    }
};

export const getEvaluationById = async (evaluationId) => {
    try {
        const response = await HACKATHON_API.get(`/evaluation/${evaluationId}`);
        return extractData(response);
    } catch (error) {
        
        
        handleError(error, 'Error desconocido al obtener la evaluación por ID.');
    }
};


export const createEvaluation = async (evaluationData) => {
    try {
        const response = await HACKATHON_API.post('/evaluation', evaluationData);
        return extractData(response);
    } catch (error) {  
        handleError(error, 'Error al intentar crear la evaluación.');
    }
};


export const updateEvaluation = async (evaluationId, updatedData) => {
    try {
        const response = await HACKATHON_API.put(`/evaluation/${evaluationId}`, updatedData);
        return extractData(response);
    } catch (error) {
        
        
        
        handleError(error, 'Error al intentar actualizar la evaluación.');
    }
};


export const setupEvaluationEnvironment = async (setupData) => {
    try {
        const response = await HACKATHON_API.post('/evaluation/setup', setupData);
        return extractData(response);
    } catch (error) {
        handleError(error, 'Error al intentar crear el entorno de evaluación.');
    }
};



export const deleteEvaluation = async (evaluationId) => {
  try {
    const response = await HACKATHON_API.patch(`/evaluation/delete/${evaluationId}`);
    return response.data; 
  } catch (error) {
    console.error(`Error al desactivar usuario con ID ${evaluationId}:`, error);
    throw error;
  }
};


export const restoreEvaluation = async (evaluationId) => {
  try {
    const response = await HACKATHON_API.patch(`/evaluation/restore/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al activar usuario con ID ${evaluationId}:`, error);
    throw error;
  }
};