import React from 'react';
import { Search, Filter, Download, Plus } from 'lucide-react';

const SearchBar = ({ onNew }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-end gap-3">
        <button className="flex items-center gap-2 p-2 text-gray-600 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-colors" title="Filtros">
          <Filter className="w-4 h-4" />
        </button>

        <button className="flex items-center gap-2 p-2 text-gray-600 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-colors" title="Exportar">
          <Download className="w-4 h-4" />
        </button>

        <button onClick={() => onNew && onNew()} className="flex items-center gap-2 px-4 py-2 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shadow-md" title="Nuevo Registro">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Nuevo Registro</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;