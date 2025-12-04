import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../../../services/seguimientoVacaciones/AuthService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // SOLUCIÓN: Validar y limpiar datos corruptos antes de cargar
  const initializeState = () => {
    const token = authService.getToken();
    const user = authService.getUser();
    const permissions = authService.getPermissions();

    console.log(' [AuthContext] initializeState:');
    console.log('   - Token:', token ? 'EXISTE' : 'NO EXISTE');
    console.log('   - User:', user ? 'EXISTE' : 'NO EXISTE');
    console.log('   - Permissions:', permissions);

    // Validar consistencia de datos
    if (token && (!user || !permissions || Object.keys(permissions).length === 0)) {
      console.warn('[AUTH] Inconsistent data in localStorage, cleaning...');
      localStorage.clear();
      sessionStorage.clear();
      return { user: null, permissions: {}, isAuthenticated: false };
    }

    return { user, permissions, isAuthenticated: !!token };
  };

  const initialState = initializeState();

  const [user, setUser] = useState(initialState.user);
  const [permissions, setPermissions] = useState(initialState.permissions);
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar autenticación al cargar la app
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('[AuthContext] Inicializando autenticación...');
      
      // Inicializar el token en axios
      authService.initAuth();
      
      const token = authService.getToken();
      const userData = authService.getUser();
      const userPermissions = authService.getPermissions();
      
      console.log('[AuthContext] Datos cargados:');
      console.log('   - Token:', token ? 'EXISTE' : 'NO EXISTE');
      console.log('   - User:', userData);
      console.log('   - Permissions:', userPermissions);
      
      if (token && userData) {
        //  ACTUALIZAR ESTADO INMEDIATAMENTE
        setUser(userData);
        setPermissions(userPermissions || {});
        setIsAuthenticated(true);
        console.log('[AuthContext] Estado actualizado correctamente');
        
        // Verificar validez del token en segundo plano
        const isValid = await authService.verifyToken();
        
        if (!isValid) {
          console.log('[AUTH] Invalid token, cleaning session...');
          await logout();
        } else {
          console.log('[AUTH] Valid token, active session');
        }
      } else {
        console.log('[AUTH] No token found, cleaning state...');
        setUser(null);
        setPermissions({});
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al inicializar autenticación:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  //  NUEVA FUNCIÓN: Recargar datos del localStorage
  const reloadAuth = () => {
    console.log('[AuthContext] Recargando autenticación desde localStorage...');
    const token = authService.getToken();
    const userData = authService.getUser();
    const userPermissions = authService.getPermissions();
    
    console.log('[AuthContext] Datos recargados:');
    console.log('   - Token:', token ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('   - User:', userData);
    console.log('   - Permissions:', userPermissions);
    
    if (token && userData) {
      authService.initAuth(); // Actualizar axios headers
      setUser(userData);
      setPermissions(userPermissions || {});
      setIsAuthenticated(true);
      console.log('[AuthContext] Estado recargado correctamente');
      return true;
    }
    return false;
  };

  const login = async (username, password, role) => {
    try {
      const result = await authService.login(username, password, role);
      
      if (result.success) {
        setUser(result.data.user);
        setPermissions(result.data.permissions);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: result.message || 'Error en las credenciales',
        code: result.code
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: 'Error al conectar con el servidor',
        code: 'SERVER_ERROR'
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPermissions({});
    setIsAuthenticated(false);
  };

  // Función helper para verificar permisos
  const hasPermission = (permissionKey) => {
    const result = permissions[permissionKey] === true;
    console.log(`[AuthContext] hasPermission('${permissionKey}'):`, result);
    return result;
  };

  // Función helper para verificar rol
  const hasRole = (role) => {
    return user?.user_type === role;
  };

  const value = {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    reloadAuth, 
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};