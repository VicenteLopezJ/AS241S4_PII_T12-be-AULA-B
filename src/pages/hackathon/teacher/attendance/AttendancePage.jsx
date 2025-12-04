import { useState, useEffect, useMemo,useCallback } from "react";
import { getAttendanceDetails } from "../../../../services/hackathon/attendanceService"; 
import { getEvaluationSessions } from "../../../../services/hackathon/evaluationSessionService";
import {getChallengeCases} from "../../../../services/hackathon/challengeCaseService";
import { getStudentsByGroup } from "../../../../services/hackathon/userService";
import { Sidebar } from '../../../../components/hackathon/index';
import AttendanceGroupList from "../../../../components/hackathon/teacher/attendance/AttendanceGroupList";
import AttendanceStudentList from "../../../../components/hackathon/teacher/attendance/AttendanceStudentList";
import { useTheme } from "../../../../styles/hackathon/ThemeContext";
import { createAttendance } from "../../../../services/hackathon/attendanceService";

import { getGroups } from "../../../../services/hackathon/groupService"; 

const theme = { 
    bg: "bg-[#232C3A]", 
    text: "text-white" 
};

export default function AttendancePageHackathon() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawGroups, setRawGroups] = useState([]); 
  

  const getStudentsForGroup = async (groupId) => {
        try {
            
            const studentsData = await getStudentsByGroup(groupId);
            
            return studentsData.map(student => ({
                idStudent: student.idStudent || student.id_user,
                name: student.name,
                surname: student.surname,
            }));

        } catch (error) {
            console.error("Error al obtener estudiantes por grupo:", error);
            
            return []; 
        }
    };

  const handleCreateAttendance = async (payload) => {
    try {
        setLoading(true);
        console.log("Enviando Payload:", payload);
        
        
        await createAttendance(payload); 
        
        
        await fetchData(); 
        alert("Asistencia creada con éxito.");
    } catch (error) {
        console.error("Error creando asistencia", error);
        alert(`Error al crear asistencia: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  const [rawAttendance, setRawAttendance] = useState([]);
  const [rawCases, setRawCases] = useState([]);
  const [rawSessions, setRawSessions] = useState([]);

  

const sessionsForCreation = useMemo(() => {
  
    if (!rawSessions.length || !rawCases.length || !rawGroups.length) {
        console.log("Condición inicial fallida: Al menos un array crudo está vacío.");
        return []; 
    }
    
    
    const groupsMap = new Map(rawGroups.map(g => [g.idGroup, g]));

    
    const sessionsWithAttendanceIds = new Set(rawAttendance.map(a => a.idSession));
    console.log(`Sessions with existing Attendance IDs:`, Array.from(sessionsWithAttendanceIds));


    const filteredSessions = rawSessions
        
        .filter(session => {
            const hasAttendance = sessionsWithAttendanceIds.has(session.idSession);
            if(hasAttendance) {
                
            }
            return !hasAttendance;
        })
        .map(session => {
            
            const relatedCase = rawCases.find(c => c.idCase === session.idCase);
            
            if (!relatedCase) {
                console.error(`ERROR: Sesión ID ${session.idSession} no tiene Case asociado.`);
                return null;
            }
            
            const groupId = relatedCase.idGroup;
            
            
            const groupInfo = groupsMap.get(groupId); 

            
            if (groupInfo) {
                console.log(`Sesión ID ${session.idSession}: Group ID ${groupId} encontrado en rawGroups. Nombre: ${groupInfo.name}`);
            } else {
                console.warn(`WARN: Sesión ID ${session.idSession} (Group ID ${groupId}) NO encontrado en rawGroups.`);
            }

            
            const groupName = groupInfo?.name || `Grupo ${groupId}`;
            const groupSemester = groupInfo?.semester ? `${groupInfo.semester}° Semestre` : "N/A";

            return {
                idSession: session.idSession,
                sessionDate: session.sessionDate,
                
                groupId: groupId,
                groupName: groupName, 
                groupSemester: groupSemester
            };
        })
        .filter(item => item !== null);
        
    console.log(`RESULTADO FINAL DE sessionsForCreation (Total: ${filteredSessions.length}):`, filteredSessions);
    console.log("------------------------------------------");
    
    return filteredSessions;
    
}, [rawSessions, rawAttendance, rawCases, rawGroups]);
  const [selectedSessionMeta, setSelectedSessionMeta] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);

        
        const [attendanceData, casesData, sessionsData, groupsData] = await Promise.all([ 
            getAttendanceDetails(),
            getChallengeCases(),
            getEvaluationSessions(),
            getGroups()
        ]);

        
        setRawAttendance(attendanceData);
        setRawCases(casesData);
        setRawSessions(sessionsData);
        setRawGroups(groupsData);
        
        console.log("✅ Datos recargados con éxito.");

    } catch (err) {
        
        const errorMessage = err.response?.data?.message || err.message || "Error desconocido al recargar datos.";
        console.error("Error en fetchData:", errorMessage, err);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const uniqueSessions = useMemo(() => {
    if (!rawAttendance.length || !rawCases.length || !rawSessions.length) return [];

    const groupsInfoMap = {};
    rawAttendance.forEach(record => {
        if (!groupsInfoMap[record.groupId]) {
            groupsInfoMap[record.groupId] = {
                name: record.groupName,
                semester: record.groupSemester,
                studentsCount: 0
            };
        }
        groupsInfoMap[record.groupId].studentsCount += 1;
    });

    const formattedSessions = rawSessions.map(session => {
        const relatedCase = rawCases.find(c => c.idCase === session.idCase);
        const groupId = relatedCase?.idGroup;
        
        const groupInfo = groupsInfoMap[groupId];

        if (!groupInfo) return null; 

        const colors = [
            "from-emerald-400 to-teal-500", 
            "from-blue-400 to-cyan-500", 
            "from-violet-400 to-purple-500",
            "from-orange-400 to-red-500"
        ];
        const colorIndex = groupId % colors.length;

        return {
            idSession: session.idSession,
            sessionDate: session.sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            
            groupId: groupId,
            groupName: groupInfo.name,
            groupSemester: `${groupInfo.semester}° Semestre`,
            studentsCount: groupInfo.studentsCount, 
            groupColor: colors[colorIndex]
        };
    }).filter(item => item !== null); 

    return formattedSessions;

  }, [rawAttendance, rawCases, rawSessions]);

  const currentSessionStudents = useMemo(() => {
    if (!selectedSessionMeta) return [];

    return rawAttendance.filter(item => item.idSession === selectedSessionMeta.idSession);
  }, [rawAttendance, selectedSessionMeta]);

  
  const handleSessionSelect = (session) => {
    setSelectedSessionMeta(session);
    setStep(2);
  };

  const handleBack = () => {
    setSelectedSessionMeta(null);
    setStep(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#232C3A] text-white"> 
        <Sidebar />
        <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex items-center justify-center">
          <p className="text-xl">Cargando sesiones y grupos...</p>
        </main>
      </div>
    );
  }
  if (error) return <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">Error: {error}</div>;

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text}`}>
      <Sidebar />
      <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)]">
        <section>
          {step === 1 && (

            <AttendanceGroupList  
                sessions={uniqueSessions} 
                onSessionSelect={handleSessionSelect} 
                sessionsForCreation={sessionsForCreation}
                onGetStudentsByGroup={getStudentsForGroup}
                onCreateAttendance={handleCreateAttendance}
            />
          )}

          {step === 2 && (
            <AttendanceStudentList 
                groupMeta={selectedSessionMeta} 
                attendanceRecords={currentSessionStudents} 
                onBack={handleBack} 
            />
          )}
        </section>
      </main>
    </div>
  );
}