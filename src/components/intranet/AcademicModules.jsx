import React from 'react';
import { useNavigate } from 'react-router-dom';

// Vista para estudiantes y profesores, solo módulos académicos
const AcademicModules = () => {
  const navigate = useNavigate();

  const handleJustificationClick = () => {
    // Redirigir al login de asistencias
    navigate('/asistencia/login');
  };

  return (
    <div className="academic-modules-container" style={{background: '#232C3A', minHeight: '100vh', padding: '32px'}}>
      <h2 style={{color: '#fff', fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px'}}>Módulos Académicos</h2>
      <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
        <div style={{background: '#1A212D', borderRadius: '16px', boxShadow: '0 2px 8px #0002', padding: '24px', minWidth: '320px', maxWidth: '340px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <span role="img" aria-label="hackathon" style={{fontSize: '2.5rem', marginBottom: '12px'}}>🏆</span>
          <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px'}}>Sistematización del Hackathon</h3>
          <p style={{color: '#b3b8c5', marginBottom: '16px'}}>Organización y seguimiento de eventos hackathon</p>
          <button
            style={{background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer'}}
            onClick={() => navigate('/hackathon/evaluationDay')}
          >
            Abrir
          </button>
        </div>
        <div style={{background: '#1A212D', borderRadius: '16px', boxShadow: '0 2px 8px #0002', padding: '24px', minWidth: '320px', maxWidth: '340px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <span role="img" aria-label="asistencia" style={{fontSize: '2.5rem', marginBottom: '12px'}}>📋</span>
          <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px'}}>Justificación de Asistencias</h3>
          <p style={{color: '#b3b8c5', marginBottom: '16px'}}>Registro y justificación de asistencias</p>
          <button
            style={{background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer'}}
            onClick={handleJustificationClick}
          >
            Abrir
          </button>
        </div>
        <div style={{background: '#1A212D', borderRadius: '16px', boxShadow: '0 2px 8px #0002', padding: '24px', minWidth: '320px', maxWidth: '340px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <span role="img" aria-label="fondos" style={{fontSize: '2.5rem', marginBottom: '12px'}}>🏦</span>
          <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px'}}>Entrega de Fondos a Rendir</h3>
          <p style={{color: '#b3b8c5', marginBottom: '16px'}}>Control de fondos entregados y rendiciones</p>
          <button
            style={{background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer'}}
            onClick={() => window.location.href = '/modules/9'}
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicModules;