import React from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import { COHORT_STATE } from '../hooks/useCohortLogic'; 

export default function CapacityAndTutorActionBar({
    selectedGroupIds,
    effectiveCapacity,
    setManualMaxCapacity,
    isAssignmentComplete,
    totalEmails,
    totalAssigned,
    handleOpenTutorModal,
    comparisonState
}) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-[#e4e4e7] mb-2 flex justify-between">
                    <span>Capacidad Máxima</span>
                    {selectedGroupIds.length > 0 && <span className="text-[#f97316] text-xs">(Automático del Grupo)</span>}
                </label>
                <input
                    type="number"
                    min="1"
                    value={effectiveCapacity} 
                    disabled={selectedGroupIds.length > 0} 
                    onChange={(e) => setManualMaxCapacity(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2 text-[#e4e4e7] focus:outline-none focus:border-[#10b981] 
                        ${selectedGroupIds.length > 0 ? 'bg-[#1a2332]/50 border-[#3a4757] text-gray-500 cursor-not-allowed' : 'bg-[#1a2332] border-[#3a4757]'}`}
                />
            </div>

            <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4 flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-bold text-[#e4e4e7]">Asignación de Tutores Académicos</h4>
                    <div className="flex items-center gap-2 mt-1">
                        {isAssignmentComplete ? (
                            <span className="text-xs text-[#10b981] flex items-center gap-1 font-semibold">
                                <CheckCircle size={14}/> Todos los estudiantes tienen tutor.
                            </span>
                        ) : (
                            <span className="text-xs text-[#f97316] flex items-center gap-1 font-semibold">
                                <AlertCircle size={14}/> 
                                Faltan asignar {totalEmails - totalAssigned}.
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleOpenTutorModal}
                    disabled={totalEmails === 0 || comparisonState === COHORT_STATE.NEEDS_DECISION}
                    className={`
                        px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg
                        ${isAssignmentComplete
                            ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981] hover:bg-[#10b981]/20'
                            : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] animate-pulse-slow'
                        }
                        ${(totalEmails === 0 || comparisonState === COHORT_STATE.NEEDS_DECISION) && 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-400 animate-none border-none'}
                    `}
                >
                    <User size={18} />
                    {isAssignmentComplete ? "Editar Asignaciones" : "Asignar Tutores"}
                </button>
            </div> 
        </div>
    );
}