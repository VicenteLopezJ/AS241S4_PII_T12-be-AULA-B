// src/utils/autoLoginBoletaPermiso.js

// Auto-login específico para el módulo Boleta de Permiso de Trabajadores (RRHH)
// Usa el backend de boleta_permiso y las credenciales:
//   correo:    rrhh@instituto.edu
//   password:  Admin2025!
// Guarda:
//   - localStorage.token
//   - localStorage.userInfo (igual que LoginPage de boleta_permiso)

export const autoLoginToBoletaPermiso = async () => {
  try {
    console.log('🔄 Iniciando auto-login al módulo Boleta Permiso (RRHH)...');

    // 1. Limpiar cualquier sesión previa de RRHH
    console.log('🧹 Limpiando sesión RRHH previa (token, userInfo)...');
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');

    // 2. Obtener URL base del backend RRHH desde el config del módulo
    let API_URL = 'https://as241s4-pii-t16-be-2.onrender.com/';
    try {
      const module = await import('../services/boleta_permiso/config.js');
      API_URL = (module.API_URL || module.default || API_URL);
    } catch (e) {
      console.warn('⚠️ No se pudo cargar config de boleta_permiso, usando URL por defecto:', e);
    }

    const baseUrl = API_URL.replace(/\/$/, '');

    console.log('📡 Conectando a:', `${baseUrl}/empleados/login`);

    // 3. Login con credenciales fijas de RRHH
    const loginResp = await fetch(`${baseUrl}/empleados/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'rrhh@instituto.edu',
        password: 'Admin2025!'
      })
    });

    console.log('📥 Respuesta login RRHH, status:', loginResp.status);

    const loginJson = await loginResp.json().catch(() => null);

    if (!loginResp.ok || !loginJson || loginJson.success === false) {
      console.error('❌ Error en login RRHH:', loginJson);
      throw new Error(loginJson?.message || `Error en login RRHH: ${loginResp.status}`);
    }

    const data = loginJson.data || loginJson;
    console.log('👤 Datos completos de login RRHH:', JSON.stringify(data, null, 2));

    // Token emitido por el backend RRHH (soportar varias estructuras posibles)
    const token =
      data.token ||
      (data.data && data.data.token) ||
      data.access_token ||
      data.accessToken ||
      null;
    console.log('🔑 Token RRHH encontrado:', token ? '✅ SÍ' : '❌ NO');

    if (!token) {
      console.error('❌ NO SE ENCONTRÓ TOKEN EN LOGIN RRHH');
      return false;
    }

    // Guardar token para los servicios de boleta_permiso
    localStorage.setItem('token', token);

    // 4. Obtener permisos / info del usuario actual
    console.log('📡 Obteniendo permisos del usuario RRHH en', `${baseUrl}/empleados/me/permisos`);
    const meResp = await fetch(`${baseUrl}/empleados/me/permisos`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const meJson = await meResp.json().catch(() => null);
    console.log('📦 Datos de permisos RRHH:', JSON.stringify(meJson, null, 2));

    if (!meResp.ok || !meJson || meJson.success === false) {
      console.error('❌ Error al obtener permisos RRHH:', meJson);
      // aun así dejamos el token válido guardado
    }

    const me = meJson?.data || meJson || {};

    // 5. Construir userInfo combinado (login + permisos), igual que hace LoginPage
    const baseUser = data.usuario || data;

    const userInfo = {
      ...baseUser,
      ...me,
    };

    console.log('💾 Guardando sesión RRHH en localStorage.userInfo:', JSON.stringify(userInfo, null, 2));
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // 6. Verificar que todo se guardó
    const savedToken = localStorage.getItem('token');
    const savedUserInfo = localStorage.getItem('userInfo');

    console.log('🔍 Verificación de guardado RRHH:');
    console.log('   - Token guardado:', savedToken ? '✅ SÍ' : '❌ NO');
    console.log('   - userInfo guardado:', savedUserInfo ? '✅ SÍ' : '❌ NO');

    if (!savedToken || !savedUserInfo) {
      console.error('❌ ERROR: No se guardaron token o userInfo para RRHH');
      return false;
    }

    console.log('✅ Auto-login RRHH (boleta_permiso) exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error en auto-login RRHH boleta_permiso:', error);
    console.error('   Stack:', error.stack);
    return false;
  }
};
