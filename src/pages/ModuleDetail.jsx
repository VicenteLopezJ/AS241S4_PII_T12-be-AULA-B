import React from 'react';
import Layout from '../components/intranet/user/Layout';
import { useParams } from 'react-router-dom';

const modules = [
  'Recepción de muestras en Laboratorio',
  'Planilla de Viaticos y Movilidad',
  'Sistematización de la Hackthon',
  'Seguimiento de Vacaciones',
  'Justificación de Inasistencias',
  'Vale Provisional',
  'Boleta de permiso de trabajadores',
  'Kárdex de medicamentos de Tópico',
  'Declaración Jurada',
  'Entrega de Fondos a Rendir'
];

const ModuleDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const idx = parseInt(id, 10) - 1;
  const name = modules[idx] || `Módulo ${id}`;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h1 className="text-2xl font-semibold text-slate-200 mb-2">{name}</h1>
        <p className="text-slate-400">Contenido y herramientas del módulo {id}.</p>
      </div>
    </Layout>
  );
};

export default ModuleDetail;
