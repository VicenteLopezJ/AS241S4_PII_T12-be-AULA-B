// Configuración de la API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: 'https://as241s4-pii-t10-be.onrender.com',
    timeout: 30000,
  },
  production: {
    baseURL: 'https://as241s4-pii-t10-be.onrender.com',
    timeout: 30000,
  }
};

// Detectar entorno actual
const currentEnv = import.meta.env.MODE || 'development';

export const apiConfig = API_CONFIG[currentEnv];

// Endpoints específicos basados en tu Flask API
export const ENDPOINTS = {
  // Autenticación
  AUTH_LOGIN: '/auth/login',
  AUTH_VERIFY: '/auth/verify',
  AUTH_LOGOUT: '/auth/logout',

  // Empleados
  EMPLOYEES: '/employee/',
  EMPLOYEE_BY_ID: (id) => `/employee/${id}`,
  EMPLOYEE_BY_STATUS: (status) => `/employee/status/${status}`,
  EMPLOYEE_BY_AREA: (areaId) => `/employee/area/${areaId}`,
  EMPLOYEE_SAVE: '/employee/save',
  EMPLOYEE_UPDATE: (id) => `/employee/update/${id}`,
  EMPLOYEE_DELETE: (id) => `/employee/delete/${id}`,
  EMPLOYEE_RESTORE: (id) => `/employee/restore/${id}`,
  EMPLOYEES_ELIGIBLE_FOR_VACATION: '/employee/eligible-for-vacation',

  // Areas
  AREAS: '/area/',
  AREA_BY_ID: (id) => `/area/${id}`,
  AREA_BY_STATUS: (status) => `/area/status/${status}`,
  AREA_SEARCH: (name) => `/area/search/${name}`,
  AREA_SAVE: '/area/save',
  AREA_UPDATE: (id) => `/area/update/${id}`,
  AREA_DELETE: (id) => `/area/delete/${id}`,
  AREA_RESTORE: (id) => `/area/restore/${id}`,
  AREA_STATISTICS: '/area/statistics',

  // Vacation Period (Períodos Vacacionales)
  VACATION_PERIODS: '/vacation-period/',
  VACATION_PERIOD_BY_ID: (id) => `/vacation-period/${id}`,
  VACATION_PERIOD_MY_PERIODS: '/vacation-period/my-periods',
  VACATION_PERIOD_ACTIVE: '/vacation-period/active',
  VACATION_PERIOD_SAVE: '/vacation-period/save',
  VACATION_PERIOD_UPDATE: (id) => `/vacation-period/${id}`,

  // Enployye Period (Períodos de Empleados)
  EMPLOYEE_PERIODS: '/employee-period',
  EMPLOYEE_PERIOD_BY_ID: (id) => `/employee-period/${id}`,
  EMPLOYEE_PERIODS_BY_EMPLOYEE: (employeeId) => `/employee-period/employee/${employeeId}`,
  EMPLOYEE_PERIOD_ACTIVE: (employeeId) => `/employee-period/employee/${employeeId}/active`,
  EMPLOYEE_PERIOD_CREATE_INDIVIDUAL: (employeeId) => `/employee-period/create-individual/${employeeId}`,
  EMPLOYEE_PERIOD_BULK_CREATE: (periodId) => `/employee-period/bulk-create/${periodId}`,
  EMPLOYEE_PERIOD_UPDATE_OBSERVATION: (id) => `/employee-period/${id}/observation`,
  EMPLOYEE_PERIOD_HIDE: (id) => `/employee-period/${id}/hide`,
  EMPLOYEE_PERIOD_RESTORE: (id) => `/employee-period/${id}/restore`,
  MY_VACATION_BALANCE: '/employee-period/my-balance',
  MY_VACATION_HISTORY: '/employee-period/my-history',

  // Vacation Request (Solicitudes de Vacaciones)
  VACATION_REQUESTS: '/vacation-request/',
  VACATION_REQUEST_BY_ID: (id) => `/vacation-request/${id}`,
  VACATION_REQUEST_BY_STATUS: (status) => `/vacation-request/status/${status}`,
  VACATION_REQUEST_BY_AREA: (areaId) => `/vacation-request/by-area/${areaId}`,
  VACATION_REQUEST_CREATE: '/vacation-request/save',
  VACATION_REQUEST_UPDATE: (id) => `/vacation-request/update/${id}`,
  VACATION_REQUEST_APPROVE: (id) => `/vacation-request/${id}/approve`,
  VACATION_REQUEST_REJECT: (id) => `/vacation-request/${id}/reject`,
  VACATION_REQUEST_CANCEL: (id) => `/vacation-request/${id}/cancel`,
};

export default apiConfig;