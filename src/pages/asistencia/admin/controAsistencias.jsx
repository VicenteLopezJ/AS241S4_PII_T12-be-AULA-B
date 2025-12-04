import React, { useState } from 'react';
// Importamos los iconos necesarios
import { Users, BarChart2, TrendingUp, TriangleAlert, ChevronDown, Download, Eye } from 'lucide-react';

// --- Datos y Constantes Actualizados ---

// Datos para las tarjetas superiores (CON BORDES MÁS CLAROS)
const statsData = [
  // Total Estudiantes
  { title: 'Total Estudiantes', count: 150, color: 'bg-indigo-900/30', borderColor: 'border-indigo-400', icon: Users, iconColor: 'text-indigo-400', statColor: 'text-white' },
  // Asistencia Promedio
  { title: 'Asistencia Promedio', count: '87.5%', color: 'bg-green-900/30', borderColor: 'border-green-400', icon: BarChart2, iconColor: 'text-green-400', statColor: 'text-green-400' },
  // Estudiantes Excelentes
  { title: 'Estudiantes Excelentes', count: 98, color: 'bg-cyan-900/30', borderColor: 'border-cyan-400', icon: TrendingUp, iconColor: 'text-cyan-400', statColor: 'text-white' },
  // Estudiantes Críticos
  { title: 'Estudiantes Críticos', count: 12, color: 'bg-red-900/30', borderColor: 'border-red-400', icon: TriangleAlert, iconColor: 'text-red-400', statColor: 'text-red-400' },
];

// Datos de los desplegables de filtros (AJUSTADOS SEGÚN SOLICITUD)
const periodos = ['2025-I', '2025-II', '2024-I', '2024-II'];
const carreras = ['Todas las Carreras', 'Análisis de Sistemas', 'Agronomía'];
const semestres = [
    'Todos los Semestres', 
    'Semestre 1', 
    'Semestre 2', 
    'Semestre 3', 
    'Semestre 4', 
    'Semestre 5', 
    'Semestre 6'
];

// Datos para la sección de asistencias por semestre (sin cambios)
const asistenciasPorSemestre = [
  { semestre: '1ro Semestre', activos: 30, promedio: '89.2%', criticos: 2, optimos: 28, cursos: ['INO', 'CQI', 'FAH'] },
  { semestre: '2do Semestre', activos: 28, promedio: '85.1%', criticos: 3, optimos: 25, cursos: ['TP2', 'TEI', 'TE2'] },
  { semestre: '3ro Semestre', activos: 25, promedio: '88.7%', criticos: 1, optimos: 24, cursos: ['BQI', 'EF4', 'SQS'] },
  { semestre: '4to Semestre', activos: 22, promedio: '86.3%', criticos: 2, optimos: 20, cursos: ['PWS', 'IAT', 'RSB'] },
  { semestre: '5to Semestre', activos: 25, promedio: '90.1%', criticos: 2, optimos: 23, cursos: ['TGS', 'SHD', 'QETH'] },
  { semestre: '6to Semestre', activos: 20, promedio: '84.5%', criticos: 2, optimos: 18, cursos: ['PP12', 'AUI1', 'ETH4'] },
];

// --- Componentes Reutilizables ---

// Tarjeta Superior (ACTUALIZADA: Contenido Centrado y Título Primero)
const StatCard = ({ title, count, icon: Icon, color, iconColor, statColor, borderColor }) => (
  <div className={`p-4 rounded-xl shadow-lg flex justify-between items-center ${color} border-2 ${borderColor} h-32`}>
    
    {/* Contenido: Centrado y Título arriba del número */}
    <div className="flex flex-col items-start justify-center h-full">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <span className={`text-3xl font-bold ${statColor}`}>{count}</span>
    </div>

    {/* Ícono Grande en la esquina (Único ícono) */}
    <Icon className={`w-10 h-10 ${iconColor} opacity-70`} />
  </div>
);

