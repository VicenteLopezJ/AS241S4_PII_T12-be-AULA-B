// src/components/AreaCard.jsx
import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Power } from 'lucide-react';

export const AreaCard = ({ area, onViewDetails, onEdit, onToggleStatus }) => {
  const [openMenu, setOpenMenu] = useState(false);

  const handleViewDetails = () => {
    onViewDetails(area);
    setOpenMenu(false);
  };

  const handleEdit = () => {
    onEdit(area);
    setOpenMenu(false);
  };

  const handleToggleStatus = () => {
    // La acción asíncrona está delegada al padre
    onToggleStatus(area); 
    setOpenMenu(false);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-5 hover:bg-gray-650 transition-colors border border-gray-600 relative">
      {/* Header con Menú */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-base mb-1">
            {area.nombre_area}
          </h4>
          {area.codigo_area && (
            <p className="text-xs text-gray-400 mb-1">Código: {area.codigo_area}</p>
          )}
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs ${
              area.estado === 'A'
                ? 'bg-green-900/30 text-green-400'
                : 'bg-red-900/30 text-red-400'
            }`}
          >
            {area.estado_texto}
          </span>
        </div>
        
        {/* Menú de 3 puntos */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {openMenu && (
            <>
              {/* Overlay para cerrar menú */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setOpenMenu(false)}
              />
              
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20">
                <button
                  onClick={handleViewDetails}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-left text-sm rounded-t-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Detalles</span>
                </button>
                
                {area.estado === 'A' && (
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-left text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
                
                <button
                  onClick={handleToggleStatus}
                  className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-left text-sm rounded-b-lg ${
                    area.estado === 'A' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{area.estado === 'A' ? 'Inactivar' : 'Activar'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Descripción */}
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {area.descripcion}
      </p>

      {/* Información del Jefe */}
      {area.jefe_area ? (
  <div className="bg-gray-800/50 rounded p-3 mb-3">
    <p className="text-gray-400 text-xs mb-1">Jefe de Área:</p>
    <p className="text-white font-medium text-sm">
      {area.jefe_area.nombre_completo}
    </p>
    <p className="text-gray-400 text-xs mt-1">{area.jefe_area.cargo}</p>
    <p className="text-blue-400 text-xs mt-1">
      {area.jefe_area.correo || "Sin correo"}
    </p>
  </div>
) : (
  <div className="bg-gray-800/50 rounded p-3 mb-3">
    <p className="text-gray-500 text-xs italic">Sin jefe asignado</p>
  </div>
)}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-600">
        <span className="text-gray-400 text-xs">
          ID: {area.id_area}
        </span>
        <span className="text-gray-400 text-xs">
          {new Date(area.fecha_registro).toLocaleDateString('es-PE')}
        </span>
      </div>
    </div>
  );
};