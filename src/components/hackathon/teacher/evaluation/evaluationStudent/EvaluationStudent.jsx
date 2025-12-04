'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react'
import {Sidebar} from '../../../index' 
import { getEvaluationById, updateEvaluation } from '../../../../../services/hackathon/evaluationService'; 

const groupCriteriaByTrack = (details) => {
    
    const grouped = { 1: [], 2: [], 3: [] };

    details.forEach(detail => {
        const maxPoints = detail.maxScore || 0;
        const score = detail.scoreObtained || 0;
        const observation = detail.observation || ''; 
        let status = 'pending';

        
        if (score >= maxPoints && maxPoints > 0) {
            status = 'completed';
        } else if (score > 0 && score < maxPoints) {
            status = 'failed';
        } else if (score === 0 && observation.trim().length > 0) {
            status = 'failed';
        }

        let multiplier = 0;
        if (maxPoints > 0) multiplier = score / maxPoints;

        const mappedCriterion = {
            ...detail,
            description: detail.criterionDescription || "Sin descripción", 
            points: maxPoints,
            status: status,
            observation: detail.observation || '',
            multiplier: multiplier,
            
            
            track: detail.track || 1 
        };

        
        const trackKey = String(detail.track) || '1'; 
        if (grouped[trackKey]) {
            grouped[trackKey].push(mappedCriterion);
        } else {
            
            grouped['1'].push(mappedCriterion); 
        }
    });

    return grouped;
};