// Componente para el desplegable de filtros (ACTUALIZADO: con lógica de estado)
const FilterDropdown = ({ title, options, selected, setSelected }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{title}</label>
            <div className="relative inline-block text-left">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex justify-between items-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-700 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-expanded={isOpen}
                >
                    {selected}
                    <ChevronDown className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true" />
                </button>

                {/* Menú Desplegable */}
                {isOpen && (
                    <div
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        role="menu"
                        aria-orientation="vertical"
                    >
                        <div className="py-1" role="none">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-100"
                                    role="menuitem"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Bloque de Asistencias por Semestre (sin cambios de diseño/estilo, solo ajuste de color de texto para el promedio)
const AsistenciaSemestreBlock = ({ data }) => {
    let textColor = 'text-green-600'; 
    if (parseFloat(data.promedio) < 85) {
        textColor = 'text-red-600';
    } else if (parseFloat(data.promedio) < 88) {
        textColor = 'text-yellow-600';
    }

    return (
        <div className="bg-slate-300 p-4 rounded-xl shadow-lg mb-4 text-gray-800">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-xl font-semibold">{data.semestre}</h2>
                    <p className="text-sm text-gray-600">{data.activos} estudiantes activos</p>
                </div>
                <span className={`text-3xl font-bold ${textColor}`}>{data.promedio}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-300">Estudiantes Críticos</span>
                    <span className="text-xl font-bold text-red-400">{data.criticos}</span>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-300">Estudiantes Óptimos</span>
                    <span className="text-xl font-bold text-green-400">{data.optimos}</span>
                </div>
            </div>

            <h3 className="text-sm font-semibold mb-2 text-gray-600">Cursos del Semestre</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {data.cursos.map(curso => (
                    <span key={curso} className="bg-slate-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full">{curso}</span>
                ))}
            </div>

            <div className="flex justify-end space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-gray-800 bg-slate-400 hover:bg-slate-500 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalles</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                </button>
            </div>
        </div>
    );
};


// --- Componente Principal ---

const ControlAsistencias = () => {
    // Estados para almacenar las selecciones de filtro
    const [periodo, setPeriodo] = useState(periodos[0]);
    const [carrera, setCarrera] = useState(carreras[0]);
    const [semestre, setSemestre] = useState(semestres[0]);

  return (
    // Fondo general bg-gray-800
    <div className="min-h-screen p-8 bg-gray-800 text-white">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Control de Asistencias</h1>
        <p className="text-gray-400">Monitoreo general de asistencias por periodo y carrera</p>
      </header>

      {/* Sección de Tarjetas Superiores (Diseño Ajustado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Sección de Filtros (Fondo bg-slate-300 y Desplegables Funcionales) */}
      <section className="bg-slate-300 p-6 rounded-xl shadow-lg mb-8 text-gray-800">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Desplegable de Periodo */}
          <FilterDropdown 
            title="Periodo" 
            options={periodos} 
            selected={periodo} 
            setSelected={setPeriodo} 
          />
          {/* Desplegable de Carrera */}
          <FilterDropdown 
            title="Carrera" 
            options={carreras} 
            selected={carrera} 
            setSelected={setCarrera} 
          />
          {/* Desplegable de Semestre */}
          <FilterDropdown 
            title="Semestre" 
            options={semestres} 
            selected={semestre} 
            setSelected={setSemestre} 
          />
        </div>
      </section>

      {/* Sección de Asistencias por Semestre */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Asistencias por Semestre</h2>
        {/* Aquí se podría filtrar la data usando el estado 'periodo', 'carrera' o 'semestre' */}
        <p className="text-gray-400 mb-6">Resumen de asistencias para el periodo {periodo}</p>
        
        <div className="space-y-6">
            {asistenciasPorSemestre.map((data, index) => (
                <AsistenciaSemestreBlock key={index} data={data} />
            ))}
        </div>
      </section>

    </div>
  );
};

export default ControlAsistencias;