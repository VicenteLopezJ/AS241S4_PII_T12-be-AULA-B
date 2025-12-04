import EmployeeSidebar from '../components/EmployeeSidebar';

const EmployeeDashboard = ({ user, onLogout }) => {
  const modules = [
    {
      id: 1,
      icon: '🧪',
      title: 'Recepción de Muestras en Laboratorio',
      desc: 'Control de ingreso y procesamiento de muestras',
      url: 'https://as241s4-pii-t06-fe-2.onrender.com/',
      external: true,
    },
    {
      id: 2,
      icon: '💼',
      title: 'Viáticos y Movilidad',
      desc: 'Gestión de gastos de viaje y movilidad del personal',
      url: '/vt/dashboard-movil',
      external: true,
    },
    {
      id: 4,
      icon: '✈️',
      title: 'Seguimiento de Vacaciones',
      desc: 'Gestión de períodos vacacionales del personal',
      path: '/vacaciones/login-empleado',
    },
    {
      id: 6,
      icon: '💊',
      title: 'Kárdex de Medicamentos de Tópico',
      desc: 'Inventario y control de medicamentos',
      path: '/kardex/dashboard',
      external: true,
    },
    {
      id: 7,
      icon: '📝',
      title: 'Declaración Jurada',
      desc: 'Registro y seguimiento de declaraciones juradas',
      url: 'https://as241s4-pii-t20-fe.onrender.com',
      external: true,
    },
    {
      id: 8,
      icon: '🔔',
      title: 'Boleta de Permiso de Trabajadores',
      desc: 'Solicitudes y aprobación de permisos laborales',
      path: '/rrhh/login-empleado',
    },
    {
      id: 9,
      icon: '🏦',
      title: 'Entrega de Fondos a Rendir',
      desc: 'Control de fondos entregados y rendiciones',
      path: '/modules/9',
    },
    {
      id: 10,
      icon: '🧾',
      title: 'Vale Provisional',
      desc: 'Emisión y control de vales provisionales',
      path: '/valeProvisional/DashboardPage',
    },
  ];

  return (
    <div className="flex bg-[#10182A] min-h-screen">
      <EmployeeSidebar user={user} onLogout={onLogout} />
      <div className="flex-1 min-h-screen">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Módulos Administrativos</h2>
            <div className="text-sm text-slate-400">Accede a tus funcionalidades disponibles</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map(m => (
              m.external ? (
                <a
                  key={m.id}
                  href={m.url}
                  className="block bg-white/3 p-4 rounded-lg border border-slate-600 hover:shadow-lg hover:bg-white/5 transition-colors cursor-pointer"
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
                </a>
              ) : (
                <a
                  key={m.id}
                  href={m.path}
                  className="block bg-white/3 p-4 rounded-lg border border-slate-600 hover:shadow-lg hover:bg-white/5 transition-colors cursor-pointer"
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
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
