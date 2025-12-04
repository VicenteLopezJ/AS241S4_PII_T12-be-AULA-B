import React from 'react';
import { Search, AlertCircle, CheckSquare, Square } from 'lucide-react';

export default function TutorAssignmentModal({
    showTutorModal,
    unassignedEmails,
    handleCloseModal,
    studentSearch,
    setStudentSearch,
    selectedEmailsInModal,
    setSelectedEmailsInModal,
    filteredUnassigned,
    handleToggleEmailSelection,
    teachers, // Lista de tutores
    selectedTutorInModal,
    setSelectedTutorInModal,
    handleAssignTutorBatch // Función para ejecutar la asignación
}) {

    if (!showTutorModal) {
        return null;
    }

    // Determina el texto del botón de cierre
    const closeButtonText = unassignedEmails.length === 0 ? "Finalizar y Guardar" : "Cerrar";
    
    // Determina si el botón de asignación debe estar habilitado
    const canAssign = selectedEmailsInModal.length > 0 && !!selectedTutorInModal;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="bg-[#1e293b] flex flex-col rounded-xl border border-[#334155] w-[900px] h-[80vh] shadow-2xl overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]">
                    <div>
                        <h3 className="text-white font-bold text-lg">Asignación de Tutores</h3>
                        <p className="text-xs text-gray-400">
                            Estudiantes por asignar: <span className="text-orange-400 font-bold">{unassignedEmails.length}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleCloseModal} 
                            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold rounded-lg text-sm transition-all"
                        >
                            {closeButtonText}
                        </button>
                    </div>
                </div>

                {/* --- CONTENT (STUDENTS & TUTORS) --- */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* LEFT PANEL: ESTUDIANTES PENDIENTES */}
                    <div className="w-1/2 border-r border-[#334155] flex flex-col bg-[#1a2332]">
                        <div className="p-3 border-b border-[#334155]">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input 
                                    className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:border-[#3b82f6] outline-none"
                                    placeholder="Buscar estudiante..."
                                    value={studentSearch}
                                    onChange={(e)=>setStudentSearch(e.target.value)}
                                />
                            </div>
                            <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                                <span>Seleccionados: {selectedEmailsInModal.length}</span>
                                <button 
                                    onClick={() => setSelectedEmailsInModal(filteredUnassigned)}
                                    className="text-[#3b82f6] hover:underline"
                                >
                                    Seleccionar todos ({filteredUnassigned.length})
                                </button>
                            </div>
                        </div>

                        {/* Lista de Estudiantes */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                            {filteredUnassigned.length > 0 ? filteredUnassigned.map(email => {
                                const isSelected = selectedEmailsInModal.includes(email);
                                return (
                                    <div 
                                        key={email}
                                        onClick={() => handleToggleEmailSelection(email)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                            ${isSelected 
                                                ? 'bg-[#3b82f6]/10 border-[#3b82f6]' 
                                                : 'bg-[#0f172a] border-transparent hover:bg-[#2d3748]'}
                                        `}
                                    >
                                        {isSelected 
                                            ? <CheckSquare className="text-[#3b82f6]" size={18}/> 
                                            : <Square className="text-gray-500" size={18}/>
                                        }
                                        <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                                            {email}
                                        </span>
                                    </div>
                                )
                            }) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <CheckSquare size={40} className="mb-2"/>
                                    <p>No hay estudiantes pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: TUTOR ACADÉMICO */}
                    <div className="w-1/2 flex flex-col bg-[#0f172a] relative">
                        <div className="p-3 border-b border-[#334155] bg-[#1e293b]">
                            <h4 className="text-sm font-bold text-gray-200">Seleccionar Tutor Académico</h4>
                            <p className="text-xs text-gray-500">
                                Se asignará a los **{selectedEmailsInModal.length}** estudiantes seleccionados.
                            </p>
                        </div>

                        {/* Overlay si no hay estudiantes seleccionados */}
                        {selectedEmailsInModal.length === 0 && (
                             <div className="absolute inset-0 bg-[#0f172a]/80 z-10 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                                 <AlertCircle className="text-gray-500 mb-2" size={32}/>
                                 <p className="text-gray-400 text-sm">Primero selecciona uno o más estudiantes de la izquierda.</p>
                             </div>
                        )}

                        {/* Lista de Tutores */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                            {teachers.map(teacher => {
                                const isSelected = String(selectedTutorInModal) === String(teacher.idTeacher);
                                return (
                                    <label 
                                        key={teacher.idTeacher}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all
                                            ${isSelected 
                                                ? 'bg-[#10b981]/10 border-[#10b981] shadow-md' 
                                                : 'bg-[#1a2332] border-[#334155] hover:border-gray-500'}
                                        `}
                                    >
                                        <input 
                                            type="radio"
                                            name="tutor_selection"
                                            className="hidden"
                                            value={teacher.idTeacher}
                                            onChange={(e) => setSelectedTutorInModal(parseInt(e.target.value))}
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                                            ${isSelected ? 'border-[#10b981]' : 'border-gray-500'}
                                        `}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#10b981]"/>}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {teacher.name} {teacher.surname}
                                            </p>
                                            <p className="text-xs text-gray-500">{teacher.email}</p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>

                        {/* Footer: Botón de Asignación */}
                        <div className="p-4 border-t border-[#334155] bg-[#1e293b]">
                            <button
                                onClick={handleAssignTutorBatch}
                                disabled={!canAssign}
                                className={`w-full py-3 rounded-lg font-bold text-sm transition-all
                                    ${canAssign
                                        ? 'bg-[#10b981] text-black hover:bg-[#059669] shadow-lg shadow-green-900/20 transform hover:-translate-y-0.5'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                Asignar Tutor a {selectedEmailsInModal.length} Estudiante(s)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}