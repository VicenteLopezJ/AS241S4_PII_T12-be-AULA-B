import React from "react";
import "../../styles/kardex/DetailModal.css";

export default function DetailModal({ 
  isOpen, 
  onClose, 
  title, 
  data 
}) {
  if (!isOpen) return null;

  return (
    <div className="detail-modal-overlay">
      <div className="detail-modal">
        <div className="detail-modal-header">
          <h3>{title}</h3>
          <button className="detail-close-btn" onClick={onClose}>✖</button>
        </div>
        
        <div className="detail-modal-body">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-label">{formatLabel(key)}:</span>
              <span className="detail-value">{value || 'N/A'}</span>
            </div>
          ))}
        </div>
        
        <div className="detail-modal-actions">
          <button className="detail-close-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Función para formatear las etiquetas
const formatLabel = (key) => {
  const labels = {
    id: 'ID',
    nombre: 'Nombre',
    razonSocial: 'Razón Social',
    presentacion: 'Presentación',
    descripcion: 'Descripción',
    categoria: 'Categoría',
    estado: 'Estado',
    telefono: 'Teléfono',
    direccion: 'Dirección',
    ruc: 'RUC',
    correo: 'Correo Electrónico'
  };
  return labels[key] || key;
};