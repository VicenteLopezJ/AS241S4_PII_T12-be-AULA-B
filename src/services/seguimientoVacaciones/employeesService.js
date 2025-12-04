import api from './api.js';
import { ENDPOINTS } from './config/api.config.js';


export const employeesService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINTS.EMPLOYEES);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.EMPLOYEE_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  create: async (employeeData) => {
    try {
      const response = await api.post(ENDPOINTS.EMPLOYEE_SAVE, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  update: async (id, employeeData) => {
    try {
      const response = await api.put(ENDPOINTS.EMPLOYEE_UPDATE(id), employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.patch(ENDPOINTS.EMPLOYEE_DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  restore: async (id) => {
    try {
      const response = await api.patch(ENDPOINTS.EMPLOYEE_RESTORE(id));
      return response.data;
    } catch (error) {
      console.error('Error restoring employee:', error);
      throw error;
    }
  },

   getEligibleForVacation: async () => {
    try {
      const response = await api.get(ENDPOINTS.EMPLOYEES_ELIGIBLE_FOR_VACATION);
      return response.data;
    } catch (error) {
      console.error('Error fetching eligible employees:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener empleados elegibles'
      };
    }
  }

};

// Constantes exportadas para uso en componentes
export const DOCUMENT_TYPES = [
  { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
  { value: 'CNE', label: 'CNE - Carné de Extranjería' },
];

export const EMPLOYEE_STATUS = [
  { value: 'A', label: 'Activo' },
  { value: 'I', label: 'Inactivo' }
];