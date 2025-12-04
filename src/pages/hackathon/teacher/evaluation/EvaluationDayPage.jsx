import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, TrendingUp, Sun, Moon,FileText } from 'lucide-react';
import { Sidebar, Button } from '../../../../components/hackathon/index';
import EvaluationDayList from '../../../../components/hackathon/teacher/evaluation/evaluationList/EvaluationDayList';
import { getEvaluations } from '../../../../services/hackathon/evaluationService';
import { getUsersByRole, getCurrentUser } from '../../../../services/hackathon/userService';
import { useTheme } from '../../../../styles/hackathon/ThemeContext';
import EvaluationPage from './EvaluationPage';
import EvaluationStudent from '../../../../components/hackathon/teacher/evaluation/evaluationStudent/EvaluationStudent';
import { Navigate, useNavigate } from 'react-router-dom';

const isToday = (evaluationDate) => {
  if (!evaluationDate) return false;
  const today = new Date();
  const date = new Date(evaluationDate);
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const EvaluationDayPage = () => {
  const navigate= useNavigate();
  const { mode, theme, toggleTheme } = useTheme();
  const [evaluations, setEvaluations] = useState([]);
  
  const SummaryCard = ({ title, count, icon: Icon, bgColor, iconColor, countColor }) => (
    <div className={`flex flex-col p-6 rounded-xl ${bgColor} shadow-lg w_full`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-4xl font-bold ${countColor}`}>{count}</span>
          <span className={`text-2xl font-bold ${theme.summaryCardText}`}>{title}</span>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  );
  
  const [summaryStats, setSummaryStats] = useState({
    evaluados: 0,
    pendientes: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseInfo, setCourseInfo] = useState({ semester: '', group: '' });
  
  
  const [viewMode, setViewMode] = useState('day');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null); 

  const fetchDashboardData = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
          let teacherId=null; 
          let loggedUser=getCurrentUser();

          if (!loggedUser || !loggedUser.idUser) {
                throw new Error("No se encontró un usuario autenticado."); 
            }
          const teachers = await getUsersByRole("profesor");
          console.log(teachers)
          const myTeacher = teachers.find(t => t.idUser === loggedUser.idUser);
          if (!myTeacher) {
                throw new Error("No se encontró información del profesor asociado para el usuario.");
          }

          const isTutor = myTeacher.isTutor === 'S';

          if (isTutor) {
                teacherId = myTeacher.idTeacher; 
            } else {
                teacherId = null; 
                console.log("Usuario identificado como profesor NO tutor. No se cargarán evaluaciones.");
          }

          if (teacherId === null) {
                setSummaryStats({ total: 0, evaluados: 0, pendientes: 0 });
                setEvaluations([]);
                setCourseInfo({ semester: "", group: "" });
                setLoading(false);
                return; 
          }
          


          const allEvaluations = await getEvaluations();
          const todayEvaluationsForTeacher = allEvaluations
              .filter(ev => 
                  ev.idTeacher === teacherId && isToday(ev.sessionDate)
              )
              .map(ev => ({
                  ...ev,
                  avatar_color: "bg-blue-500"
              }));


          const total = todayEvaluationsForTeacher.length;
          const evaluados = todayEvaluationsForTeacher.filter(
              ev => ev.evaluationState && ev.evaluationState !== "PENDIENTE"
          ).length;
          const pendientes = total - evaluados;

          setSummaryStats({ total, evaluados, pendientes });
          setEvaluations(todayEvaluationsForTeacher);

          if (todayEvaluationsForTeacher.length > 0) {
              const firstEval = todayEvaluationsForTeacher[0];
              setCourseInfo({
                  semester: firstEval.student_semester || "",
                  group: firstEval.student_group_name || ""
              });
          } else {
              setCourseInfo({ semester: "", group: "" });
          }


      } catch (err) {
          console.error("Error al cargar el dashboard:", err);
          setError(err.message || "No se pudo cargar la información del dashboard."); 
      } finally {
          setLoading(false);
      }
  }, []);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleEvaluate = (evaluationId) => {
    setSelectedEvaluationId(evaluationId);
  };

  const handleBackFromEvaluate = () => {
    setSelectedEvaluationId(null);
    fetchDashboardData(); 
  };

  if (loading) {
    return (
        <div className={`flex min-h-screen ${theme.bg} ${theme.text}`}> 
            <Sidebar />
            <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex items-center justify-center">
                  <p className="text-xl">Cargando sus evaluaciones...</p>
            </main>
        </div>
    );
  }

  if (error) {
    return (
      <div className={`flex min-h-screen ${theme.bg} ${theme.text}`}>
        <Sidebar />
        <main className="flex-grow p-8 flex flex-col items-center justify-center">
          <p className="text-xl text-red-500">{error}</p>
          <button onClick={fetchDashboardData} className="mt-4 p-2 bg-blue-500 rounded">
            Reintentar
          </button>
        </main>
      </div>
    );
  }

  
  if (selectedEvaluationId) {
      return (
        <EvaluationStudent 
            evaluationId={selectedEvaluationId} 
            onBack={handleBackFromEvaluate} 
        />
      );
  }

  
  if (viewMode === 'all') {
      return <EvaluationPage setViewMode={setViewMode} />; 
  }

  
  const summaryCardsData = [
    {
      title: 'Evaluados',
      count: summaryStats.evaluados,
      icon: CheckCircle,
      bgColor: theme.summaryBg1,
      iconColor: 'text-[#00A76F]',
      countColor: 'text-[#00A76F]',
    },
    {
      title: 'Pendientes',
      count: summaryStats.pendientes,
      icon: Clock,
      bgColor: theme.summaryBg2,
      iconColor: 'text-orange-400',
      countColor: 'text-orange-400',
    },
    {
      title: 'Evaluaciones totales',
      count: summaryStats.total,
      icon: TrendingUp,
      bgColor: theme.summaryBg3,
      iconColor: 'text-[#00BBA7]',
      countColor: 'text-[#00BBA7]',
    },
  ];

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text}`}>
      <Sidebar />
      <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)]">
        <header className="mb-8">
          <div className="flex justify-between items-start">
             <div className="flex flex-col">
                <h1 className={`text-3xl font-bold ${theme.text}`}>Sistema de Evaluación del Día</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Análisis de Sistemas
                  {courseInfo.semester && ` • ${courseInfo.semester}to Semestre`}
                  {courseInfo.group && ` • ${courseInfo.group}`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setViewMode('all')}
                  className="bg-sky-500 hover:bg-sky-600 text-white flex items-center"
                >
                  Ver Evaluaciones Generales
                </Button>
                <Button 
                        onClick={() => navigate('/hackathon/evaluationday/setup')} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Crear Nueva Evaluación
                    </Button>
                <Button 
                    onClick={toggleTheme} 
                    variant="ghost" 
                    className={`${theme.text} hover:bg-gray-700/50`}
                    aria-label={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}
                  >
                  {mode === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </Button>
              </div>
           </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {summaryCardsData.map((data, index) => (
            <SummaryCard key={index} {...data} />
          ))}
        </section>

        <EvaluationDayList 
            evaluations={evaluations} 
            onEvaluate={handleEvaluate} 
        />
      </main>
    </div>
  );
};

export default EvaluationDayPage;