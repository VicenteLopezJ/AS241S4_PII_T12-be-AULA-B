import React from 'react';

export default function StatsAndDistributionDashboard({
    totalStudentsToList,
    minGroups,
    effectiveCapacity
}) {
    return (
        <>
            {/* Fila de Estadísticas Clave */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
                    <div className="text-sm text-[#8b94a8] mb-1">Total Estudiantes</div>
                    <div className="text-3xl font-bold text-[#10b981]">{totalStudentsToList}</div>
                </div>
                <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
                    <div className="text-sm text-[#8b94a8] mb-1">Grupos Necesarios</div>
                    <div className="text-3xl font-bold text-[#10b981]">{minGroups}</div>
                </div>
                <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
                    <div className="text-sm text-[#8b94a8] mb-1">Max Estudiantes</div>
                    <div className="text-3xl font-bold text-[#f97316]">{effectiveCapacity}</div>
                </div>
            </div>

            {/* Distribución Estimada */}
            {totalStudentsToList > 0 && (
                <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4 mt-4">
                    <div className="text-sm font-semibold text-[#e4e4e7] mb-2">Distribución Estimada</div>
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: minGroups }).map((_, i) => {
                            // Cálculo de estudiantes por grupo para la previsualización
                            const studentsInGroup = Math.min(effectiveCapacity, totalStudentsToList - i * effectiveCapacity);
                            return (
                                <div key={i} className="bg-[#252f3f] rounded-lg p-2 text-center">
                                    <div className="text-xs text-[#8b94a8]">Grupo {i + 1}</div>
                                    <div className="text-lg font-bold text-[#10b981]">{studentsInGroup}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}