import React from 'react';
import { X } from 'lucide-react';
import '../../../styles/valeProvisional/Applicant/applicantModal.css';
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* Overlay */}
      <div 
        className="modal-backdrop"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Body */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;