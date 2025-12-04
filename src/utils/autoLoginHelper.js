// src/utils/autoLoginHelper.js

export const autoLoginToAssistance = async () => {
  try {
    console.log('🔄 Iniciando auto-login al módulo de asistencias...');
    
    // 1. Limpiar cualquier sesión anterior
    console.log('🧹 Limpiando sesiones anteriores...');
    localStorage.removeItem('assistanceToken');
    localStorage.removeItem('assistanceUser');
    
    // 2. Hacer login automático
    const INASISTENCIAS_API_URL = import.meta.env.VITE_INASISTENCIAS_API_URL || 
                                    'https://as241s4-pii-t12-be-1.onrender.com';
    
    console.log('📡 Conectando a:', `${INASISTENCIAS_API_URL}/api/v1/users/login`);
    
    const response = await fetch(`${INASISTENCIAS_API_URL}/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin2901@vallegrande.edu.pe',
        password: 'admin2901'
      })
    });

    console.log('📥 Respuesta recibida, status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', errorText);
      throw new Error('Error en auto-login: ' + response.status);
    }

    const data = await response.json();
    
    console.log('📦 DATOS COMPLETOS RECIBIDOS:', JSON.stringify(data, null, 2));
    
    // 3. Extraer token y user - AJUSTAR SEGÚN LA ESTRUCTURA REAL
    let token = data.token || data.access_token || data.accessToken;
    let userInfo = data.user || data;
    
    console.log('🔑 Token encontrado:', token ? '✅ SÍ' : '❌ NO');
    console.log('👤 User info:', JSON.stringify(userInfo, null, 2));
    
    if (!token) {
      console.error('❌ NO SE ENCONTRÓ TOKEN EN LA RESPUESTA');
      return false;
    }
    
    // 4. Construir userData con todos los campos posibles
    const userData = {
      userId: userInfo.userId || userInfo.user_id || userInfo.id || 270,
      email: userInfo.email || 'admin2901@vallegrande.edu.pe',
      username: userInfo.username || userInfo.email || 'admin2901@vallegrande.edu.pe',
      role: (userInfo.role || 'admin').toLowerCase(),
      adminId: userInfo.adminId || userInfo.admin_id || 270,
    };
    
    console.log('💾 Guardando en localStorage:');
    console.log('   - Token:', token.substring(0, 30) + '...');
    console.log('   - Usuario:', JSON.stringify(userData, null, 2));
    
    localStorage.setItem('assistanceToken', token);
    localStorage.setItem('assistanceUser', JSON.stringify(userData));

    // 5. Verificar que se guardó
    const savedToken = localStorage.getItem('assistanceToken');
    const savedUser = localStorage.getItem('assistanceUser');
    
    console.log('🔍 Verificación de guardado:');
    console.log('   - Token guardado:', savedToken ? '✅ SÍ' : '❌ NO');
    console.log('   - Usuario guardado:', savedUser ? '✅ SÍ' : '❌ NO');

    if (!savedToken || !savedUser) {
      console.error('❌ ERROR: No se guardaron los datos');
      return false;
    }

    console.log('✅ Auto-login exitoso');
    return true;
    
  } catch (error) {
    console.error('❌ Error en auto-login:', error);
    console.error('   Stack:', error.stack);
    return false;
  }
};