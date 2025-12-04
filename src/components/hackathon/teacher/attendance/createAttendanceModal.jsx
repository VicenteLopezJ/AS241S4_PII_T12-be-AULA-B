import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Calendar, Clock, CheckCircle2, Users, FileText } from 'lucide-react';

function CreateAttendanceModal({
    isOpen,
    onClose,
    availableSessions, 
    getStudentsByGroupId, 
    onCreate 
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSession, setSelectedSession] = useState(null);
    const [description, setDescription] = useState("");
    const [studentsPreview, setStudentsPreview] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            setSelectedSession(null);
            setDescription("");
            setStudentsPreview([]);
            setSearchTerm("");
        }
    }, [isOpen]);

    
    useEffect(() => {
        if (selectedSession) {
            const loadStudents = async () => {
                setLoadingStudents(true);
                try {
                    const students = await getStudentsByGroupId(selectedSession.groupId);
                    setStudentsPreview(students);
                } catch (error) {
                    setStudentsPreview([]);
                } finally {
                    setLoadingStudents(false);
                }
            };

            loadStudents();
        }
    }, [selectedSession, getStudentsByGroupId]);


    const handleCreate = () => {
        if (!selectedSession) return;

        const now = new Date();
        const attendancePayload = {
            idAttendance: null,
            idGroup: selectedSession.groupId,
            attendanceDate: now.toISOString().split('T')[0], 
            description: description,
            status: 1,
            details: studentsPreview.map(student => ({
                idAttendanceDetail: null,
                idSession: selectedSession.idSession,
                idStudent: student.idStudent, 
                attendanceStatus: "A", 
                arrivalTime: null,
                action: "CREATE"
            }))
        };

        onCreate(attendancePayload);
    }; 

    if (!isOpen) return null;

    const filteredSessions = availableSessions.filter(s => 
        s.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log(filteredSessions);
    
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="bg-[#1e293b] flex flex-col rounded-xl border border-[#334155] w-[1000px] h-[85vh] shadow-2xl overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="p-5 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]">
                    <div>
                        <h3 className="text-white font-bold text-xl">Nueva Lista de Asistencia</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Sesiones pendientes de registro: <span className="text-emerald-400 font-bold">{availableSessions.length}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg text-sm transition-all"
                    >
                        Cancelar
                    </button>
                </div>

                {/* --- CONTENT --- */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* LEFT: SELECCIÓN DE SESIÓN */}
                    <div className="w-5/12 border-r border-[#334155] flex flex-col bg-[#1a2332]">
                        <div className="p-4 border-b border-[#334155]">
                            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">1. Selecciona una Sesión</h4>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input 
                                    className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Buscar por nombre de grupo..."
                                    value={searchTerm}
                                    onChange={(e)=>setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
                            {filteredSessions.length > 0 ? filteredSessions.map(session => {
                                const isSelected = selectedSession?.idSession === session.idSession;
                                return (
                                    <div 
                                        key={session.idSession}
                                        onClick={() => setSelectedSession(session)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden
                                            ${isSelected 
                                                ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50' 
                                                : 'bg-[#0f172a] border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                                {session.groupSemester}
                                            </span>
                                            {isSelected && <CheckCircle2 className="text-emerald-500 w-5 h-5" />}
                                        </div>
                                        <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                            {session.groupName}
                                        </h4>
                                        <div className="flex flex-col gap-1 mt-2 text-xs text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> 
                                                {new Date(session.sessionDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {session.startTime} - {session.endTime}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-10 text-slate-500">
                                    <p>No se encontraron sesiones pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: FORMULARIO */}
                    <div className="w-7/12 flex flex-col bg-[#0f172a] relative">
                        {selectedSession ? (
                            <div className="flex flex-col h-full">
                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <h4 className="text-sm font-semibold text-emerald-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-4 h-4"/> 2. Detalles del Registro
                                    </h4>

                                    <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700 mb-6">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Descripción de la Actividad
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none min-h-[100px]"
                                            placeholder="Ej: Evaluación final del sprint 1..."
                                        />
                                    </div>

                                    <h4 className="text-sm font-semibold text-emerald-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Users className="w-4 h-4"/> 3. Estudiantes a Registrar ({studentsPreview.length})
                                    </h4>
                                    
                                    <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-slate-400">
                                                <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                                                    <tr>
                                                        <th className="px-4 py-3">Estudiante</th>
                                                        <th className="px-4 py-3">Estado Inicial</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentsPreview.map((student, idx) => (
                                                        <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                                            <td className="px-4 py-3 font-medium text-white">
                                                                {student.name} {student.surname}
                                                            </td>
                                                            <td className="px-4 py-3 text-emerald-400">
                                                                Presente (A)
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {studentsPreview.length === 0 && (
                                                <div className="p-4 text-center text-slate-500">
                                                    No hay estudiantes en este grupo
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="p-5 border-t border-[#334155] bg-[#1e293b]">
                                    <button
                                        onClick={handleCreate}
                                        disabled={!description || studentsPreview.length === 0}
                                        className={`w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
                                            ${(!description || studentsPreview.length === 0)
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-900/20 transform hover:-translate-y-0.5'}
                                        `}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Guardar Asistencia
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                                <AlertCircle className="w-16 h-16 text-slate-400 mb-4"/>
                                <h3 className="text-xl font-bold text-white mb-2">Sin sesión seleccionada</h3>
                                <p className="text-slate-400">Selecciona una sesión del panel izquierdo para comenzar el registro.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAttendanceModal;