

import { HACKATHON_API } from '../api'; 

const extractData = (response) => response.data;

const handleOAuthRedirection = (error) => {
    const response = error.response;
    
    if (response && response.status === 401) {
        const data = response.data;
        
        if (data && data.error === "AUTH_REQUIRED" && data.redirect_url) {
            console.warn("Autenticación de Google Drive requerida. Forzando redirección de la ventana principal.");
            
            
            
            window.top.location.href = data.redirect_url;

            
            
            return true; 
        }
    }
    return false; 
};


export const listDriveDocuments = async (folderId) => {
    if (!folderId) {
        throw new Error('El ID de la carpeta es requerido para listar documentos.');
    }
    try {
        const response = await HACKATHON_API.get(`/drive/list/${folderId}`);
        
        return extractData(response); 
    } catch (error) {
        
        
        if (handleOAuthRedirection(error)) {
             
             
             throw new Error("Redirección a OAuth en curso. La ventana se moverá."); 
        }

        
        const errorMessage = error.response?.data?.error || `Error al obtener la lista de documentos de Drive con ID ${folderId}.`;
        throw new Error(errorMessage);
    }
};

export const importDriveDocument = async (fileId) => {
    if (!fileId) {
        throw new Error('El ID del archivo es requerido para la importación.');
    }
    try {
        const response = await HACKATHON_API.get(`/drive/import/${fileId}`);
        
        return extractData(response);
    } catch (error) {
        
        if (handleOAuthRedirection(error)) {
             throw new Error("Redirección a OAuth en curso. La ventana se moverá."); 
        }

        
        const errorMessage = error.response?.data?.error || `Error al importar y parsear el documento con ID ${fileId}.`;
        throw new Error(errorMessage);
    }
};