export default function EvaluateStudentPage({ evaluationId, onBack }) {
  
  const [loading, setLoading] = useState(true);
  const [evaluationData, setEvaluationData] = useState(null); 
  const [criteriaByTrack, setCriteriaByTrack] = useState({ 1: [], 2: [], 3: [] });  
  const [activeTab, setActiveTab] = useState('criteria');
  const [selectedCriterion, setSelectedCriterion] = useState(null); 
  const [selectedCriterionPath, setSelectedCriterionPath] = useState(null);
  const [selectedCriterionIndex, setSelectedCriterionIndex] = useState(null); 
  const [tempObservation, setTempObservation] = useState('');
  const [tempScoreMultiplier, setTempScoreMultiplier] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
        const fetchData = async () => {
            if (!evaluationId) return;
            setLoading(true);
            try {
                const data = await getEvaluationById(evaluationId);
                setEvaluationData(data);
                
                
                const grouped = groupCriteriaByTrack(data.details);
                setCriteriaByTrack(grouped);
                
            } catch (error) {
                console.error("Error cargando evaluación", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [evaluationId]);

    const allCriteria = Object.values(criteriaByTrack).flat();
    const completedCount = allCriteria.filter(c => c.status === 'completed').length;
    const pendingCount = allCriteria.filter(c => c.status === 'pending').length;
    const failedCount = allCriteria.filter(c => c.status === 'failed').length; 
    const totalPointsEarned = allCriteria.reduce((total, c) => total + (c.points * c.multiplier), 0);
    const totalPossiblePoints = allCriteria.reduce((total, c) => total + c.points, 0);

    
    const handleCriterionClick = useCallback((track, idx) => {
        const criterion = criteriaByTrack[track][idx];
        setSelectedCriterion(criterion);
        setSelectedCriterionPath({ track, index: idx }); 
        setTempObservation(criterion.observation || '');
        setTempScoreMultiplier(criterion.multiplier);
        setValidationError('');
    }, [criteriaByTrack]);

  const handleSaveObservation = async () => {
        if (!selectedCriterionPath) return;
        
        
        const { track, index } = selectedCriterionPath; 
        
        if (tempScoreMultiplier < 1 && tempObservation.trim() === '') {
            setValidationError('Es obligatorio dejar una observación si el criterio no está completo.');
            return; 
        }
        setValidationError('');
        setIsSaving(true);
        try {
            
            const currentCriterion = criteriaByTrack[track][index]; 
            const newScore = currentCriterion.points * tempScoreMultiplier;
            
            
            const payload = {
                idStudent: evaluationData.idStudent, 
                idTeacher: evaluationData.idTeacher, 
                idSession: evaluationData.idSession, 
                details: [
                    {
                        
                        ...(currentCriterion.idEvalDetail && { idEvalDetail: currentCriterion.idEvalDetail }),
                        idCriterion: currentCriterion.idCriterion,
                        scoreObtained: newScore,
                        observation: tempObservation
                    }
                ]
            };
        
            await updateEvaluation(evaluationId, payload);

            
            const newStatus = tempScoreMultiplier === 1 
                ? 'completed' 
                : (tempScoreMultiplier > 0 || tempObservation.trim().length > 0) ? 'failed' : 'pending';

            
            const updatedCriteriaByTrack = { ...criteriaByTrack };
            
            const updatedTrackCriteria = [...updatedCriteriaByTrack[track]]; 
            
            updatedTrackCriteria[index] = {
                ...currentCriterion,
                observation: tempObservation,
                multiplier: tempScoreMultiplier,
                scoreObtained: newScore,
                status: newStatus 
            };
            
            updatedCriteriaByTrack[track] = updatedTrackCriteria;

            
            setCriteriaByTrack(updatedCriteriaByTrack);
            setSelectedCriterionPath(null); 
            setSelectedCriterion(null); 

        } catch (error) {
            console.error("Error al guardar", error);
            
        } finally {
            setIsSaving(false);
        }
  };

  const handleCheckboxChangeInDialog = () => {
    
    if (tempScoreMultiplier === 1) {
        setTempScoreMultiplier(0);
    } else {
        setTempScoreMultiplier(1);
    }
  };

  if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
            <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
            <span className="ml-2">Cargando evaluación...</span>
        </div>
      );
  }

  if (!evaluationData) {
      return <div className="text-white p-10">No se encontró la evaluación.</div>;
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-65 w-[calc(100vw-17rem)]">

        <div className="flex-1 overflow-auto bg-slate-900 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div 
                onClick={onBack}
                className="flex items-center gap-2 text-teal-500 cursor-pointer hover:text-teal-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Volver</span>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h1 className="text-2xl font-bold text-white mb-4">
                {evaluationData.student_name} {evaluationData.student_surname}
              </h1>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Semestre</p>
                  <p className="text-lg font-semibold text-white">{evaluationData.student_semester || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Grupo</p>
                  <p className="text-lg font-semibold text-white">{evaluationData.student_group_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Tutor</p>
                  <p className="text-lg font-semibold text-white">{evaluationData.tutor_name || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Reto</p>
                  <p className="text-sm font-semibold text-teal-500 truncate" title={evaluationData.challengeTitle}>
                    {evaluationData.challengeTitle || 'Sin reto'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('criteria')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'criteria'
                    ? 'text-teal-500 border-b-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Criterios
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'summary'
                    ? 'text-teal-500 border-b-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Resumen
              </button>
            </div>

            {activeTab === 'criteria' && (
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Total Criterios</p>
                      <p className="text-4xl font-bold text-white">{allCriteria.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Completados</p>
                      <p className="text-4xl font-bold text-teal-500">{completedCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Pendientes</p>
                      <p className="text-4xl font-bold text-amber-500">{pendingCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Parcial/Fallo</p>
                      <p className="text-4xl font-bold text-red-500">{failedCount}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6"> {/* Espacio para la lista de Tracks */}
            <h2 className="text-lg font-semibold text-white">Evaluación de Criterios por Track</h2>

            {/* Iterar sobre los tracks (1, 2, 3) */}
            {Object.entries(criteriaByTrack).map(([track, criteriaList]) => {
                
                if (criteriaList.length === 0) return null; 

                const trackCompletedCount = criteriaList.filter(c => c.status === 'completed').length;
                const trackTotalCount = criteriaList.length;

                return (
                    <div key={track} className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        {/* 🏆 ENCABEZADO DEL TRACK */}
                        <div className="flex justify-between items-baseline mb-2 border-b border-slate-700 pb-2">
                            <h3 className="text-xl font-bold text-teal-400">
                                🚀 Track {track}
                            </h3>
                            <span className="text-sm text-slate-500 font-medium">
                                {trackCompletedCount} / {trackTotalCount} completados
                            </span>
                        </div>
                        
                        {/* LISTA DE CRITERIOS DEL TRACK */}
                        <div className="space-y-3">
                          {criteriaList.map((criterion, idx) => (
                              <div
                                  key={criterion.idCriterion || idx}
                                    
                                  onClick={() => handleCriterionClick(track, idx)} 
                                  className="bg-slate-700/50 rounded-lg p-3 border border-slate-700 flex items-center gap-4 hover:border-teal-500 hover:bg-slate-750 cursor-pointer transition-all"
                              >
                                   {/* Icono de Status (Se mantiene igual) */}
                                  <div className="flex-shrink-0">
                                      {criterion.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                                      {criterion.status === 'pending' && <Circle className="w-5 h-5 text-amber-500" />}
                                      {criterion.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-white font-medium text-sm">{criterion.description}</p>
                                      {criterion.observation && (
                                              <p className="text-slate-400 text-xs mt-1 truncate max-w-md">
                                              📝 {criterion.observation}
                                              </p>
                                      )}
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                      <p className="text-slate-400 text-sm font-semibold">
                                          {(criterion.points * criterion.multiplier).toFixed(1)} / {criterion.points.toFixed(1)} ptos
                                      </p>
                                  </div>
                              </div>
                            ))}
                        </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
            <div className="space-y-6">
                
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="space-y-4">
                    <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Descripción del Caso</p>
                    <p className="text-white">{evaluationData.caseDescription || 'Sin descripción'}</p>
                    </div>
                    <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Descripción del Reto</p>
                    <p className="text-white">{evaluationData.challengeDescription || 'Sin descripción'}</p>
                    </div>
                </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    Observaciones Registradas
                </h3>

                {allCriteria.filter(c => c.observation && c.observation.trim() !== '').length > 0 ? (
                  <div className="space-y-3">
                  {allCriteria
                      .filter(c => c.observation && c.observation.trim() !== '')
                      .map((criterion, idx) => (
                      <div 
                          key={criterion.idCriterion || idx} 
                          className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 flex flex-col gap-2"
                      >
                          <div className="flex justify-between items-start">
                              <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                                  {/* Ahora incluimos el track al que pertenece, para mejor contexto */}
                                  Track {criterion.track}: {criterion.description} 
                              </p>
                              <span className="text-xs text-slate-500">
                                  {(criterion.points * criterion.multiplier).toFixed(1)} pts
                              </span>
                          </div>
                          
                          <div className="flex gap-2 mt-1">
                              <span className="text-slate-500">↳</span>
                              <p className="text-slate-200 text-sm italic">
                              "{criterion.observation}"
                              </p>
                          </div>
                      </div>
                      ))}
                  </div>
              ) : (
                  
                  <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-slate-700 rounded-lg">
                  <p className="text-slate-500 italic">No hay observaciones registradas.</p>
                  <p className="text-xs text-slate-600 mt-1">Agrega comentarios en la pestaña de criterios.</p>
                  </div>
              )}
                </div>

                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex items-center justify-between">
                <p className="text-slate-400 font-medium">Puntuación Total</p>
                <p className="text-4xl font-bold text-teal-500">
                    {totalPointsEarned.toFixed(1)} / {totalPossiblePoints.toFixed(1)}
                </p>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {selectedCriterionPath !== null && selectedCriterion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Evaluación de Criterio</h3>
            <p className="text-slate-300 text-sm">{selectedCriterion.description}</p>

            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
              <input
                type="checkbox"
                checked={tempScoreMultiplier === 1}
                onChange={handleCheckboxChangeInDialog}
                className="w-5 h-5 rounded border-slate-600 accent-teal-500 cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-white">Criterio Completado</p>
                <p className="text-xs text-slate-400">
                    {tempScoreMultiplier === 1 ? 'Completado (100%)' : 'Incompleto / Parcial'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                    <span>
                    Observación
                    {tempScoreMultiplier < 1 && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    
                    {tempScoreMultiplier < 1 && (
                        <span className="text-xs text-amber-500 italic">Requerido para justificar la nota</span>
                    )}
                </label>

                <textarea
                    value={tempObservation}
                    onChange={(e) => {
                        setTempObservation(e.target.value);
                        if(validationError) setValidationError(''); 
                    }}
                    
                    className={`w-full bg-slate-700 border rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        validationError 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-slate-600 focus:border-teal-500'
                    }`}
                    placeholder={tempScoreMultiplier < 1 ? "Explica por qué no se cumplió el criterio..." : "Comentarios opcionales..."}
                    rows={3}
                />
                
                {validationError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {validationError}
                    </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Puntaje Manual: {(selectedCriterion.points * tempScoreMultiplier).toFixed(1)} / {selectedCriterion.points.toFixed(1)} ptos
                </label>
                <div className="flex gap-2">
                  {[1, 0.5, 0].map((val) => (
                      <button
                        key={val}
                        onClick={() => setTempScoreMultiplier(val)}
                        className={`flex-1 py-2 rounded font-medium transition-colors ${
                          tempScoreMultiplier === val
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {val * 100}%
                      </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                    setSelectedCriterionPath(null);
                    setSelectedCriterion(null); 
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded font-medium hover:bg-slate-600 transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveObservation}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded font-medium hover:bg-teal-600 transition-colors flex justify-center items-center"
              >
                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}