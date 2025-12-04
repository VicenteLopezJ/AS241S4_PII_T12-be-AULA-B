import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeftToLine,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Banknote,
  Users,
  UserCog,
  ClipboardCheck
} from "lucide-react";


const Sidebar = () => {
  return (
    <aside className="bg-[#1A212D] w-64 text-slate-200 min-h-screen border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-400 flex items-center justify-center text-slate-900 font-bold">
            S
          </div>
          <div>
            <div className="text-sm font-semibold">Sistema</div>
            <div className="text-xs text-slate-400">Administrativo</div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="px-2 py-4 flex flex-col gap-2 flex-grow">

        {/* Volver al panel - Usamos un <a> simple y estilo NavLink */}
        <a
          href="/dashboard"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group text-white hover:bg-[#C8FAD6] hover:text-black"
        >
          <ArrowLeftToLine className={`w-5 h-5 text-[#637381] group-hover:text-black`} />
          <span className='text-white group-hover:text-black'>Volver al panel</span>
        </a>

        {/* Dashboard */}
        <NavLink
          to="/vt/dashboard-movil"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Dashboard</span>
            </>
          )}
        </NavLink>

        {/* Gastos y movilidad */}
        <NavLink
          to="/vt/request"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Briefcase className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Gestión de Gastos y Movilidad</span>
            </>
          )}
        </NavLink>

        {/* Centros de costos */}
        <NavLink
          to="/vt/cost-center"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Banknote className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Gestión de Centros de Costos</span>
            </>
          )}
        </NavLink>

        {/* Trabajadores */}
        <NavLink
          to="/vt/worker"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Users className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Gestión de Trabajadores</span>
            </>
          )}
        </NavLink>

        {/* Jefes de área */}
        <NavLink
          to="/vt/manager"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <UserCog className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Gestión de Jefes de Área</span>
            </>
          )}
        </NavLink>

        {/* Aprobaciones */}
        <NavLink
          to="/vt/pending"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <ClipboardCheck className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#637381] group-hover:text-black'}`} />
              <span className={isActive ? 'text-black' : 'text-white group-hover:text-black'}>Gestión de Aprobaciones</span>
            </>
          )}
        </NavLink>

      </nav>

      {/* Footer/Logout Section */}
      <div className="px-4 py-4 border-t border-slate-700 mt-auto">
        {/* Nota: Mantengo la funcionalidad de Logout simple ya que el componente original no tenía props `user` ni `onLogout` */}
        <button
          onClick={() => console.log('Cerrar sesión (Simulado)')}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 bg-red-600 text-white font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;