import React, { useState } from 'react';
import ProfileModal from './ProfileModal';

const AdminSidebar = ({ user, onLogout, onProfileEdit }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <aside
      style={{
        background: '#1A212D',
        width: '240px',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px #0002',
        position: 'relative',
        padding: '32px 0 0 0',
      }}
    >
      <div style={{padding: '0 24px 0 24px', width: '100%'}}>
        <button
          style={{
            width: '100%',
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 0',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '18px',
            boxShadow: '0 2px 8px #0002',
          }}
          onClick={() => setShowProfile(true)}
        >
          📝 Mi perfil
        </button>
      </div>
      {/* El nombre del usuario ha sido removido del sidebar */}
      <div style={{padding: '0 24px 0 24px', width: '100%'}}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 0',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            marginBottom: '18px',
          }}
        >
          🔒 Cerrar sesión
        </button>
      </div>
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onSave={onProfileEdit}
        />
      )}
    </aside>
  );
};

export default AdminSidebar;
