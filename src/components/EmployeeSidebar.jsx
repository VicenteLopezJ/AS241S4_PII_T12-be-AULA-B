import React from 'react';

const EmployeeSidebar = ({ user, onLogout }) => (
  <aside className="bg-[#1A212D] w-64 text-slate-200 min-h-screen border-r border-slate-700 flex flex-col">
    <div className="px-4 py-6 border-b border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-emerald-400 flex items-center justify-center text-slate-900 font-bold">S</div>
        <div>
          <div className="text-sm font-semibold">Sistema</div>
          <div className="text-xs text-slate-400">Empleado</div>
        </div>
      </div>
    </div>
    <div className="px-4 py-4 border-t border-slate-700">
      {user && (
        <>
          <div className="text-xs text-white mb-2">Conectado como <span className="text-white">{user.user_name || user.name || user.username}</span></div>
          <button
            onClick={() => {
              alert(`Usuario: ${user.user_name || user.name || user.username}\nRol: ${user.role}`);
            }}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-700 bg-blue-600 text-white mb-2"
          >
            <span className="text-lg">👤</span>
            <span>Mi perfil</span>
          </button>
        </>
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
);

export default EmployeeSidebar;
