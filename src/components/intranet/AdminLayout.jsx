import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminModules from './AdminModules';

const AdminLayout = ({ user, onLogout }) => {
  const [userData, setUserData] = useState(user);

  const handleProfileEdit = async (formData) => {
    setUserData((prev) => ({ ...prev, ...formData }));
  };

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: '#232C3A'}}>
      <AdminSidebar user={userData} onLogout={onLogout} onProfileEdit={handleProfileEdit} />
      <div style={{flex: 1}}>
        <header style={{padding: '32px 32px 0 32px'}}>
          <h1 style={{color: '#fff', fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '0'}}>
            Modulo academicos
          </h1>
          <p style={{color: '#b3b8c5', fontSize: '1.1rem', marginTop: '0'}}>Accede a todos los módulos administrativos</p>
        </header>
        <main>
          <AdminModules user={userData} onLogout={onLogout} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
