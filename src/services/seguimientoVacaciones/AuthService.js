import api from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const PERMISSIONS_KEY = 'user_permissions';

export const authService = {
  /**
   * Login - Autentica al usuario
   */
  async login(username, password, role) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        role
      });

      if (response.data.success) {
        const { token, user, permissions } = response.data.data;
        
        // Mapeo de roles válidos con sus variantes (todas en minúsculas)
        const roleMappings = {
          'administrador': ['admin', 'administrador'],
          'jefe': ['jefe', 'jefe de area', 'jefe de área'],
          'empleado': ['empleado', 'empleado comun', 'empleado común', 'colaborador']
        };

        // Normalizar el rol del usuario y el rol seleccionado
        const userRole = user.user_type?.toLowerCase().trim();
        const selectedRoleLower = role?.toLowerCase().trim();

        // DEBUG: Ver qué roles estamos comparando
        console.log('  DEBUG LOGIN:');
        console.log('- Rol del usuario (BD):', user.user_type);
        console.log('- Rol normalizado:', userRole);
        console.log('- Rol seleccionado:', role);
        console.log('- Rol seleccionado normalizado:', selectedRoleLower);
        console.log('- Usuario completo:', user);

        // Verificar si el rol del usuario coincide con el rol seleccionado
        const isRoleValid = Object.entries(roleMappings).some(([key, aliases]) => {
          const isSelectedRoleValid = aliases.includes(selectedRoleLower);
          const isUserRoleValid = aliases.includes(userRole);
          console.log(`- Verificando grupo "${key}":`, { isSelectedRoleValid, isUserRoleValid });
          return isSelectedRoleValid && isUserRoleValid;
        });

        console.log('- ¿Rol válido?:', isRoleValid);

        if (!isRoleValid) {
          return {
            success: false,
            code: 'INVALID_ROLE',
            message: `No tienes permiso para acceder como ${role}. Tu rol actual es: ${user.user_type}`
          };
        }
        
        // Guardar en localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
        
        // Configurar token en headers de axios
        this.setAuthToken(token);
        
        return {
          success: true,
          data: { token, user, permissions }
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en el login'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con el servidor'
      };
    }
  },

  /**
   * Logout - Cierra sesión
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // SOLUTION: Clear ALL localStorage to avoid residual data
      console.log('[AUTH] Clearing localStorage completely...');
      localStorage.clear();
      this.removeAuthToken();
      
      // Also clear sessionStorage
      sessionStorage.clear();
      
      console.log('[AUTH] localStorage cleared successfully');
    }
  },

  /**
   * Verifica si el token es válido
   */
  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      return false;
    }
  },

  /**
   * Obtiene el token almacenado
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Obtiene los datos del usuario
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Obtiene los permisos del usuario
   */
  getPermissions() {
    const permissions = localStorage.getItem(PERMISSIONS_KEY);
    return permissions ? JSON.parse(permissions) : {};
  },

  /**
   * Verifica si está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Configura el token en los headers de axios
   */
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  /**
   * Remueve el token de los headers
   */
  removeAuthToken() {
    delete api.defaults.headers.common['Authorization'];
  },

  /**
   * Inicializa la autenticación (útil al cargar la app)
   */
  initAuth() {
    const token = this.getToken();
    if (token) {
      this.setAuthToken(token);
    }
  }
};