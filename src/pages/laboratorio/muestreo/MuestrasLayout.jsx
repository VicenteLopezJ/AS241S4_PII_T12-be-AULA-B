import React from 'react';
import { Outlet } from 'react-router-dom';
export default function MuestrasLayout() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
