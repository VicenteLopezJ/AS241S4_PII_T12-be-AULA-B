import api from "./api";
import { ENDPOINTS } from "./config/api.config";


class VacationRequestService {

  /**
   * Obtener todas las solicitudes con filtros opcionales
   * @param {string} status - Estado de la solicitud (P, A, R)
   * @param {number} employeeId - ID del empleado
   * @param {number} periodId - ID del período
   */
  async getAllRequests(status = null, employeeId = null, periodId = null) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (employeeId) params.append('employee_id', employeeId);
      if (periodId) params.append('period_id', periodId);

      const url = `${ENDPOINTS.VACATION_REQUESTS}?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching vacation requests:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener solicitudes'
      };
    }
  }

  /**
   * Obtener una solicitud por ID
   */
  async getRequestById(requestId) {
    try {
      const response = await api.get(ENDPOINTS.VACATION_REQUEST_BY_ID(requestId));
      return response.data;
    } catch (error) {
      console.error('Error fetching request:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener la solicitud'
      };
    }
  }

  /**
   * Obtener solicitudes por estado
   * @param {string} status - P (Pendiente), A (Aprobada), R (Rechazada)
   */
  async getRequestsByStatus(status) {
    try {
      const response = await api.get(ENDPOINTS.VACATION_REQUEST_BY_STATUS(status));
      return response.data;
    } catch (error) {
      console.error('Error fetching requests by status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener solicitudes por estado'
      };
    }
  }

  /**
   * Obtener solicitudes por área (para jefes)
   * @param {number} areaId - ID del área
   * @param {string} status - Estado opcional (P, A, R)
   * @param {number} periodId - ID del período opcional
   */
  async getRequestsByArea(areaId, status = null, periodId = null) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (periodId) params.append('period_id', periodId);

      const url = `${ENDPOINTS.VACATION_REQUEST_BY_AREA(areaId)}?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching requests by area:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener solicitudes del área'
      };
    }
  }

  /**
   * Crear una nueva solicitud de vacaciones
   * @param {Object} data - Datos de la solicitud
   * {
   *   employee_id: number,
   *   period_id: number,
   *   observation: string,
   *   date_ranges: [
   *     { start_date: "YYYY-MM-DD", end_date: "YYYY-MM-DD" }
   *   ]
   * }
   */
  async createRequest(data) {
    try {
      const response = await api.post(ENDPOINTS.VACATION_REQUEST_CREATE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating request:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear la solicitud'
      };
    }
  }

  /**
   * Actualizar una solicitud existente (solo si está en estado Pendiente)
   * @param {number} requestId - ID de la solicitud
   * @param {Object} data - Datos a actualizar
   */
  async updateRequest(requestId, data) {
    try {
      const response = await api.put(ENDPOINTS.VACATION_REQUEST_UPDATE(requestId), data);
      return response.data;
    } catch (error) {
      console.error('Error updating request:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar la solicitud'
      };
    }
  }

  /**
 * Aprobar una solicitud
 * @param {number} requestId - ID de la solicitud
 * @param {number} approvedByUserId - ID del usuario que aprueba (users_id)
 */
  async approveRequest(requestId, approvedByUserId) {
    try {
      const response = await api.patch(
        ENDPOINTS.VACATION_REQUEST_APPROVE(requestId),
        { approved_by_user_id: approvedByUserId }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al aprobar la solicitud'
      };
    }
  }

  /**
   * Rechazar una solicitud
   * @param {number} requestId - ID de la solicitud
   * @param {number} rejectedByUserId - ID del usuario que rechaza
   * @param {string} rejectionReason - Motivo del rechazo (opcional)
   */
  async rejectRequest(requestId, rejectedByUserId, rejectionReason = null) {
    try {
      const payload = { rejected_by_user_id: rejectedByUserId };
      if (rejectionReason) payload.rejection_reason = rejectionReason;

      const response = await api.patch(
        ENDPOINTS.VACATION_REQUEST_REJECT(requestId),
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al rechazar la solicitud'
      };
    }
  }

  /**
   * Cancelar una solicitud (solo el empleado dueño puede hacerlo)
   * @param {number} requestId - ID de la solicitud
   * @param {number} employeeId - ID del empleado que cancela
   */
  async cancelRequest(requestId, employeeId) {
    try {
      const response = await api.delete(
        ENDPOINTS.VACATION_REQUEST_CANCEL(requestId),
        { data: { employee_id: employeeId } }
      );
      return response.data;
    } catch (error) {
      console.error('Error canceling request:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cancelar la solicitud'
      };
    }
  }
}

export default new VacationRequestService();
