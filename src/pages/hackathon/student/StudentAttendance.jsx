import { useState, useEffect } from "react";
import { Mail, User, Clock, Check, X, Loader2, AlertCircle } from "lucide-react";

import { getEvaluations } from "../../../services/hackathon/evaluationService";
import { getUsersByRole,logout ,getCurrentUser} from "../../../services/hackathon/userService";
import { getAttendanceDetails, updateAttendanceDetail } from "../../../services/hackathon/attendanceService";
import { useNavigate } from "react-router-dom";
export default function StudentAttendance() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceState, setAttendanceState] = useState({
    marked: false,
    id: null, 
    status: "PENDIENTE",
    arrivalTime: null 
  });

  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const dateString = now.toLocaleDateString("es-ES", options);
      setFormattedDate(dateString.charAt(0).toUpperCase() + dateString.slice(1));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        
        const loggedUser = getCurrentUser();
        if (!loggedUser || !loggedUser.idUser) {
          throw new Error("No se encontró un usuario autenticado.");
        }
        const students = await getUsersByRole("estudiante");
        const myStudent = students.find(s => s.idUser === loggedUser.idUser);

        if (!myStudent) {
          throw new Error("No se encontró información del estudiante asociado.");
        }

        const currentStudentId = myStudent.idStudent;
        const [evaluationsResp, attendanceResp] = await Promise.all([
          getEvaluations(),
          getAttendanceDetails()
        ]);

        let myEval = Array.isArray(evaluationsResp)
          ? evaluationsResp.find(e => e.idStudent === currentStudentId)
          : evaluationsResp;

        if (myEval) {
          setStudentData({
            name: myEval.student_name,
            lastName: myEval.student_surname,
            tutor: myEval.tutor_name,
            group: myEval.student_group_name,
            semester: `${myEval.student_semester}° Semestre`,
            seatNumber: myEval.placement || "Sin Asignar",
            email: myStudent.email,
          });
        } else {
          throw new Error("No se encontró información de evaluación.");
        }

        const myAttendanceRecord = attendanceResp.find(
          r => r.userId === loggedUser.idUser
        );

        if (myAttendanceRecord) {
          const isMarked = myAttendanceRecord.attendanceStatus === "P";
          setAttendanceState({
            marked: isMarked,
            id: myAttendanceRecord.idAttendanceDetail,
            status: myAttendanceRecord.attendanceStatus,
            arrivalTime: myAttendanceRecord.arrivalTime
          });
        }

      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleLogout = () => {
    logout();        
    navigate("/hackathon/login");
  };

  
  const handleMarkAttendance = async () => {
    if (!attendanceState.id) {
        alert("No se encontró una sesión de asistencia activa.");
        return;
    }

    setProcessing(true);
    try {
        const now = new Date();
        
        const formattedTime = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, '0') + "-" +
            String(now.getDate()).padStart(2, '0') + " " +
            String(now.getHours()).padStart(2, '0') + ":" +
            String(now.getMinutes()).padStart(2, '0') + ":" +
            String(now.getSeconds()).padStart(2, '0');

        
        await updateAttendanceDetail(attendanceState.id, {
            arrivalTime: formattedTime,
            attendanceStatus: "P" 
        });

        
        setAttendanceState(prev => ({ 
            ...prev, 
            marked: true, 
            status: "P",
            arrivalTime: formattedTime 
        }));

    } catch (err) {
        console.error("Error al marcar asistencia:", err);
        alert("Error al registrar asistencia. Intenta nuevamente.");
    } finally {
        setProcessing(false);
    }
  };

  
  const formatArrivalTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString.replace(" ", "T")); 
    if (isNaN(date.getTime())) return isoString; 
    return date.toLocaleString("es-ES", { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit',
        day: 'numeric',
        month: 'long'
    });
  };

  

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <span className="ml-3 text-lg">Cargando panel...</span>
        </div>
      );
  }

  if (error || !studentData) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <div className="text-center p-6 bg-slate-800 rounded-xl">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error de Carga</h2>
                <p className="text-slate-400">{error || "No se pudo cargar la información."}</p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Panel del Estudiante</h1>
            <p className="text-slate-400 text-lg capitalize">{formattedDate}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          
          <div className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 pb-4 pt-6 px-6">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-white" />
                <h2 className="text-white font-bold text-lg">Información Personal</h2>
              </div>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Nombre Completo</p>
                <p className="text-lg font-bold text-slate-900">
                  {studentData.name} {studentData.lastName}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Correo Electrónico</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-slate-600 truncate">{studentData.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Tutor</p>
                <p className="text-sm text-slate-700 font-medium">{studentData.tutor}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Asiento (Placement)</p>
                <p className="text-2xl font-bold text-emerald-600">{studentData.seatNumber}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Grupo</p>
                <p className="text-sm text-slate-700 font-medium">
                  {studentData.group} - {studentData.semester}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="px-6 py-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Hora Actual</p>
                <p className="text-xl font-bold text-slate-900">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 pb-6 pt-8 px-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Marcar Asistencia</h2>
                <p className="text-blue-100">Confirma tu asistencia en la clase de hoy</p>
              </div>
            </div>

            <div className="px-8 py-12 flex flex-col items-center justify-center min-h-[384px] flex-grow">
              
              {!attendanceState.marked ? (
                
                <div className="text-center space-y-6 w-full max-w-sm">
                  <div className="space-y-2 mb-8">
                    <p className="text-slate-600 text-lg">¿Estás presente en la clase?</p>
                    <p className="text-sm text-slate-500">Toca el botón para confirmar tu asistencia</p>
                  </div>

                  <button
                    onClick={handleMarkAttendance}
                    disabled={processing || !attendanceState.id}
                    className={`w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-8 px-8 rounded-2xl text-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 border-0 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {processing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" /> Procesando...
                        </>
                    ) : (
                        <>
                            <Check className="w-6 h-6" /> Marcar Asistencia
                        </>
                    )}
                  </button>

                  <button
                    disabled={processing}
                    className="w-full border border-slate-300 text-slate-600 font-semibold py-6 px-8 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 bg-transparent transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    No Asistencia
                  </button>
                </div>
              ) : (
                
                <div className="text-center space-y-6 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-emerald-600">¡Asistencia Confirmada!</h3>
                    <p className="text-slate-600">Tu asistencia ha sido registrada correctamente.</p>
                    <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg mt-2">
                        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Registrado el:</p>
                        <p className="text-lg text-slate-800 font-bold capitalize">
                            {formatArrivalTime(attendanceState.arrivalTime)}
                        </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}