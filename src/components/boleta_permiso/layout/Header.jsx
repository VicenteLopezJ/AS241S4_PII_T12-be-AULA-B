// src/components/layout/Header.jsx
import React from 'react';
import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-gray-800 p-4 flex justify-between items-center print:hidden">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-teal-400" />
          <span className="text-xl font-semibold text-teal-400">Sistema de Permisos</span>
        </div>
        <span className="text-gray-400 text-sm">Gestión Empresarial</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium">
          JEA
        </div>
        <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
          3
        </div>
      </div>
    </div>
  );
};

export default Header;
