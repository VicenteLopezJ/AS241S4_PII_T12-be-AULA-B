// src/utils/autoLoginVacaciones.js

// Auto-login específico para el módulo Seguimiento de Vacaciones
// Usa el backend de vacaciones y las credenciales fijas proporcionadas.
// Guarda:
//   - localStorage.auth_token
//   - localStorage.user_data
//   - localStorage.user_permissions

export const autoLoginVacaciones = async (forceCredentials = null) => {
  try {
    console.log('🔄 Iniciando auto-login al módulo Seguimiento de Vacaciones...');

    // Limpiar sesión previa
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_permissions');

    let baseURL = 'https://as241s4-pii-t10-be.onrender.com';
    try {
      const module = await import('../services/seguimientoVacaciones/config/api.config.js');
      const cfg = module.apiConfig || module.default || {};
      if (cfg.baseURL) {
        baseURL = cfg.baseURL;
      }
    } catch (e) {
      console.warn('⚠️ No se pudo cargar api.config, usando URL por defecto:', e);
    }

    const baseUrl = baseURL.replace(/\/$/, '');

    // ⬇️ USAR CREDENCIALES PERSONALIZADAS O LAS POR DEFECTO
    const credentials = forceCredentials || {
      username: 'Evamanzo2026',
      password: 'MiPasswordTemporal123!',
      role: 'Admin',
    };

    console.log('📡 Conectando a:', `${baseUrl}/auth/login`);
    console.log('👤 Usando usuario:', credentials.username, '- Rol:', credentials.role);

    const loginResp = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    console.log('📥 Respuesta login vacaciones, status:', loginResp.status);

    const loginJson = await loginResp.json().catch(() => null);

    if (!loginResp.ok || !loginJson || loginJson.success === false) {
      console.error('❌ Error en login de vacaciones:', loginJson);
      throw new Error(loginJson?.message || `Error en login vacaciones: ${loginResp.status}`);
    }

    const data = loginJson.data || loginJson;
    const token = data.token || (data.data && data.data.token) || null;
    const user = data.user || (data.data && data.data.user) || null;
    const permissions = data.permissions || (data.data && data.data.permissions) || {};

    console.log('🔑 Token vacaciones encontrado:', token ? '✅ SÍ' : '❌ NO');

    if (!token || !user) {
      console.error('❌ NO SE ENCONTRÓ TOKEN O USER EN LOGIN VACACIONES');
      return false;
    }

    // Guardar sesión
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('user_permissions', JSON.stringify(permissions || {}));

    console.log('✅ Auto-login Seguimiento de Vacaciones exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error en auto-login Seguimiento de Vacaciones:', error);
    return false;
  }
};
