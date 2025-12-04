import React, { useState } from 'react';
import { VoucherService } from "../../../services/valeProvisional/voucherApi";
import { CheckCircle, Loader } from 'lucide-react';

const CompleteProcessButton = ({ voucher, onCompleted }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!window.confirm('¿Está seguro de marcar este proceso como COMPLETADO?\n\nEsta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      
      // ✅ CORRECCIÓN: Usar VOUCHER_ID en lugar de ID_TRACKING
      const voucherId = voucher.VOUCHER_ID || voucher.idVoucher;
      console.log('🔄 Completando proceso para VOUCHER_ID:', voucherId);
      
      if (!voucherId) {
        throw new Error('No se pudo obtener el ID del voucher');
      }
      
      const response = await VoucherService.completeProcess(voucherId);
      console.log('✅ Proceso completado:', response);
      
      alert('✅ Proceso marcado como COMPLETADO exitosamente');
      
      if (onCompleted) {
        onCompleted();
      }
      
    } catch (error) {
      console.error('❌ Error completando proceso:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al completar el proceso';
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar si el tracking está Justificado (J)
  const trackingStatus = voucher.STATUS || voucher.status;
  if (trackingStatus !== 'J') {
    return null;
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="btn-complete"
      style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: '500'
      }}
    >
      {loading ? (
        <Loader size={14} className="loading-spinner" />
      ) : (
        <CheckCircle size={14} />
      )}
      {loading ? 'Completando...' : 'Completar'}
    </button>
  );
};

export default CompleteProcessButton;