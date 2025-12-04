// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FlaskConical, Briefcase, Hammer, Plane, ClipboardList, Pill, FileText, Bell, Banknote, ReceiptText, ExternalLink, Users, Tag, FileEdit, UserCog, Settings, Home, FolderKanban, UserSquare, Layers, FileSignature, UserCog2, Cog } from 'lucide-react';
import { autoLoginToAssistance } from '../utils/autoLoginHelper';


const adminModules = [
  {
    name: 'Recepción de muestras en Laboratorio',
    icon: FlaskConical,
    // Ahora apunta a una ruta interna que mostrará un layout propio
    path: '/laboratorio/empresas'
  },
  { name: 'Planilla de Viaticos y Movilidad', icon: Briefcase, path: '/vt/dashboard-movil' },
  { name: 'Viáticos y Movilidad', icon: Briefcase, path: '/vt/dashboard-movil' },
  { name: 'Sistematización del Hackathon', icon: Hammer, url: '/hackathon/login', external: true },
  { name: 'Seguimiento de Vacaciones', icon: Plane, path: '/vacaciones/login' },
  { 
    name: 'Justificación de Asistencias', 
    icon: ClipboardList, 
    // ✅ ACTUALIZADA LA RUTA CON EL PREFIJO /asistencia
    url: '/asistencia/admin/initial',
    requiresAutoLogin: true  
  },
  { name: 'Kárdex de medicamentos de Tópico', icon: Pill, url: 'https://as241s4-pii-t18-fe.onrender.com/' , external: true},
  { name: 'Declaración Jurada', icon: FileText, path: '/dj/login' },
  { name: 'Boleta de permiso de trabajadores', icon: Bell, path: '/rrhh/dashboard' },
  { name: 'Entrega de Fondos a Rendir', icon: Banknote, path: '/modules/9' },
  { name: 'Vale Provisional', icon: ReceiptText, path: '/valeProvisional/DashboardPage' },
];

const academicModules = [
  'Sistematización de la Hackthon',
  { 
    name: 'Justificación de Asistencias',
    icon: ClipboardList,
    // ✅ ACTUALIZADA LA RUTA CON EL PREFIJO /asistencia
    url: '/asistencia/admin/initial',
    requiresAutoLogin: true 
  },
  { name: 'Entrega de Fondos a Rendir', icon: Banknote, path: '/modules/9' },
  { name: 'Declaración Jurada', icon: FileText, path: '/dj/login' }
];

