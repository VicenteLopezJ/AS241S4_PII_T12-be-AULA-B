import React from 'react';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';
import '../../../styles/valeProvisional/area/areaList.css';

const AreaList = ({ areas, onEdit, onDelete, onRestore }) => {
  return (
    <div className="vale-provisional-area-table-container">
      <table className="vale-provisional-area-table">
        <thead>
          <tr>
            <th className="vale-provisional-area-table-header">CÓDIGO</th>
            <th className="vale-provisional-area-table-header">NOMBRE DEL ÁREA</th>
            <th className="vale-provisional-area-table-header">TIPO DE ÁREA</th>
            <th className="vale-provisional-area-table-header">ESTADO</th>
            <th className="vale-provisional-area-table-header vale-provisional-area-table-header-actions">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area, index) => (
            <tr 
              key={area.ID_AREA}
              className="vale-provisional-area-table-row"
            >
              <td className="vale-provisional-area-table-cell">
                <div className="vale-provisional-area-code-container">
                  <div className="vale-provisional-area-code-badge">
                    {index + 1}
                  </div>
                  <span className="vale-provisional-area-code-text">
                    {area.ID_AREA}
                  </span>
                </div>
              </td>
              <td className="vale-provisional-area-table-cell">
                <div className="vale-provisional-area-info">
                  <div className="vale-provisional-area-name">
                    {area.AREA_NAME}
                  </div>
                </div>
              </td>
              <td className="vale-provisional-area-table-cell">
                <span className="vale-provisional-area-type-badge">
                  {area.AREA_TYPE}
                </span>
              </td>
              <td className="vale-provisional-area-table-cell">
                <span 
                  className={`vale-provisional-area-status-badge ${
                    area.STATUS === 'A' 
                      ? 'vale-provisional-area-status-active' 
                      : 'vale-provisional-area-status-inactive'
                  }`}
                >
                  {area.STATUS === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="vale-provisional-area-table-cell">
                <div className="vale-provisional-area-actions-container">
                  {/* Editar - Solo disponible para áreas activas */}
                  <button
                    onClick={() => onEdit(area)}
                    className="vale-provisional-area-action-btn vale-provisional-area-edit-btn"
                    title="Editar"
                    disabled={area.STATUS !== 'A'}
                  >
                    <Edit2 size={18} />
                  </button>

                  {/* Eliminar o Restaurar */}
                  {area.STATUS === 'A' ? (
                    <button
                      onClick={() => onDelete(area.ID_AREA)}
                      className="vale-provisional-area-action-btn vale-provisional-area-delete-btn"
                      title="Eliminar (Cambiar a Inactivo)"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onRestore(area.ID_AREA)}
                      className="vale-provisional-area-action-btn vale-provisional-area-restore-btn"
                      title="Restaurar (Cambiar a Activo)"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {areas.length === 0 && (
        <div className="vale-provisional-area-empty-state">
          No hay áreas registradas
        </div>
      )}
    </div>
  );
};

export default AreaList;