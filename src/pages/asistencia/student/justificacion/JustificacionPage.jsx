// src/pages/asistencia/student/justificacion/JustificacionPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Tab } from '@headlessui/react';
import JustificacionCard from '../../../../components/asistencia/student/justificacion/JustificacionCard';
import JustificationBatchCard from '../../../../components/asistencia/student/justificacion/JustificationBatchCard';
import NewJustificationSection from '../../../../components/asistencia/student/justificacion/NewJustificationForm';
import NewJustificationBatchForm from '../../../../components/asistencia/student/justificacion/NewJustificationBatchForm';
import JustificationBatchDetailModal from '../../../../components/asistencia/student/justificacion/JustificationBatchDetailModal';
import JustificacionService from '../../../../services/asistencia/student/justificacion/JustificacionService';
import JustificationBatchService from '../../../../services/asistencia/student/justificacion/JustificationBatchService';
import '../../../../styles/asistencia/student/justificacion/Justificacion.css';
import { 
  PlusIcon, 
  ArrowPathIcon, 
  FunnelIcon,
  DocumentTextIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { getCurrentStudentId } from '../../../../services/asistencia/student/studentConfig';

const JustificacionPage = () => {
  const studentId = getCurrentStudentId();

  const [selectedTab, setSelectedTab] = useState(0); 
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  const AUTO_REFRESH_INTERVAL = 30000;
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Estados para Justificaciones Individuales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resendData, setResendData] = useState(null);
  const [justificaciones, setJustificaciones] = useState([]);
  const [loadingIndividual, setLoadingIndividual] = useState(true);
  const [errorIndividual, setErrorIndividual] = useState(null);
  const [filterIndividual, setFilterIndividual] = useState('all');
  const [statsIndividual, setStatsIndividual] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  });

  // Estados para Justificaciones Agrupadas
  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [errorBatch, setErrorBatch] = useState(null);
  const [filterBatch, setFilterBatch] = useState('all');
  const [statsBatch, setStatsBatch] = useState({
    total: 0,
    pendientes: 0,
    aprobados: 0,
    revisados: 0,
    rechazados: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  const fetchJustifications = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadingIndividual(true);
    }
    setErrorIndividual(null);

    try {
      const response = await JustificacionService.getJustificationsByStudent(studentId);
      
      const formattedData = response.map(just => 
        JustificacionService.formatJustificationForDisplay(just)
      );
      setJustificaciones(formattedData);
      const calculatedStats = JustificacionService.getJustificationStats(formattedData);
      setStatsIndividual(calculatedStats);
      setLastUpdate(new Date());
    } catch (err) {
      setErrorIndividual(err.message);
    } finally {
      if (showLoading) {
        setLoadingIndividual(false);
      }
    }
  }, [studentId]);

  const fetchBatches = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadingBatch(true);
    }
    setErrorBatch(null);

    try {
      const response = await JustificationBatchService.getBatchesByStudent(studentId);
      const formattedData = response.map(batch => 
        JustificationBatchService.formatBatchForDisplay(batch)
      );
      setBatches(formattedData);
      const calculatedStats = JustificationBatchService.getBatchStats(formattedData);
      setStatsBatch(calculatedStats);
      setLastUpdate(new Date());
    } catch (err) {
      setErrorBatch(err.message);
    } finally {
      if (showLoading) {
        setLoadingBatch(false);
      }
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedTab === 0) {
      fetchJustifications(true);
    } else {
      fetchBatches(true);
    }
  }, [refreshKey, selectedTab, studentId, fetchJustifications, fetchBatches]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsAutoRefreshing(true);
      
      if (selectedTab === 0) {
        fetchJustifications(false).finally(() => setIsAutoRefreshing(false));
      } else {
        fetchBatches(false).finally(() => setIsAutoRefreshing(false));
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [selectedTab, fetchJustifications, fetchBatches]);

  const handleManualRefresh = async () => {
    setIsAutoRefreshing(true);
    
    if (selectedTab === 0) {
      await fetchJustifications(false);
    } else {
      await fetchBatches(false);
    }
    
    setIsAutoRefreshing(false);
  };

  const getLastUpdateText = () => {
    if (!lastUpdate) return 'Nunca';
    
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    
    if (diff < 60) return `Hace ${diff} segundos`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    return lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const handleResendJustification = (resendInfo) => {
    console.log('📝 Opening resend form with data:', resendInfo);
    setResendData(resendInfo);
    setIsFormOpen(true);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleJustificationCreated = () => {
    setIsFormOpen(false);
    setResendData(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleBatchCreated = () => {
    setIsBatchFormOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleViewDetails = (batchId) => {
    setSelectedBatchId(batchId);
    setIsModalOpen(true);
  };

  const handleCancelBatch = async (batchId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      return;
    }
    try {
      await JustificationBatchService.cancelBatch(batchId);
      alert('Solicitud cancelada exitosamente');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert(`Error al cancelar: ${err.message}`);
    }
  };

  const filteredJustifications = justificaciones.filter(just => {
    if (filterIndividual === 'all') return true;
    return just.estadoRaw === filterIndividual;
  });

  const filteredBatches = batches.filter(batch => {
    if (filterBatch === 'all') return true;
    return batch.estadoRaw === filterBatch;
  });

  return (
    <div className="justificaciones-page">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-300">
              Auto-actualización activa
            </span>
          </div>
          
          <div className="text-xs text-gray-400">
            Última actualización: <strong className="text-gray-300">{getLastUpdateText()}</strong>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isAutoRefreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
            isAutoRefreshing 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          <ArrowPathIcon className={`w-5 h-5 ${isAutoRefreshing ? 'animate-spin' : ''}`} />
          <span>{isAutoRefreshing ? 'Actualizando...' : 'Actualizar Ahora'}</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Mis Justificaciones</h1>
            <p className="text-sm text-gray-400">
              Gestiona justificaciones individuales y agrupadas
            </p>
          </div>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-2 bg-gray-800 p-1 rounded-lg mb-6">
            <Tab
              className={({ selected }) =>
                `w-full py-3 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center ${
                  selected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`
              }
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Justificaciones Individuales ({statsIndividual.total})
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-3 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center ${
                  selected
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`
              }
            >
              <FolderIcon className="w-5 h-5 mr-2" />
              Justificaciones Agrupadas ({statsBatch.total})
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="flex justify-end mb-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200"
                  onClick={() => {
                    setResendData(null);
                    setIsFormOpen(!isFormOpen);
                  }}
                >
                  <PlusIcon className="w-5 h-5 mr-1" />
                  {isFormOpen ? 'Ocultar Formulario' : 'Nueva Justificación'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{statsIndividual.total}</p>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
                  <p className="text-yellow-400 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-300">{statsIndividual.pendientes}</p>
                </div>
                <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                  <p className="text-green-400 text-sm">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-300">{statsIndividual.aprobadas}</p>
                </div>
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                  <p className="text-red-400 text-sm">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-300">{statsIndividual.rechazadas}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Filtrar:</span>
                
                {['all', 'pending', 'approved', 'rejected'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setFilterIndividual(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filterIndividual === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter === 'all' ? 'Todas' : 
                     filter === 'pending' ? 'Pendientes' :
                     filter === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                  </button>
                ))}
              </div>

              <NewJustificationSection
                isVisible={isFormOpen}
                onClose={() => {
                  setIsFormOpen(false);
                  setResendData(null); 
                }}
                onSuccess={handleJustificationCreated}
                resendData={resendData}
              />

              {loadingIndividual ? (
                <div className="flex justify-center items-center h-64">
                  <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
              ) : errorIndividual ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
                  <p>{errorIndividual}</p>
                </div>
              ) : filteredJustifications.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
                  <p className="text-gray-400 text-lg">No tienes justificaciones {filterIndividual !== 'all' ? `con estado "${filterIndividual}"` : 'registradas'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJustifications.map(just => (
                    <JustificacionCard
                      key={just.id}
                      data={just}
                      onUpdate={() => setRefreshKey(prev => prev + 1)}
                      onResend={handleResendJustification}
                    />
                  ))}
                </div>
              )}
            </Tab.Panel>

            <Tab.Panel>
              <div className="flex justify-end mb-4">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200"
                  onClick={() => setIsBatchFormOpen(!isBatchFormOpen)}
                >
                  <PlusIcon className="w-5 h-5 mr-1" />
                  {isBatchFormOpen ? 'Ocultar Formulario' : 'Nueva Solicitud Agrupada'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{statsBatch.total}</p>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
                  <p className="text-yellow-400 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-300">{statsBatch.pendientes}</p>
                </div>
                <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                  <p className="text-green-400 text-sm">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-300">{statsBatch.aprobados}</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                  <p className="text-blue-400 text-sm">Revisados</p>
                  <p className="text-2xl font-bold text-blue-300">{statsBatch.revisados}</p>
                </div>
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                  <p className="text-red-400 text-sm">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-300">{statsBatch.rechazados}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Filtrar:</span>
                
                {['all', 'pending', 'approved', 'reviewed', 'rejected'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setFilterBatch(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filterBatch === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter === 'all' ? 'Todas' : 
                     filter === 'pending' ? 'Pendientes' :
                     filter === 'approved' ? 'Aprobadas' :
                     filter === 'reviewed' ? 'Revisados' : 'Rechazadas'}
                  </button>
                ))}
              </div>

              <NewJustificationBatchForm
                isVisible={isBatchFormOpen}
                onClose={() => setIsBatchFormOpen(false)}
                onSuccess={handleBatchCreated}
              />

              {loadingBatch ? (
                <div className="flex justify-center items-center h-64">
                  <ArrowPathIcon className="w-12 h-12 text-green-500 animate-spin" />
                </div>
              ) : errorBatch ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
                  <p>{errorBatch}</p>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
                  <p className="text-gray-400 text-lg">No tienes solicitudes agrupadas {filterBatch !== 'all' ? `con estado "${filterBatch}"` : 'registradas'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBatches.map(batch => (
                    <JustificationBatchCard
                      key={batch.id}
                      data={batch}
                      onViewDetails={handleViewDetails}
                      onCancel={handleCancelBatch}
                    />
                  ))}
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      <JustificationBatchDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBatchId(null);
        }}
        batchId={selectedBatchId}
      />
    </div>
  );
};

export default JustificacionPage;