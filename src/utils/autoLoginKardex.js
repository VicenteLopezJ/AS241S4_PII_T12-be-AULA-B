export const autoLoginToKardex = async () => {
  try {
    console.log('🔄 [Kardex] Iniciando auto-login al módulo Kardex...');

    // 1. Limpiar cualquier sesión previa de Kardex (solo las de kardex)
    console.log('🧹 [Kardex] Limpiando sesión previa...');
    localStorage.removeItem('kardex_token');
    localStorage.removeItem('kardex_user');
    localStorage.removeItem('kardex_usuario'); // Por compatibilidad con tu código

    // 2. Credenciales fijas para el módulo Kardex
    const kardexUser = {
      user_id: 999,
      rol: "admin",
      user_name: "kardex_admin",
      nombre_completo: "Administrador Kardex",
      email: "admin@kardex.com",
      mensaje: "Auto-login para módulo Kardex"
    };

    // 3. Guardar en localStorage específico para Kardex
    const token = 'kardex_admin_token_' + Date.now();
    
    localStorage.setItem('kardex_token', token);
    localStorage.setItem('kardex_user', JSON.stringify(kardexUser));
    
    // También guardar como 'kardex_usuario' para compatibilidad con tu authService
    localStorage.setItem('kardex_usuario', JSON.stringify(kardexUser));

    // 4. Verificar que se guardó todo
    console.log('🔍 [Kardex] Verificación de guardado:');
    console.log('   - Token:', localStorage.getItem('kardex_token') ? '✅' : '❌');
    console.log('   - Usuario:', localStorage.getItem('kardex_user') ? '✅' : '❌');

    console.log('✅ [Kardex] Auto-login exitoso como:', kardexUser.user_name);
    return true;
  } catch (error) {
    console.error('❌ [Kardex] Error en auto-login:', error);
    return false;
  }
};

// Función para verificar si está autenticado en Kardex
export const isKardexAuthenticated = () => {
  const token = localStorage.getItem('kardex_token');
  const user = localStorage.getItem('kardex_user') || localStorage.getItem('kardex_usuario');
  return !!token && !!user;
};

// Función para obtener el usuario actual de Kardex
export const getKardexCurrentUser = () => {
  const userStr = localStorage.getItem('kardex_user') || localStorage.getItem('kardex_usuario');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Función para cerrar sesión de Kardex (solo kardex, no afecta otros módulos)
export const logoutKardex = () => {
  localStorage.removeItem('kardex_token');
  localStorage.removeItem('kardex_user');
  localStorage.removeItem('kardex_usuario');
  console.log('🚪 [Kardex] Sesión cerrada');
};