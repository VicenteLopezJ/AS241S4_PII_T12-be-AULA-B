// src/components/intranet/AdminModules.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { autoLoginToAssistance } from '../../utils/autoLoginHelper';

const adminModules = [
  {
    icon: '🧪',
    title: 'Recepción de Muestras en Laboratorio',
    desc: 'Control de ingreso y procesamiento de muestras',
    url: '/modules/1',
  },
  {
    icon: '💼',
    title: 'Planilla de Viáticos y Movilidad',
    desc: 'Gestión de gastos de viaje y movilidad del personal',
    url: '/vt/login',
  },
  {
    icon: '🛠️',
    title: 'Sistematización del Hackathon',
    desc: 'Organización y seguimiento de eventos hackathon',
    url: '/hackathon/login',
    external: true,
  },
  {
    icon: '✈️',
    title: 'Seguimiento de Vacaciones',
    desc: 'Gestión de períodos vacacionales del personal',
    url: '/modules/4',
  },
  {
    icon: '📋',
    title: 'Justificación de Asistencias',
    desc: 'Registro y justificación de asistencias del personal',
    // ✅ ACTUALIZADA LA RUTA CON EL PREFIJO /asistencia
    url: '/asistencia/admin/initial',
    requiresAutoLogin: true,
  },
  {
    icon: '💊',
    title: 'Kárdex de Medicamentos de Tópico',
    desc: 'Inventario y control de medicamentos',
    url: '/modules/6',
  },
  {
    icon: '📝',
    title: 'Declaración Jurada',
    desc: 'Registro y seguimiento de declaraciones juradas',
    url: '/modules/7',
  },
  {
    icon: '🔔',
    title: 'Boleta de Permiso de Trabajadores',
    desc: 'Solicitudes y aprobación de permisos laborales',
    url: '/modules/8',
  },
  {
    icon: '🏦',
    title: 'Entrega de Fondos a Rendir',
    desc: 'Control de fondos entregados y rendiciones',
    url: '/modules/9',
  },
  {
    icon: '🧾',
    title: 'Vale Provisional',
    desc: 'Emisión y control de vales provisionales',
    url: '/modules/10',
  },
];

const AdminModules = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const generarReporte = () => {
    console.log('Generando PDF...');
  };

  const handleModuleClick = async (mod) => {
    console.log('🎯 BOTÓN PRESIONADO:', mod.title);
    console.log('📌 requiresAutoLogin:', mod.requiresAutoLogin);
    
    if (mod.requiresAutoLogin) {
      setIsLoading(true);
      setLoadingMessage('Conectando con el módulo de asistencias...');
      
      console.log('🔄 Iniciando proceso de auto-login...');
      
      try {
        // Paso 1: Ejecutar auto-login
        setLoadingMessage('Autenticando...');
        console.log('📡 Llamando a autoLoginToAssistance()...');
        
        const success = await autoLoginToAssistance();
        
        console.log('📊 Resultado del auto-login:', success);
        
        if (!success) {
          console.log('❌ Auto-login falló');
          alert('Error al iniciar sesión automáticamente. Por favor, intenta de nuevo.');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Auto-login completado exitosamente');
        
        // Paso 2: Esperar 1 segundo
        setLoadingMessage('Preparando acceso...');
        console.log('⏳ Esperando 1 segundo...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Paso 3: Verificar
        const token = localStorage.getItem('assistanceToken');
        const user = localStorage.getItem('assistanceUser');
        
        console.log('🔍 Verificación final:');
        console.log('   - Token:', token ? '✅ EXISTE' : '❌ NO EXISTE');
        console.log('   - Usuario:', user ? '✅ EXISTE' : '❌ NO EXISTE');
        
        if (!token || !user) {
          console.error('❌ ERROR: Datos no encontrados');
          alert('Error: No se pudo guardar la sesión. Intenta de nuevo.');
          setIsLoading(false);
          return;
        }
        
        // Paso 4: Redirigir con la nueva URL
        setLoadingMessage('Redirigiendo...');
        console.log('🚀 Redirigiendo a', mod.url);
        
        setTimeout(() => {
          window.location.href = mod.url;
        }, 500);
        
      } catch (error) {
        console.error('❌ Error en el proceso:', error);
        console.error('Stack:', error.stack);
        alert('Error al conectar: ' + error.message);
        setIsLoading(false);
      }
    } else {
      console.log('➡️ Módulo normal, abriendo:', mod.url);
      if (mod.external) {
        window.open(mod.url, '_blank');
      } else {
        window.location.href = mod.url;
      }
    }
  };

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, padding: '0 32px'}}>
        <h2 style={{color: '#fff', fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px'}}>Módulos Administrativos</h2>
        <button onClick={generarReporte} style={{background:'#0ea5e9', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem', boxShadow:'0 2px 8px #0002'}}>Descargar PDF</button>
      </div>
      
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '6px solid #444',
            borderTop: '6px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#fff', marginTop: '24px', fontSize: '1.3rem', fontWeight: 'bold' }}>
            {loadingMessage}
          </p>
          <p style={{ color: '#b3b8c5', marginTop: '8px', fontSize: '0.9rem' }}>
            Por favor espera...
          </p>
        </div>
      )}
      
      <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '0 32px'}}>
        {adminModules.map((mod, idx) => (
          <div key={idx} style={{background: '#1A212D', borderRadius: '16px', boxShadow: '0 2px 8px #0002', padding: '24px', minWidth: '320px', maxWidth: '340px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <span role="img" aria-label={mod.title} style={{fontSize: '2.5rem', marginBottom: '12px'}}>{mod.icon}</span>
            <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px'}}>{mod.title}</h3>
            <p style={{color: '#b3b8c5', marginBottom: '16px'}}>{mod.desc}</p>
            <button
              style={{background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', opacity: isLoading ? 0.5 : 1}}
              onClick={() => handleModuleClick(mod)}
              disabled={isLoading}
            >
              {mod.requiresAutoLogin && isLoading ? 'Conectando...' : 'Abrir'}
            </button>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AdminModules;