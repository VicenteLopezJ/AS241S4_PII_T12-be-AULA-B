import React from 'react';
import Layout from '../components/intranet/user/Layout';
import { Link } from 'react-router-dom';

const modules = [
  {
    title: 'Recepción de Muestras en Laboratorio',
    desc: 'Control de ingreso y procesamiento de muestras',
    icon: '🧪',
    path: '/modules/1'
  },
  {
    title: 'Planilla de Viáticos y Movilidad',
    desc: 'Gestión de gastos de viaje y movilidad del personal',
    icon: '💼',
    path: '/modules/2'
  },
  {
    title: 'Sistematización del Hackathon',
    desc: 'Organización y seguimiento de eventos hackathon',
    icon: '🏆',
    path: '/modules/3'
  },
  {
    title: 'Seguimiento de Vacaciones',
    desc: 'Gestión de períodos vacacionales del personal',
    icon: '✈️',
    path: '/vacaciones/login'
  },
  {
    title: 'Justificación de Asistencias',
    desc: 'Registro y justificación de asistencias del personal',
    icon: '🧾',
    path: '/modules/5'
  },
  {
    title: 'Kárdex de Medicamentos de Tópico',
    desc: 'Inventario y control de medicamentos',
    icon: '💊',
    path: '/modules/6'
  },
  {
    title: 'Declaración Jurada',
    desc: 'Registro y seguimiento de declaraciones juradas',
    icon: '📝',
    path: '/modules/7'
  },
  {
    title: 'Boleta de Permiso de Trabajadores',
    desc: 'Solicitudes y aprobación de permisos laborales',
    icon: '🔔',
    path: '/modules/8'
  },
  {
    title: 'Entrega de Fondos a Rendir',
    desc: 'Control de fondos entregados y rendiciones',
    icon: '🏦',
    path: '/modules/9'
  },
  {
    title: 'Vale Provisional',
    desc: 'Emisión y control de vales provisionales',
    icon: '🧾',
    path: '/valeProvisional/DashboardPage'
  }
];

const Modules = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, idx) => (
          <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-xl">{m.icon}</span>
              <span className="text-slate-200 font-semibold">{m.title}</span>
            </div>
            <div className="text-sm text-slate-400 mb-3">{m.desc}</div>
            <Link
              to={m.path}
              className="text-sm bg-emerald-600 text-white px-3 py-1 rounded"
            >
              Abrir módulo
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Modules;
