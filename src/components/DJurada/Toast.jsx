// ============================================
// ARCHIVO: src/components/Toast/Toast.jsx
// ============================================
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ✅ COMPONENTE DE ALERTA INDIVIDUAL
export const Toast = ({ message, type, onClose }) => {
    const configs = {
        success: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            icon: CheckCircle,
            borderColor: 'border-green-400'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-rose-600',
            icon: XCircle,
            borderColor: 'border-red-400'
        },
        warning: {
            bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
            icon: AlertTriangle,
            borderColor: 'border-yellow-400'
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
            icon: Info,
            borderColor: 'border-blue-400'
        }
    };

    const config = configs[type] || configs.info;
    const Icon = config.icon;

    return (
        <div className={`${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl border-2 ${config.borderColor} backdrop-blur-sm animate-slideIn flex items-center gap-3 min-w-[320px] max-w-md`}>
            <div className="flex-shrink-0">
                <Icon className="text-white" size={24} />
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm leading-relaxed">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 transition-colors rounded-lg hover:bg-white/20"
            >
                <X size={18} />
            </button>
        </div>
    );
};

// ✅ CONTENEDOR DE TODAS LAS ALERTAS
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default Toast;