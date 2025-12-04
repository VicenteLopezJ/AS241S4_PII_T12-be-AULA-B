import React from 'react';
import LabSidebar from './LabSidebar.jsx';
import { Outlet } from 'react-router-dom';

export default function LabLayout() {
  return (
    <div className="min-h-screen flex bg-[#0b1220]">
      <LabSidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
