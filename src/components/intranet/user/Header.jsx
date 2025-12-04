import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <h2 className="text-xl text-slate-200 font-semibold">Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-300">{user ? user.user_name || user.name || user.username : ''}</div>
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">{user && (user.user_name ? user.user_name.charAt(0).toUpperCase() : 'U')}</div>
      </div>
    </header>
  );
};

export default Header;
