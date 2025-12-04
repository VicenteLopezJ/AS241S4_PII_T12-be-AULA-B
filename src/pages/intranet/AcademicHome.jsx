import React from 'react';
import AcademicLayout from '../../components/intranet/AcademicLayout';

// Página principal para estudiantes y profesores
const AcademicHome = ({ user, onLogout }) => {
  return <AcademicLayout user={user} onLogout={onLogout} />;
};

export default AcademicHome;