const Sidebar = ({ user, onLogout }) => {
  const [openModules, setOpenModules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);

  
  const isAcademic = user && (user.role === 'estudiante' || user.role === 'profesor');

 
  const handleModuleClick = async (e, m) => {
    console.log('🎯 BOTÓN PRESIONADO:', m.name);
    console.log('📌 requiresAutoLogin:', m.requiresAutoLogin);
    
    if (m.requiresAutoLogin) {
      e.preventDefault(); 
      
      setIsLoading(true);
      setLoadingMessage('Conectando con el módulo de asistencias...');
      
      console.log('🔄 Iniciando proceso de auto-login...');
      
      try {
        
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
        
      
        setLoadingMessage('Preparando acceso...');
        console.log('⏳ Esperando 1 segundo...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      
        const token = localStorage.getItem('assistanceToken');
        const userInfo = localStorage.getItem('assistanceUser');
        
        console.log('🔍 Verificación final:');
        console.log('   - Token:', token ? '✅ EXISTE' : '❌ NO EXISTE');
        console.log('   - Usuario:', userInfo ? '✅ EXISTE' : '❌ NO EXISTE');
        
        if (!token || !userInfo) {
          console.error('❌ ERROR: Datos no encontrados');
          alert('Error: No se pudo guardar la sesión. Intenta de nuevo.');
          setIsLoading(false);
          return;
        }
        
      
        setLoadingMessage('Redirigiendo...');
        console.log('🚀 Redirigiendo a', m.url);
        
        setTimeout(() => {
          window.location.href = m.url;
        }, 500);
        
      } catch (error) {
        console.error('❌ Error en el proceso:', error);
        console.error('Stack:', error.stack);
        alert('Error al conectar: ' + error.message);
        setIsLoading(false);
      }
    } else {
   
      console.log('➡️ Módulo normal');
    }
  };

  return (
    <>
    
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
      
      <aside className="bg-[#1A212D] w-64 text-slate-200 min-h-screen border-r border-slate-700 flex flex-col">
        <div className="px-4 py-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-400 flex items-center justify-center text-slate-900 font-bold">S</div>
            <div>
              <div className="text-sm font-semibold">Sistema</div>
              <div className="text-xs text-slate-400">{isAcademic ? 'Académico' : 'Administrativo'}</div>
            </div>
          </div>
        </div>

        <nav className="px-2 py-4 flex flex-col gap-2">
          {/* Panel */}
          <NavLink
            to={isAcademic ? '/academic' : (user && (user.role === 'admin' || user.role === 'admin_asistencias' || user.isAdmin) ? '/admin/dashboard' : '/dashboard')}
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
          >
            {({ isActive }) => (
              <>
                <Home className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Panel</span>
              </>
            )}
          </NavLink>

          {/* Módulos */}
          <div>
            <button
              onClick={() => setOpenModules(prev => !prev)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${openModules ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
            >
              <FolderKanban className={`w-5 h-5 ${openModules ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={openModules ? 'text-black' : 'text-white group-hover:text-black'}>Módulos</span>
              <span className={openModules ? 'text-black' : 'text-white group-hover:text-black'}>{openModules ? '▾' : '▸'}</span>
            </button>
            {openModules && (
              <ul className="mt-2 ml-2">
                {(isAcademic ? academicModules : adminModules).map((m, idx) => {
                  const Icon = m.icon || Home;
                  const label = typeof m === 'string' ? m : m.name;
                  const path = m.path || `/academic/modules/${idx + 1}`;
                  // Si el módulo tiene submenú, lo mostramos aquí
                  if (m.hasSubmenu) {
                    const isOpen = openSubmenuIndex === idx;
                    return (
                      <li key={idx} className="mb-1">
                        <button
                          type="button"
                          onClick={() => setOpenSubmenuIndex(prev => prev === idx ? null : idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group text-white hover:bg-[#C8FAD6] hover:text-black`}
                          style={{fontSize: '0.97rem', minHeight: '40px', background: 'none'}}
                        >
                          <Icon className="w-5 h-5 text-[#637381] group-hover:text-black" />
                          <span className={`flex-1 text-left text-white group-hover:text-black`} style={{whiteSpace: 'normal'}}>{label}</span>
                          <span className="text-sm text-[#9ca3af]">{isOpen ? '▾' : '▸'}</span>
                        </button>

                        {isOpen && (
                          <ul className="mt-2 ml-4">
                            {m.submodules && m.submodules.map((s, sidx) => (
                              <li key={sidx} className="mb-1">
                                {s.url ? (
                                  <button
                                    type="button"
                                    onClick={() => window.location.replace(s.url)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group text-white hover:bg-[#C8FAD6] hover:text-black`}
                                    style={{fontSize: '0.92rem', minHeight: '36px', background: 'none'}}
                                  >
                                    <span className="w-4" />
                                    <span className={`flex-1 text-left text-white group-hover:text-black`} style={{whiteSpace: 'normal'}}>{s.name}</span>
                                  </button>
                                ) : (
                                  <NavLink
                                    to={s.path}
                                    className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
                                    style={{fontSize: '0.92rem', minHeight: '36px'}}
                                  >
                                    {({ isActive }) => (
                                      <>
                                        <span className={`w-4`} />
                                        <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>{s.name}</span>
                                      </>
                                    )}
                                  </NavLink>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  
                  // ✅ PARA MÓDULOS CON AUTO-LOGIN
                  if (m.requiresAutoLogin) {
                    return (
                      <li key={idx} className="mb-1">
                        <button
                          type="button"
                          onClick={(e) => handleModuleClick(e, m)}
                          disabled={isLoading}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group text-white hover:bg-[#C8FAD6] hover:text-black ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{fontSize: '0.97rem', minHeight: '40px', background: 'none'}}
                        >
                          <Icon className="w-5 h-5 text-[#637381] group-hover:text-black" />
                          <span className={`flex-1 text-left text-white group-hover:text-black`} style={{whiteSpace: 'normal'}}>
                            {isLoading && m.requiresAutoLogin ? 'Conectando...' : label}
                          </span>
                        </button>
                      </li>
                    );
                  }
                  
                  // Para enlaces externos
                  if (m.url && m.external) {
                    return (
                      <li key={idx} className="mb-1">
                        <button
                          type="button"
                          onClick={() => window.location.replace(m.url)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group text-white hover:bg-[#C8FAD6] hover:text-black`}
                          style={{fontSize: '0.97rem', minHeight: '40px', background: 'none'}}
                        >
                          <Icon className="w-5 h-5 text-[#637381] group-hover:text-black" />
                          <span className={`flex-1 text-left text-white group-hover:text-black`} style={{whiteSpace: 'normal'}}>{label}</span>
                        </button>
                      </li>
                    );
                  }
                  
                  // Internal links use NavLink for active/hover logic
                  return (
                    <li key={idx} className="mb-1">
                      <NavLink
                        to={path}
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
                        style={{fontSize: '0.97rem', minHeight: '40px'}}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                            <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>{label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Sección de navegación administrativa */}
          {!isAcademic && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
              >
                <Users className={`w-5 h-5 ${window.location.pathname === '/users' ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                <span className={window.location.pathname === '/users' ? 'text-black' : 'text-white group-hover:text-black'}>Trabajadores</span>
              </NavLink>
              <NavLink
                to="/tipos"
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
              >
                <Tag className={`w-5 h-5 ${window.location.pathname === '/tipos' ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                <span className={window.location.pathname === '/tipos' ? 'text-black' : 'text-white group-hover:text-black'}>Tipos</span>
              </NavLink>
              <NavLink
                to="/solicitudes"
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
              >
                <FileEdit className={`w-5 h-5 ${window.location.pathname === '/solicitudes' ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                <span className={window.location.pathname === '/solicitudes' ? 'text-black' : 'text-white group-hover:text-black'}>Solicitudes</span>
              </NavLink>
              <NavLink
                to="/roles"
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
              >
                <UserCog2 className={`w-5 h-5 ${window.location.pathname === '/roles' ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                <span className={window.location.pathname === '/roles' ? 'text-black' : 'text-white group-hover:text-black'}>Roles</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}
              >
                <Cog className={`w-5 h-5 ${window.location.pathname === '/settings' ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
                <span className={window.location.pathname === '/settings' ? 'text-black' : 'text-white group-hover:text-black'}>Configuración</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700 mt-auto">
          {user && (
            <div className="text-xs text-white mb-2">Conectado como <span className="text-white">{user.user_name || user.name || user.username}</span></div>
          )}
          <button
            onClick={() => {
              if (typeof onLogout === 'function') onLogout();
              else {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login';
              }
            }}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 bg-red-600 text-white"
          >
            <span className="text-lg">🔒</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      
      {/* ✅ ESTILOS PARA LA ANIMACIÓN */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;