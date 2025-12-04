import { useState } from "react";
import { Users, FileText, ArrowRight, LayoutGrid, List, Calendar, Clock, Tag,PlusCircle } from "lucide-react";
import CreateAttendanceModal from "./createAttendanceModal"
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  return new Date(timeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};
 
export default function AttendanceSessionList({ 
    sessions, 
    onSessionSelect,
    sessionsForCreation, 
    onGetStudentsByGroup, 
    onCreateAttendance 
}){
  const [viewMode, setViewMode] = useState("cards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Asistencia Alumnos Hackathon</h1>
            <p className="text-slate-400 text-lg">Selecciona una sesión de evaluación para gestionar</p>
          </div>
          <div className="flex items-center gap-4">
             {/* BOTÓN NUEVA ASISTENCIA */}
             <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg shadow-emerald-900/20 gap-2 h-9"
            >
              <PlusCircle className="w-5 h-5" />
              Nueva Asistencia
            </button>

             {/* SWITCHER DE VISTA EXISTENTE */}
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode("cards")}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-7 px-3 ${
                  viewMode === "cards" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-7 px-3 ${
                  viewMode === "list" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div 
              key={session.idSession}
              onClick={() => onSessionSelect(session)} 
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl cursor-pointer h-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${session.groupColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative border border-slate-200 bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 h-full rounded-xl">
                <div className="flex flex-col space-y-1.5 pb-4 pt-6 px-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{session.groupSemester}</p>
                      <h3 className="text-xl font-bold text-slate-900">{session.groupName}</h3>
                      
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Tag className="w-3 h-3 text-slate-400" /> 
                          ID: {session.idSession}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${session.groupColor} shadow-lg`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium capitalize">{formatDate(session.sessionDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </span>
                    </div>
                  </div>

                </div>
                <div className="px-6 pb-6">
                  <div className="mb-6 mt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      <p className="text-sm text-slate-500 font-medium">Estudiantes en Grupo</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{session.studentsCount}</p>
                  </div>
                  <button className={`inline-flex w-full items-center justify-center bg-gradient-to-r ${session.groupColor} text-white font-semibold py-3 rounded-xl hover:shadow-lg transform transition-all duration-300 hover:scale-105 gap-2 border-0`}>
                    Ver Asistencia <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Fecha / Hora</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Semestre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Grupo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.idSession} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-900 capitalize">{formatDate(session.sessionDate)}</span>
                            <span className="text-xs text-slate-500">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{session.groupSemester}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">
                        {session.groupName} 
                        <span className="ml-2 text-xs text-slate-400 font-normal">(ID: {session.idSession})</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onSessionSelect(session)}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r ${session.groupColor} text-white font-semibold text-sm hover:shadow-lg transition-all transform hover:scale-105`}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* MODAL DE CREACIÓN */}
      <CreateAttendanceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableSessions={sessionsForCreation}
        getStudentsByGroupId={onGetStudentsByGroup}
        onCreate={(payload) => {
            onCreateAttendance(payload);
            setIsModalOpen(false);
        }}
      />
    </div>
  );
}