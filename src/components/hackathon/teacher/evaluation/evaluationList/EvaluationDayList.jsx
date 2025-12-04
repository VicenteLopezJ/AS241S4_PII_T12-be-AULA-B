import { useTheme } from '../../../../../styles/hackathon/ThemeContext'; 

const EvaluationDayList = ({ evaluations, onEvaluate }) => {
    const { theme } = useTheme(); 
    
    const getInitials = (name, surname) => {
        if (!name || !surname) return '??';
        return `${name[0]}${surname[0]}`.toUpperCase();
    };

    return (
      <div className="mt-8">
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-4 p-4 rounded-lg ${theme.cardBg}`}>
            Listado de estudiantes a evaluar
        </h3>
            
        {evaluations.length === 0 && (
             <div className={`flex items-center justify-center ${theme.cardBg} p-8 rounded-lg shadow-md h-40`}>
                 <p className="text-gray-400 text-lg">No hay estudiantes asignados para evaluar hoy.</p>
            </div>
        )}

        <div className="space-y-4">
            {evaluations.map((evaluation) => {
                    
                const maxScore = evaluation.evaluationMaxresult; 
                const totalMaxScore = maxScore && maxScore > 0 ? maxScore : 20;
                const progressInPercentage = (evaluation.evaluationResult / totalMaxScore) * 100;

                
                const progress = Math.min(100, Math.max(0, progressInPercentage)) || 0;

                return (
                    <div 
                        key={evaluation.idEvaluation} 
                        className={`flex items-center ${theme.cardBg} p-4 rounded-lg shadow-md`}
                    >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.text === 'text-white' ? 'text-gray-900' : 'text-white'} font-bold text-sm ${evaluation.avatar_color} mr-4`}>
                            {getInitials(evaluation.student_name, evaluation.student_surname)}
                    </div>
                        <div className="flex-grow">
                            <p className={`${theme.cardText} font-medium`}>
                                {evaluation.student_name} {evaluation.student_surname}
                            </p>
                            <div className="flex items-center mt-1">
                                <div className="flex-grow h-2 bg-gray-700 rounded-full mr-3">
                                    <div 
                                        style={{ width: `${progress}%` }} 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            
                                            progress === 0 ? 'bg-gray-400' : (progress >= 60 ? 'bg-[#00A76F]' : 'bg-red-500')
                                        }`}
                                    >
                                    </div>
                                </div>
                                    <span className={`${theme.cardText} text-sm w-10 text-right`}>{progress.toFixed(0)}%</span>
                            </div>
                        </div>
                            
                          <button 
                                
                                
                              onClick={() => onEvaluate(evaluation.idEvaluation)}
                              className="ml-6 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
                          >
                                {evaluation.evaluationState && evaluation.evaluationState !== 'PENDIENTE' ? 'Ver' : 'Evaluar'}
                          </button>
                  </div>
                );
            })}
        </div>
    </div>
  );
};

export default EvaluationDayList;