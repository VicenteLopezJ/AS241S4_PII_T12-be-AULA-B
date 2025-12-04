import React from 'react';
import AcademicModules from './AcademicModules';
import AcademicSidebar from './AcademicSidebar';

// Layout para estudiantes y profesores con sidebar
import { useState } from 'react';

const AcademicLayout = ({ user, onLogout }) => {
  const [userData, setUserData] = useState(user);

  const handleProfileEdit = async (formData) => {
    // Aquí deberías llamar a tu servicio de actualización de usuario en el backend
    // Simulación: actualiza el estado local
    setUserData((prev) => ({ ...prev, ...formData }));
    // Si cambias la contraseña, puedes omitirla del estado local
  };

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: '#232C3A'}}>
      <AcademicSidebar user={userData} onLogout={onLogout} onProfileEdit={handleProfileEdit} />
      <div style={{flex: 1}}>
        <header style={{padding: '32px 32px 0 32px'}}>
          <h1 style={{color: '#fff', fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '0'}}>
            Modulo academicos 
          </h1>
          <p style={{color: '#b3b8c5', fontSize: '1.1rem', marginTop: '0'}}>Solo tienes acceso a los módulos académicos</p>
        </header>
        <main>
          <AcademicModules />
        </main>
      </div>
    </div>
  );
};

export default AcademicLayout;
