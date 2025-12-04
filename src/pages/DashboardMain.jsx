import React, { useEffect, useState } from 'react';
import Layout from '../components/intranet/user/Layout';
import { Link, useNavigate } from 'react-router-dom';
import roleService from '../services/intranet/role/roleService';
import { userService } from '../services/intranet/user/userService';
import solicitudService from '../services/intranet/solicitudes/solicitudService';
import tipoService from '../services/intranet/tipos/tipoService';
import { autoLoginToBoletaPermiso } from '../utils/autoLoginBoletaPermiso';
import { autoLoginToAssistance } from '../utils/autoLoginHelper';

const MainDashboard = ({ user, onLogout }) => {
  const [roles, setRoles] = useState([]);
  const [counts, setCounts] = useState({ users: 0, roles: 0, solicitudes: 0, tipos: 0 });
  const navigate = useNavigate();

  const handleOpenAsistencia = async () => {
    try {
      const ok = await autoLoginToAssistance();
      if (!ok) return;
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token = localStorage.getItem('assistanceToken');
      const userInfo = localStorage.getItem('assistanceUser');
      if (!token || !userInfo) return;
      window.location.href = '/asistencia/admin/initial';
    } catch (err) {
      console.error('Error en autologin de Asistencias:', err);
    }
  };

  const handleOpenBoletaPermiso = async () => {
    try {
      const ok = await autoLoginToBoletaPermiso();
      if (ok) {
        navigate('/rrhh/dashboard');
      } else {
        navigate('/rrhh/login');
      }
    } catch (err) {
      console.error('Error en autologin de Boleta de Permiso:', err);
      navigate('/rrhh/login');
    }
  };

  useEffect(() => {
    let mounted = true;
    roleService.getRoles()
      .then((data) => {
        if (!mounted) return;
        // backend might return an object with data or an array
        setRoles(Array.isArray(data) ? data : (data?.roles || []));
      })
      .catch((err) => {
        console.error('Error cargando roles en dashboard:', err);
      });
    // fetch counts for top cards
    const getCount = (res) => {
      if (!res) return 0;
      if (Array.isArray(res)) return res.length;
      if (typeof res === 'object') {
        return res.total ?? res.count ?? res.length ?? Object.keys(res).length ?? 0;
      }
      return 0;
    };

    Promise.allSettled([
      userService.getAllUsers(),
      roleService.getRoles(),
      solicitudService.getAll(),
      tipoService.getAll()
    ]).then(results => {
      if (!mounted) return;
      const u = results[0].status === 'fulfilled' ? getCount(results[0].value) : 0;
      const r = results[1].status === 'fulfilled' ? getCount(results[1].value) : 0;
      const s = results[2].status === 'fulfilled' ? getCount(results[2].value) : 0;
      const t = results[3].status === 'fulfilled' ? getCount(results[3].value) : 0;
      setCounts({ users: u, roles: r, solicitudes: s, tipos: t });
    }).catch(err => console.error('Error obteniendo counts:', err));
    return () => { mounted = false; };
  }, []);
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg p-4 text-slate-900 border border-slate-600 bg-gradient-to-r from-emerald-100 to-emerald-50">
                <div className="text-sm">Usuarios</div>
                <div className="text-3xl font-bold">{counts.users}</div>
                <div className="text-xs text-slate-600 mt-1">Total usuarios</div>
              </div>
              <div className="rounded-lg p-4 text-slate-900 border border-slate-600 bg-gradient-to-r from-sky-100 to-sky-50">
                <div className="text-sm">Roles</div>
                <div className="text-3xl font-bold">{counts.roles}</div>
                <div className="text-xs text-slate-600 mt-1">Roles activos</div>
              </div>
              <div className="rounded-lg p-4 text-slate-900 border border-slate-600 bg-gradient-to-r from-amber-100 to-amber-50">
                <div className="text-sm">Solicitudes</div>
                <div className="text-3xl font-bold">{counts.solicitudes}</div>
                <div className="text-xs text-slate-600 mt-1">Total solicitudes</div>
              </div>
              <div className="rounded-lg p-4 text-slate-900 border border-slate-600 bg-gradient-to-r from-rose-100 to-rose-50">
                <div className="text-sm">Tipos de solicitud</div>
                <div className="text-3xl font-bold">{counts.tipos}</div>
                <div className="text-xs text-slate-600 mt-1">Categorías</div>
              </div>
            </div>

            {/* Módulos: se muestran de forma destacada en el dashboard */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-200">Módulos Administrativos</h2>
                <div className="text-sm text-slate-400">Accede a todas las funcionalidades del sistema</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[ 
                  { id:1, icon:'🧪', title:'Recepción de Muestras en Laboratorio', desc:'Control de ingreso y procesamiento de muestras', path:'/laboratorio/empresas' },
                  { id:2, icon:'💼', title:'Planilla de Viáticos y Movilidad', desc:'Gestión de gastos de viaje y movilidad del personal', url:'/vt/dashboard-movil' },
                  { id:3, icon:'🏆', title:'Sistematización del Hackathon', desc:'Organización y seguimiento de eventos hackathon', path:'/hackathon/evaluationday' },
                  { id:4, icon:'✈️', title:'Seguimiento de Vacaciones', desc:'Gestión de períodos vacacionales del personal', path:'/vacaciones/login' },
                  { id:5, icon:'🧾', title:'Justificación de Asistencias', desc:'Registro y justificación de asistencias del personal', requiresAutoLogin: true },
                  { id:6, icon:'💊', title:'Kárdex de Medicamentos de Tópico', desc:'Inventario y control de medicamentos', path:'/kardex/dashboard' },
                  { id:7, icon:'📝', title:'Declaración Jurada', desc:'Registro y seguimiento de declaraciones juradas', path:'/dj/login' },
                  { id:8, icon:'🔔', title:'Boleta de Permiso de Trabajadores', desc:'Solicitudes y aprobación de permisos laborales', path:'/rrhh/dashboard' },
                  { id:9, icon:'🏦', title:'Entrega de Fondos a Rendir', desc:'Control de fondos entregados y rendiciones', path:'/modules/9' },
                  { id:10, icon:'🧾', title:'Vale Provisional', desc:'Emisión y control de vales provisionales', path:'/valeProvisional/DashboardPage' }
                ].map(m => (
                  m.requiresAutoLogin ? (
                    <button
                      key={m.id}
                      type="button"
                      onClick={handleOpenAsistencia}
                      className="block w-full text-left bg-white/3 p-4 rounded-lg border border-slate-600 hover:shadow-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">{m.icon}</div>
                        <div className="flex-1">
                          <div className="text-slate-100 font-semibold mb-1">{m.title}</div>
                          <div className="text-slate-300 text-sm mb-3">{m.desc}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-200">Abrir</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ) : m.url ? (
                    <div
                      key={m.id}
                      className="block bg-white/3 p-4 rounded-lg border border-slate-600 hover:shadow-lg hover:bg-white/5 transition-colors"
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.location.replace(m.url)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">{m.icon}</div>
                        <div className="flex-1">
                          <div className="text-slate-100 font-semibold mb-1">{m.title}</div>
                          <div className="text-slate-300 text-sm mb-3">{m.desc}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-200">Abrir</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : m.id === 8 ? (
                    <button
                      key={m.id}
                      type="button"
                      onClick={handleOpenBoletaPermiso}
                      className="block w-full text-left bg-white/3 p-4 rounded-lg border border-slate-600 hover:shadow-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">{m.icon}</div>
                        <div className="flex-1">
                          <div className="text-slate-100 font-semibold mb-1">{m.title}</div>
                          <div className="text-slate-300 text-sm mb-3">{m.desc}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-200">Abrir</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <Link
                      key={m.id}
                      to={m.path}
                      className="block bg-white/3 p-4 rounded-lg border border-slate-600 hover:shadow-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">{m.icon}</div>
                        <div className="flex-1">
                          <div className="text-slate-100 font-semibold mb-1">{m.title}</div>
                          <div className="text-slate-300 text-sm mb-3">{m.desc}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-200">Abrir</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <h4 className="text-slate-200 font-semibold mb-3">Ver mis roles</h4>
                  <div className="bg-slate-700 p-3 rounded flex flex-col gap-3">
                    <p className="text-slate-400 text-sm">Revisa y administra los roles asignados a tu usuario.</p>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {roles && roles.length > 0 ? (
                        roles.slice(0, 8).map((r) => (
                          <div key={r.id || r._id || r.name} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                            <div>
                              <div className="text-slate-200 text-sm">{r.name || r.nombre || r.role_name}</div>
                              {r.description ? <div className="text-xs text-slate-400">{r.description}</div> : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-400">No hay roles asignados o todavía no se cargaron.</div>
                      )}
                    </div>
                    <div className="pt-2">
                      <Link to="/roles" className="inline-flex items-center gap-2 px-4 py-2 rounded shadow bg-emerald-500 hover:bg-emerald-400 text-white transition-colors font-medium text-sm">
                        <span className="text-white">👤</span>
                        <span> Ver mis roles </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MainDashboard;
