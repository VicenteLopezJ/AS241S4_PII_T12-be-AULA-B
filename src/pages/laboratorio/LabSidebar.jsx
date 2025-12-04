import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FlaskConical, Briefcase, FileText } from 'lucide-react';

export default function LabSidebar() {
  const navigate = useNavigate();

  return (
    <aside className={`w-64 bg-[#1A212D] min-h-screen text-slate-100 border-r border-slate-700 flex flex-col`}>
      <div className="px-4 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-400 flex items-center justify-center text-slate-900 font-bold">L</div>
          <div>
            <div className="text-sm font-semibold">Laboratorio</div>
            <div className="text-xs text-slate-400">Recepción de muestras</div>
          </div>
        </div>
      </div>

      <nav className="px-2 py-4 flex-1 flex flex-col gap-2 overflow-y-auto">
        <NavLink to="/laboratorio/empresas" className={({isActive}) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}>
          {({isActive}) => (
            <>
              <FlaskConical className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#94a3b8]'}`} />
              <span className={isActive ? 'text-black' : 'text-white'}>Empresas</span>
            </>
          )}
        </NavLink>

        <NavLink to="/laboratorio/cotizaciones" className={({isActive}) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}>
          {({isActive}) => (
            <>
              <FileText className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#94a3b8]'}`} />
              <span className={isActive ? 'text-black' : 'text-white'}>Cotizaciones</span>
            </>
          )}
        </NavLink>

        <NavLink to="/laboratorio/muestreo" className={({isActive}) => `w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 font-semibold ${isActive ? 'bg-[#C8FAD6] text-black' : 'text-white hover:bg-[#C8FAD6] hover:text-black'}`}>
          {({isActive}) => (
            <>
              <Briefcase className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#94a3b8]'}`} />
              <span className={isActive ? 'text-black' : 'text-white'}>Muestreo Laboratorio</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="px-4 py-4 mt-auto border-t border-slate-700">
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/dashboard')} className="w-full px-3 py-2 bg-emerald-600 text-white rounded-md">Volver al Dashboard</button>
        </div>
      </div>
    </aside>
  );
}
