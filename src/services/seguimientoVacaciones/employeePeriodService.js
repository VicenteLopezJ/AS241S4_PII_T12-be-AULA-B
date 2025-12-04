import api from "./api";
import { ENDPOINTS } from "./config/api.config";


class EmployeePeriodService {

  /**
   * Obtener todos los registros de employee_period
   * @param {Object} params - Parámetros opcionales
   * @param {boolean} params.includeDeleted - Incluir registros eliminados
   * @param {string} params.status - Filtrar por estado (P/C)
   */
  async getAllEmployeePeriods(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.includeDeleted) {
        queryParams.append('include_deleted', 'true');
      }
      
      if (params.status) {
        queryParams.append('status', params.status);
      }

      const url = queryParams.toString() 
        ? `${ENDPOINTS.EMPLOYEE_PERIODS}?${queryParams.toString()}`
        : ENDPOINTS.EMPLOYEE_PERIODS;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee periods:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener registros'
      };
    }
  }

  /**
   * Obtener un registro completo por ID (header + details)
   */
  async getEmployeePeriodById(employeePeriodId) {
    try {
      const response = await api.get(ENDPOINTS.EMPLOYEE_PERIOD_BY_ID(employeePeriodId));
      return response.data;
    } catch (error) {
      console.error('Error fetching employee period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el registro'
      };
    }
  }

  /**
   * Obtener todos los períodos de un empleado específico
   */
  async getEmployeePeriodsByEmployee(employeeId) {
    try {
      const response = await api.get(ENDPOINTS.EMPLOYEE_PERIODS_BY_EMPLOYEE(employeeId));
      return response.data;
    } catch (error) {
      console.error('Error fetching employee periods:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener períodos del empleado'
      };
    }
  }

  /**
   * Obtener el período activo de un empleado
   */
  async getEmployeeActivePeriod(employeeId) {
    try {
      const response = await api.get(ENDPOINTS.EMPLOYEE_PERIOD_ACTIVE(employeeId));
      return response.data;
    } catch (error) {
      console.error('Error fetching employee active period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el período activo'
      };
    }
  }

  /**
   * Crear período vacacional para UN empleado específico
   */
  async createIndividualEmployeePeriod(employeeId) {
    try {
      const response = await api.post(ENDPOINTS.EMPLOYEE_PERIOD_CREATE_INDIVIDUAL(employeeId));
      return response.data;
    } catch (error) {
      console.error('Error creating employee period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear el período'
      };
    }
  }

  /**
   * Asignar período vacacional a TODOS los empleados elegibles
   */
  async bulkCreateForPeriod(periodId) {
    try {
      const response = await api.post(ENDPOINTS.EMPLOYEE_PERIOD_BULK_CREATE(periodId));
      return response.data;
    } catch (error) {
      console.error('Error in bulk creation:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error en la asignación masiva'
      };
    }
  }

  /**
   * Actualizar observación del registro
   */
  async updateObservation(employeePeriodId, observation) {
    try {
      const response = await api.put(
        ENDPOINTS.EMPLOYEE_PERIOD_UPDATE_OBSERVATION(employeePeriodId),
        { observation }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating observation:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar observación'
      };
    }
  }

  /**
   * Ocultar registro (soft delete)
   */
  async hideEmployeePeriod(employeePeriodId) {
    try {
      const response = await api.patch(ENDPOINTS.EMPLOYEE_PERIOD_HIDE(employeePeriodId));
      return response.data;
    } catch (error) {
      console.error('Error hiding employee period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al ocultar registro'
      };
    }
  }

  /**
   * Restaurar registro oculto
   */
  async restoreEmployeePeriod(employeePeriodId) {
    try {
      const response = await api.patch(ENDPOINTS.EMPLOYEE_PERIOD_RESTORE(employeePeriodId));
      return response.data;
    } catch (error) {
      console.error('Error restoring employee period:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al restaurar registro'
      };
    }
  }

  /**
   * Obtener MI saldo de vacaciones (empleado autenticado)
   */
  async getMyVacationBalance() {
    try {
      const response = await api.get(ENDPOINTS.MY_VACATION_BALANCE);
      return response.data;
    } catch (error) {
      console.error('Error fetching my vacation balance:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener tu saldo de vacaciones'
      };
    }
  }

  /**
   * Obtener MI historial de períodos vacacionales (empleado autenticado)
   */
  async getMyVacationHistory() {
    try {
      const response = await api.get(ENDPOINTS.MY_VACATION_HISTORY);
      return response.data;
    } catch (error) {
      console.error('Error fetching my vacation history:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener tu historial'
      };
    }
  }
}

export default new EmployeePeriodService();