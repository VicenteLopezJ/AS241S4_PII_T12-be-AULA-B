import api from "./api";
import { ENDPOINTS } from './config/api.config';

class VacationPeriodService {

  /**
   * Obtener todos los períodos vacacionales
   */
  async getAllPeriods() {
    try {
      const response = await api.get(ENDPOINTS.VACATION_PERIODS);
      return response.data;
    } catch (error) {
      console.error('Error fetching periods:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener períodos'
      };
    }
  }

  /**
   * Obtener un período por ID
   */
  async getPeriodById(periodId) {
    try {
      const response = await api.get(ENDPOINTS.VACATION_PERIOD_BY_ID(periodId));
      return response.data;
    } catch (error) {
      console.error('Error fetching period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el período'
      };
    }
  }

  /**
   * Obtener el período activo
   */
  async getActivePeriod() {
    try {
      const response = await api.get(ENDPOINTS.VACATION_PERIOD_ACTIVE);
      return response.data;
    } catch (error) {
      console.error('Error fetching active period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'No hay período activo'
      };
    }
  }

  /**
   * Crear un nuevo período vacacional
   */
  async createPeriod(data) {
    try {
      const response = await api.post(ENDPOINTS.VACATION_PERIOD_SAVE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear el período'
      };
    }
  }

  /**
   * Actualizar un período existente
   */
  async updatePeriod(periodId, data) {
    try {
      const response = await api.put(ENDPOINTS.VACATION_PERIOD_UPDATE(periodId), data);
      return response.data;
    } catch (error) {
      console.error('Error updating period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar el período'
      };
    }
  }

  /**
 * Obtener los períodos asignados al empleado logueado
 */
  async getMyPeriods() {
    try {
      const response = await api.get(ENDPOINTS.VACATION_PERIOD_MY_PERIODS);
      return response.data;
    } catch (error) {
      console.error('Error fetching my periods:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener tus períodos'
      };
    }
  }
}

export default new VacationPeriodService();