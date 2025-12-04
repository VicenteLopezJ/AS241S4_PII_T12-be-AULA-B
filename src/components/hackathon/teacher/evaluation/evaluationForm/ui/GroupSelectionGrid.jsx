import React from 'react';

export default function GroupSelectionGrid({ 
    availableGroups, 
    selectedGroupIds, 
    dbStudents, 
    targetSemester, 
    comparisonState, 
    COHORT_STATE,
    onToggleGroup 
}) {
    // Helper para estados deshabilitados
    const isInteractionDisabled = comparisonState === COHORT_STATE.MATCH_FULL || comparisonState === COHORT_STATE.NEEDS_DECISION;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {availableGroups.length > 0 ? availableGroups.map(group => {
                const isSelected = selectedGroupIds.includes(group.idGroup);
                const currentEnrollment = dbStudents.filter(s => s.idGroup === group.idGroup).length;
                const maxCap = group.maxStudents || group.max_students || 25;

                return (
                    <button
                        key={group.idGroup}
                        onClick={() => !isInteractionDisabled && onToggleGroup(group)}
                        disabled={isInteractionDisabled}
                        className={`
                            flex flex-col items-start justify-center p-3 rounded-lg border text-sm transition-all relative
                            ${isSelected 
                                ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' 
                                : isInteractionDisabled
                                    ? 'bg-[#252f3f]/50 border-[#3a4757]/50 text-[#e4e4e7]/50 cursor-not-allowed'
                                    : 'bg-[#252f3f] border-transparent text-[#e4e4e7] hover:bg-[#2d3748]'}
                        `}
                    >
                        <span className="font-bold">{group.name}</span>
                        <div className="flex justify-between w-full text-xs opacity-70 mt-1">
                            <span>👥 {currentEnrollment} / {maxCap}</span>
                            <span>📅 Sem: {group.semester}</span>
                        </div>
                    </button>
                );
            }) : (
                <p className="text-xs text-gray-500 col-span-full">
                    {targetSemester
                        ? `No hay grupos registrados para el ${targetSemester}º Semestre. Se creará uno nuevo automáticamente.`
                        : "Selecciona el Semestre en el paso 1."
                    }
                </p>
            )}
        </div>
    );
}