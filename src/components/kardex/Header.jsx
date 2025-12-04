import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-600 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-200 m-0">
              Sistema de Usuarios
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-slate-300 text-sm">
                  Bienvenido, <span className="font-medium text-slate-200">{user.user_name}</span> ({user.rol})
                </span>
                <button
                  onClick={onLogout}
                  className="bg-slate-600 hover:bg-slate-500 text-slate-200 px-4 py-2 rounded transition-colors text-sm font-medium border border-slate-500 hover:border-slate-400"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;