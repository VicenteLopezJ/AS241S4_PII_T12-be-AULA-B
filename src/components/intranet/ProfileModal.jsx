import React, { useState } from 'react';

const ProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || user?.user_name || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Aquí deberías llamar a tu servicio de actualización de usuario
    await onSave(formData);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#232C3A',
        borderRadius: '16px',
        padding: '32px',
        minWidth: '340px',
        color: '#fff',
        boxShadow: '0 2px 16px #0006',
      }}>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '18px'}}>Editar perfil</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', marginBottom: '6px'}}>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#1A212D', color: '#fff'}}
              required
            />
          </div>
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', marginBottom: '6px'}}>Nueva contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#1A212D', color: '#fff'}}
              placeholder="••••••••"
            />
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
            <button type="button" onClick={onClose} style={{background: '#444', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer'}}>Cancelar</button>
            <button type="submit" disabled={saving} style={{background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer'}}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
