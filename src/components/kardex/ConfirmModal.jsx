import React from "react";
import "../../styles/kardex/ConfirmModal.css";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button className="confirm-close-btn" onClick={onClose}>✖</button>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-modal-actions">
          <button className="confirm-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="confirm-confirm-btn" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}