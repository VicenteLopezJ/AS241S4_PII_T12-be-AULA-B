import React from 'react';
import Header from './Header';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-900 w-full">
      <Header user={user} onLogout={onLogout} />
      <main className="w-full min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;