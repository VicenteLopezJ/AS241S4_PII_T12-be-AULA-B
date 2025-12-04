import React from 'react';
import { AlertCircle, CheckCircle, User } from 'lucide-react';
import { COHORT_STATE } from '../hooks/useCohortLogic'; 

export default function CohortStatusPanel({ 
    comparisonState, 
    targetSemester, 
    validEmailsCount, 
    existingSemesterEmails, 
    onReplaceCohort, 
    onUseExistingCohort 
}) {
    if (comparisonState === COHORT_STATE.MATCH_FULL) {
        return (
            <div className="bg-[#10b981]/10 border border-[#10b981] text-[#10b981] p-3 rounded-lg flex items-center gap-2 mb-4">
                <CheckCircle size={20} />
                <span className="text-sm font-semibold">
                    ¡Coincidencia Perfecta! Cohorte de {targetSemester}º Semestre ya existente y auto-seleccionada.
                </span>
            </div>
        );
    }

    if (comparisonState === COHORT_STATE.NEW_COHORT) {
        return (
            <div className="bg-[#3b82f6]/10 border border-[#3b82f6] text-[#3b82f6] p-3 rounded-lg flex items-center gap-2 mb-4">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold">
                    Nueva Cohorte. Se utilizarán los {validEmailsCount} emails para crear nuevos grupos.
                </span>
            </div>
        );
    }

    if (comparisonState === COHORT_STATE.NEEDS_DECISION) {
        return (
            <div className="p-4 bg-[#0f172a] rounded-lg border border-[#3b82f6] shadow-xl mb-4">
                <h4 className="text-lg font-bold text-[#3b82f6] mb-3">⚠️ Conflicto de Cohorte Detectado</h4>
                <p className="text-sm text-gray-300 mb-4">
                    Ya existen <b>{existingSemesterEmails.length}</b> estudiantes en el <b>{targetSemester}° semestre</b>.
                    El archivo importado contiene <b>{validEmailsCount}</b> estudiantes.
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={onReplaceCohort} className="px-4 py-3 bg-[#f97316] text-white rounded-lg font-bold text-sm hover:bg-[#ea580c] transition-all">
                        Reemplazar con lista importada ({validEmailsCount} estudiantes)
                    </button>
                    <button onClick={onUseExistingCohort} className="px-4 py-3 bg-[#10b981] text-black rounded-lg font-bold text-sm hover:bg-[#059669] transition-all">
                        Usar lista existente ({existingSemesterEmails.length} estudiantes)
                    </button>
                </div>
            </div>
        );
    }

    
    if (targetSemester) {
        return (
            <div className="bg-[#252f3f] border border-[#3a4757] text-gray-400 p-3 rounded-lg flex items-center gap-2 mb-4">
                <User size={20} />
                <span className="text-sm">Esperando lista de emails para el {targetSemester}º Semestre.</span>
            </div>
        );
    }
    
    return null;
}