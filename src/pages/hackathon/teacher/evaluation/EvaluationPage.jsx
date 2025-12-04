

import EvaluationGroupList from "../../../../components/hackathon/teacher/evaluation/evaluationList/EvaluationGroupList";
import EvaluationStudentList from "../../../../components/hackathon/teacher/evaluation/evaluationList/EvaluationStudentList";
import { useState, useEffect, useMemo } from "react";
import { Plus, Sun, Moon ,ArrowLeft } from "lucide-react"; 
import { Sidebar, Button } from "../../../../components/hackathon/index"; 
import { useTheme } from '../../../../styles/hackathon/ThemeContext'; 
import { getEvaluations } from "../../../../services/hackathon/evaluationService"; 
import { getGroups } from "../../../../services/hackathon/groupService";
import { getUsersByRole,getUsers } from "../../../../services/hackathon/userService"; 
import { useNavigate } from "react-router-dom"; 

const themeSettings = { 
    bg: "bg-[#232C3A]", 
    text: "text-white" 
};

export default function EvaluationsPage({ setViewMode = () => {} }) {
    const { mode, theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); 
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [rawEvaluations, setRawEvaluations] = useState([]); 
    const [selectedGroupMeta, setSelectedGroupMeta] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {

                const evaluationsResponse = await getEvaluations();
                
                setRawEvaluations(evaluationsResponse||[]); 

            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError(err.message || 'Error al cargar grupos, estudiantes o evaluaciones.'); 
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []); 
    
    

    const uniqueGroups = useMemo(() => { 
        const colors = [
            "from-emerald-400 to-teal-500",
            "from-blue-400 to-cyan-500",
            "from-violet-400 to-purple-500",
            "from-orange-400 to-red-500"
        ];

        const sessionsMap = {};

        rawEvaluations.forEach(evalItem => {
            const id = evalItem.idSession;
            if (!sessionsMap[id]) {
                const colorIndex = id % colors.length;
                sessionsMap[id] = {
                    id: id,
                    sessionDate: evalItem.sessionDate.split('T')[0], 
                    groupName: evalItem.student_group_name, 
                    semester: `${evalItem.student_semester}° Semestre`,
                    challengeTitle: evalItem.challengeTitle,
                    caseDescription: evalItem.caseDescription,
                    students: 0, 
                    color: colors[colorIndex]
                };
            }
            sessionsMap[id].students += 1; 
        });

        
        return Object.values(sessionsMap);
    }, [rawEvaluations]); 

    const currentGroupEvaluations = useMemo(() => {
        if (!selectedGroupMeta) return [];
        
        return rawEvaluations.filter(item => item.idSession === selectedGroupMeta.id);
    }, [rawEvaluations, selectedGroupMeta]);


    const handleGroupSelect = (group) => {
        setSelectedGroupMeta(group);
        setStep(2);
    };

    const handleBack = () => {
        setSelectedGroupMeta(null);
        setStep(1);
    };

    if (loading) {
        return (
            <div className={`flex min-h-screen ${themeSettings.bg} ${themeSettings.text}`}> 
                <Sidebar />
                <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex items-center justify-center">
                    <p className="text-xl">Cargando grupos y evaluaciones...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex min-h-screen ${themeSettings.bg} ${themeSettings.text}`}>
                <Sidebar />
                <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex flex-col items-center justify-center">
                    <p className="text-red-400 text-xl mb-4"> Ha ocurrido un error al cargar los datos.</p>
                    <p className="text-slate-400 text-center mb-6">Detalle del error: {error}</p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        Reintentar
                    </Button>
                </main>
            </div>
        );
    }
    
    
    return (
        <div className={`flex min-h-screen ${themeSettings.bg} ${themeSettings.text}`}> 
            <Sidebar />
            <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h1 className={`text-4xl font-bold ${themeSettings.text} mb-2`}>
                            {step === 1 ? 'Sesiones de Evaluación' : `Evaluación: ${selectedGroupMeta?.challengeTitle}`} {/* 🎯 CAMBIO 1 */}
                        </h1>
                        <p className={`text-slate-400 text-lg`}>
                            {step === 1 ? 'Selecciona una sesión para ver los estudiantes asignados.' : `Sesión ${selectedGroupMeta?.id} (${selectedGroupMeta?.sessionDate}) del Grupo ${selectedGroupMeta?.groupName} en ${selectedGroupMeta?.semester}.`} {/* 🎯 CAMBIO 2 */}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {step === 2 && (
                            <button
                                onClick={handleBack}
                                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 text-white border border-slate-600 hover:bg-slate-800`}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Regresar a Sesiones 
                            </button>
                        )}
                        
                        {step === 1 && (
                            <Button 
                                onClick={() => setViewMode('day')} 
                                variant="ghost" 
                                className={`mr-4 text-white hover:bg-slate-800 border border-slate-700/50`}
                                aria-label="Regresar a mis evaluaciones del día"
                            >
                                <ArrowLeft className="w-6 h-6 mr-2" /> Regresar
                            </Button>
                        )}

                        <button 
                            onClick={toggleTheme} 
                            className={`${themeSettings.text} hover:bg-gray-700/50 p-2 rounded-full transition-colors`}
                            aria-label={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}
                        >
                            {mode === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <section>
                    {step === 1 && (
                        <EvaluationGroupList  
                            groups={uniqueGroups} 
                            onGroupSelect={handleGroupSelect} 
                        />
                    )}

                    {step === 2 && (
                        <EvaluationStudentList 
                            evaluations={currentGroupEvaluations}
                            sessionMeta={selectedGroupMeta} 
                        />
                    )}
                </section>
            </main>
        </div>
    );
}