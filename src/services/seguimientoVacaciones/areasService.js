import api from './api.js';
import { ENDPOINTS } from './config/api.config.js';


export const areasService = {
    // GET all areas
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.AREAS);
            return response.data;
        } catch (error) {
            console.error('Error fetching areas:', error);
            throw error;
        }
    },

    // GET area by ID
    getById: async (id) => {
        try {
            const response = await api.get(ENDPOINTS.AREA_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Error fetching area:', error);
            throw error;
        }
    },

    // GET areas by status
    getByStatus: async (status) => {
        try {
            const response = await api.get(ENDPOINTS.AREA_BY_STATUS(status));
            return response.data;
        } catch (error) {
            console.error('Error fetching areas by status:', error);
            throw error;
        }
    },

    // GET areas by name (search)
    searchByName: async (name) => {
        try {
            const response = await api.get(ENDPOINTS.AREA_SEARCH(name));
            return response.data;
        } catch (error) {
            console.error('Error searching areas:', error);
            throw error;
        }
    },

    // POST create area
    create: async (areaData) => {
        try {
            const response = await api.post(ENDPOINTS.AREA_SAVE, areaData);
            return response.data;
        } catch (error) {
            console.error('Error creating area:', error);
            throw error;
        }
    },

    // PUT update area
    update: async (id, areaData) => {
        try {
            const response = await api.put(ENDPOINTS.AREA_UPDATE(id), areaData);
            return response.data;
        } catch (error) {
            console.error('Error updating area:', error);
            throw error;
        }
    },

    // PATCH delete area logically
    delete: async (id) => {
        try {
            const response = await api.patch(ENDPOINTS.AREA_DELETE(id));
            return response.data;
        } catch (error) {
            console.error('Error deleting area:', error);
            throw error;
        }
    },

    // PATCH restore area
    restore: async (id) => {
        try {
            const response = await api.patch(ENDPOINTS.AREA_RESTORE(id));
            return response.data;
        } catch (error) {
            console.error('Error restoring area:', error);
            throw error;
        }
    },

    // GET statistics
    getStatistics: async () => {
        try {
            const response = await api.get(ENDPOINTS.AREA_STATISTICS);
            return response.data;
        } catch (error) {
            console.error('Error fetching area statistics:', error);
            throw error;
        }
    }
};

// Validaciones para areas
export const areaValidations = {
    validateRequired: (value, fieldName) => {
        if (!value || value.trim() === '') {
            return `${fieldName} es requerido`;
        }
        return null;
    },

    validateMaxLength: (value, maxLength, fieldName) => {
        if (value && value.length > maxLength) {
            return `${fieldName} no puede exceder ${maxLength} caracteres`;
        }
        return null;
    },

    validateArea: (area) => {
        const errors = {};

        // Validar nombre del área (area_name)
        const areaNameError = areaValidations.validateRequired(area.area_name, 'Nombre del área') ||
            areaValidations.validateMaxLength(area.area_name, 60, 'Nombre del área') ||
            areaValidations.validateAreaName(area.area_name);
        if (areaNameError) errors.area_name = areaNameError;

        // Validar descripción (opcional)
        if (area.description) {
            const descriptionError = areaValidations.validateMaxLength(area.description, 70, 'Descripción');
            if (descriptionError) errors.description = descriptionError;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    validateAreaName: (name) => {
        if (!name) return null;

        // Solo letras, números, espacios y algunos caracteres especiales
        const validPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-&]+$/;
        if (!validPattern.test(name)) {
            return 'El nombre del área solo puede contener letras, números, espacios y guiones';
        }

        // No puede empezar o terminar con espacios
        if (name.trim() !== name) {
            return 'El nombre del área no puede empezar o terminar con espacios';
        }

        return null;
    }
};