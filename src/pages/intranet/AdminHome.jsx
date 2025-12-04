import React from 'react';
import AdminModules from '../../components/intranet/AdminModules';

const AdminHome = ({ user, onLogout }) => {
  console.log('🏠🏠🏠 AdminHome RENDERIZADO - Usuario:', user);
  
  return (
    <div style={{background: '#232C3A', minHeight: '100vh', padding: '32px'}}>
      <h1 style={{color: '#fff', fontSize: '2rem', marginBottom: '16px'}}>
        ADMIN HOME - DEBUG
      </h1>
      <AdminModules user={user} onLogout={onLogout} />
    </div>
  );
};

export default AdminHome;