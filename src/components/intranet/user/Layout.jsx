import React from 'react';
import Sidebar from '../../Sidebar';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#232C3A] w-full flex">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 min-h-screen">
        <main className="w-full min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
