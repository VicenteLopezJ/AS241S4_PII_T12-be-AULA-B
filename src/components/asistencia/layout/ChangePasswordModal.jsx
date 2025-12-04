// src/components/asistencia/layout/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import '../../../styles/asistencia/ChangePassword.css';

const ChangePasswordModal = ({ isOpen, onClose, userId, userRole }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('Por favor, ingresa tu contraseña actual');
      return false;
    }

    if (!formData.newPassword) {
      setError('Por favor, ingresa una nueva contraseña');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_INASISTENCIAS_API_URL || '/api/v1';
      
      const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al cambiar la contraseña');
      }

      setSuccess('✅ Contraseña cambiada exitosamente');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      setSuccess('');
      onClose();
    }
  };

  const getPasswordLabel = () => {
    return userRole === 'student' ? 'Contraseña Actual' : 'Contraseña Actual';
  };

  return (
    <div className="change-password-overlay" onClick={handleClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <Lock className="modal-icon" />
            <h2>Cambiar Contraseña</h2>
          </div>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Alerta de error */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Alerta de éxito */}
          {success && (
            <div className="alert alert-success">
              <CheckCircle className="alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {/* Contraseña Actual / DNI */}
          <div className="form-group">
            <label htmlFor="currentPassword">
              {getPasswordLabel()}
            </label>
            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder={userRole === 'student' ? 'Ingresa tu contraseña actual' : 'Ingresa tu contraseña actual'}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="form-group">
            <label htmlFor="newPassword">
              Nueva Contraseña
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <small className="form-hint">
              La contraseña debe tener al menos 8 caracteres
            </small>
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirmar Nueva Contraseña
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la nueva contraseña"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

     

          {/* Botones */}
          <div className="modal-footer">
            <button
              type="button"
              className="button button-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;