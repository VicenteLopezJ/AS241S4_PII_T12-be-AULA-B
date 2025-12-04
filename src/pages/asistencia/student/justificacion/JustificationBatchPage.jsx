// src/pages/asistencia/student/justificacion/JustificationBatchPage.jsx

import React, { useState, useEffect } from 'react';
import JustificationBatchCard from '../../../../components/asistencia/student/justificacion/JustificationBatchCard';
import NewJustificationBatchForm from '../../../../components/asistencia/student/justificacion/NewJustificationBatchForm';
import JustificationBatchDetailModal from '../../../../components/asistencia/student/justificacion/JustificationBatchDetailModal';
import JustificationBatchService from '../../../../services/asistencia/student/justificacion/JustificationBatchService';
import '../../../../styles/asistencia/student/justificacion/JustificationBatch.css';
import { 
  PlusIcon, 
  ArrowPathIcon, 
  FunnelIcon, 
  ChartBarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const JustificationBatchPage = () => {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [refreshKey, setRefreshKey] = useState(0);


  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobados: 0,
    parciales: 0,
    rechazados: 0,
    dentroPlazo: 0,
    fueraPlazo: 0
  });

  // ========================================
  // Cargar Batches al montar el componente
  // ========================================
  useEffect(() => {
    fetchBatches();
  }, [refreshKey]);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);

    try {
     
      const studentId = getCurrentStudentId();
      const response = await JustificationBatchService.getBatchesByStudent(studentId);
      
      
      const formattedData = response.map(batch => 
        JustificationBatchService.formatBatchForDisplay(batch)
      );

      setBatches(formattedData);

    
      const calculatedStats = JustificationBatchService.getBatchStats(formattedData);
      setStats(calculatedStats);

    } catch (err) {
      setError(err.message);
      console.error('Error loading batches:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Manejar envío exitoso de nuevo batch
  // ========================================
  const handleBatchCreated = () => {
    setIsFormOpen(false);
    setRefreshKey(prev => prev + 1); 
  };

  // ========================================
  // Abrir modal de detalles
  // ========================================
  const handleViewDetails = (batchId) => {
    setSelectedBatchId(batchId);
    setIsModalOpen(true);
  };

  // ========================================
  // Cerrar modal de detalles
  // ========================================
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBatchId(null);
  };

  // ========================================
  // Cancelar batch
  // ========================================
  const handleCancelBatch = async (batchId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      return;
    }

    try {
      await JustificationBatchService.cancelBatch(batchId);
      alert('Solicitud cancelada exitosamente');
      setRefreshKey(prev => prev + 1); // Recargar
    } catch (err) {
      alert(`Error al cancelar: ${err.message}`);
      console.error('Error cancelling batch:', err);
    }
  };

  // ========================================
  // Filtrar batches según el estado
  // ========================================
  const filteredBatches = batches.filter(batch => {
    if (filter === 'all') return true;
    return batch.estadoRaw === filter;
  });

  // ========================================
  // Renderizado condicional de estados
  // ========================================
  if (loading) {
    return (
      <div className="justification-batch-page">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-400">Cargando solicitudes agrupadas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="justification-batch-page">
        <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
          <h3 className="font-bold mb-2">Error al cargar solicitudes</h3>
          <p>{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // Renderizado principal
  // ========================================
  return (
    <div className="justification-batch-page">
      
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Justificaciones Agrupadas</h1>
            <p className="text-sm text-gray-400">
              Gestiona múltiples faltas con una sola solicitud
            </p>
          </div>

          <div className="flex space-x-3">
         
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200"
            >
              <ArrowPathIcon className="w-5 h-5 mr-1" />
              Refrescar
            </button>

            
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200"
              onClick={() => setIsFormOpen(!isFormOpen)}
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              {isFormOpen ? 'Ocultar Formulario' : 'Nueva Solicitud Agrupada'}
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
            <p className="text-yellow-400 text-sm">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-300">{stats.pendientes}</p>
            <p className="text-xs text-yellow-500 mt-1">En revisión</p>
          </div>

          <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
            <p className="text-green-400 text-sm">Aprobadas</p>
            <p className="text-2xl font-bold text-green-300">{stats.aprobados}</p>
            <p className="text-xs text-green-500 mt-1">Tasa: {stats.tasaAprobacion}%</p>
          </div>

          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
            <p className="text-blue-400 text-sm">Parciales</p>
            <p className="text-2xl font-bold text-blue-300">{stats.parciales}</p>
            <p className="text-xs text-blue-500 mt-1">Mixtas</p>
          </div>

          <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
            <p className="text-red-400 text-sm">Rechazadas</p>
            <p className="text-2xl font-bold text-red-300">{stats.rechazados}</p>
            <p className="text-xs text-red-500 mt-1">Denegadas</p>
          </div>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Cumplimiento de Plazo</p>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-green-400 font-bold text-lg">{stats.dentroPlazo}</p>
                <p className="text-xs text-gray-500">Dentro de 48h</p>
              </div>
              <div>
                <p className="text-red-400 font-bold text-lg">{stats.fueraPlazo}</p>
                <p className="text-xs text-gray-500">Fuera de plazo</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Promedio</p>
            <p className="text-white font-bold text-2xl">
              {stats.promFaltasPorBatch}
            </p>
            <p className="text-xs text-gray-500">Faltas por solicitud</p>
          </div>
        </div>

      
        <div className="flex items-center space-x-3 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm">Filtrar:</span>
          
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todas ({stats.total})
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pendientes ({stats.pendientes})
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Aprobadas ({stats.aprobados})
          </button>

          <button
            onClick={() => setFilter('partial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'partial'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Parciales ({stats.parciales})
          </button>

          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Rechazadas ({stats.rechazados})
          </button>
        </div>
      </div>

    
      <NewJustificationBatchForm
        isVisible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleBatchCreated}
      />

     
      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
            <ExclamationCircleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {filter === 'all'
                ? 'No tienes solicitudes agrupadas registradas.'
                : `No hay solicitudes con estado "${filter}".`}
            </p>
            {filter === 'all' && (
              <p className="text-gray-500 text-sm mb-4">
                Las solicitudes agrupadas te permiten justificar múltiples faltas con un solo documento.
              </p>
            )}
            {filter === 'all' && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Crear mi primera solicitud agrupada
              </button>
            )}
          </div>
        ) : (
          filteredBatches.map(batch => (
            <JustificationBatchCard
              key={batch.id}
              data={batch}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelBatch}
            />
          ))
        )}
      </div>

      
      <JustificationBatchDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        batchId={selectedBatchId}
      />

      
      {batches.length === 0 && !isFormOpen && (
        <div className="fixed bottom-6 right-6 bg-blue-900 border border-blue-700 p-4 rounded-lg shadow-2xl max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-800 rounded-full p-2">
              <ExclamationCircleIcon className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h4 className="text-blue-200 font-bold mb-1">💡 ¿Qué son las Solicitudes Agrupadas?</h4>
              <p className="text-blue-300 text-sm mb-3">
                Justifica múltiples faltas a la vez con un solo documento. 
                Ideal para enfermedades prolongadas o emergencias familiares.
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
              >
                Crear solicitud
              </button>
            </div>
            <button
              onClick={() => document.querySelector('.fixed.bottom-6').style.display = 'none'}
              className="text-blue-400 hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JustificationBatchPage;