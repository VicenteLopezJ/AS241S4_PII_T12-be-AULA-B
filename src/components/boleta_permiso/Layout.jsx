import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';

const Layout = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;