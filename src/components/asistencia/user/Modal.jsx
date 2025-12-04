import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md border border-slate-600 animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-600 bg-slate-700 rounded-t-lg">
          <h3 className="text-xl font-semibold text-slate-200 m-0">{title}</h3>
          <button 
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none hover:bg-slate-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;