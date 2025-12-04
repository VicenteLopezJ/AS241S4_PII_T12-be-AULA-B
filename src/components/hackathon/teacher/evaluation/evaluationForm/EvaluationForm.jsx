import { useEffect, useState } from "react"
import {Button, Input} from "../../../index"

function EvaluationForm({ isOpen, onClose, onSubmit, existingEvaluation, students, tutors, criteria }) {
  const defaultFormData = {
    idStudent: 0,
    idTeacher: 0,
    sessionDate: "", 
    selectedCriteriaIds: [],
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingEvaluation) {
      
      const selectedIds = existingEvaluation.details?.map(d => d.idCriterion) || [];

      setFormData({
        idStudent: existingEvaluation.idStudent || 0,
        idTeacher: existingEvaluation.idTeacher || 0,
        
        sessionDate: existingEvaluation.sessionDate?.substring(0, 16) || "", 
        selectedCriteriaIds: selectedIds,
      });
    } else {
      
      const now = new Date();
      
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
      setFormData({ 
        ...defaultFormData, 
        sessionDate: now.toISOString().substring(0, 16),
        
        idStudent: students.length > 0 ? students[0].idStudent : 0, 
        idTeacher: tutors.length > 0 ? tutors[0].idTeacher : 0, 
      });
    }
    setErrors({});
  }, [existingEvaluation, isOpen, students, tutors]); 

  const handleChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === 'idStudent' || id === 'idTeacher') {
      newValue = Number.parseInt(value);
    }
    
    setFormData(prev => ({ ...prev, [id]: newValue }));
  };

  const handleCriterionChange = (criterionId) => {
    const id = Number.parseInt(criterionId);
    setFormData(prev => {
      const isSelected = prev.selectedCriteriaIds.includes(id);
      
      if (isSelected) {
        
        return { 
          ...prev, 
          selectedCriteriaIds: prev.selectedCriteriaIds.filter(cId => cId !== id)
        };
      } else {
        
        return { 
          ...prev, 
          selectedCriteriaIds: [...prev.selectedCriteriaIds, id]
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.idStudent || formData.idStudent === 0) newErrors.idStudent = "Debe seleccionar un estudiante";
    if (!formData.idTeacher || formData.idTeacher === 0) newErrors.idTeacher = "Debe seleccionar un profesor/tutor";
    if (!formData.sessionDate) newErrors.sessionDate = "La fecha y hora son requeridas";
    if (formData.selectedCriteriaIds.length === 0) newErrors.criteria = "Debe seleccionar al menos un criterio de evaluación";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      
      const dataToSend = {
        idStudent: formData.idStudent,
        idTeacher: formData.idTeacher,
        
        sessionDate: formData.sessionDate + ':00', 
        details: formData.selectedCriteriaIds.map(id => ({
          idCriterion: id
        }))
      };

      onSubmit(dataToSend);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-[#1a2332] border-[#2a3544] text-white rounded-xl shadow-2xl w-full sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col space-y-2 p-6 border-b border-[#2a3544]">
          <h2 className="text-2xl font-bold text-emerald-400">
            {existingEvaluation ? "Editar Evaluación" : "Registrar Nueva Evaluación"}
          </h2>
          <p className="text-sm text-gray-400">
            Asigna un profesor, estudiante, fecha y selecciona los criterios aplicables.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label htmlFor="idStudent" className="text-sm font-medium leading-none text-gray-300">
                Estudiante *
              </label>
              <select
                id="idStudent"
                value={formData.idStudent.toString()}
                onChange={handleChange}
                className={`bg-[#0f1419] border rounded-md w-full p-2.5 appearance-none ${errors.idStudent ? 'border-red-500' : 'border-[#2a3544] text-white'}`}
              >
                <option value="0" disabled>Selecciona un estudiante</option>
                {students.map((student) => (
                  <option key={student.idStudent} value={student.idStudent.toString()}>
                    {student.name} {student.surname}
                  </option>
                ))}
              </select>
              {errors.idStudent && <p className="text-xs text-red-400 pt-1">{errors.idStudent}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="idTeacher" className="text-sm font-medium leading-none text-gray-300">
                Profesor/Tutor *
              </label>
              <select
                id="idTeacher"
                value={formData.idTeacher.toString()}
                onChange={handleChange}
                className={`bg-[#0f1419] border rounded-md w-full p-2.5 appearance-none ${errors.idTeacher ? 'border-red-500' : 'border-[#2a3544] text-white'}`}
              >
                <option value="0" disabled>Selecciona un profesor</option>
                {tutors.map((tutor) => ( 
                  <option key={tutor.idTeacher} value={tutor.idTeacher.toString()}>
                    {tutor.name} {tutor.surname}
                  </option>
                ))}
              </select>
              {errors.idTeacher && <p className="text-xs text-red-400 pt-1">{errors.idTeacher}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="sessionDate" className="text-sm font-medium leading-none text-gray-300">
                Fecha y Hora de Evaluación *
              </label>
              <Input
                id="sessionDate"
                type="datetime-local"
                value={formData.sessionDate}
                onChange={handleChange}
                className={`bg-[#0f1419] text-white border-[#2a3544] ${errors.sessionDate ? 'border-red-500' : ''}`}
              />
              {errors.sessionDate && <p className="text-xs text-red-400 pt-1">{errors.sessionDate}</p>}
            </div>
            
            <div className="space-y-3 md:col-span-2 pt-2">
              <label className="text-sm font-medium leading-none text-gray-300 block">
                Criterios de Evaluación Seleccionados *
              </label>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-md ${errors.criteria ? 'border border-red-500' : 'border border-[#2a3544]'}`}>
                {criteria.map((criterion) => (
                  <div key={criterion.idCriterion} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`criterion-${criterion.idCriterion}`}
                      value={criterion.idCriterion}
                      checked={formData.selectedCriteriaIds.includes(criterion.idCriterion)}
                      onChange={() => handleCriterionChange(criterion.idCriterion)}
                      className="mt-1 h-4 w-4 text-emerald-500 bg-gray-900 border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor={`criterion-${criterion.idCriterion}`} className="text-sm text-gray-300 cursor-pointer flex-1">
                      {criterion.criterionDescription} 
                      <span className="text-xs text-emerald-400 block">({criterion.maxScore} pts)</span>
                    </label>
                  </div>
                ))}
              </div>
              {errors.criteria && <p className="text-xs text-red-400 pt-1">{errors.criteria}</p>}
            </div>

          </div>
        
          <div className="flex justify-end space-x-2 pt-6 border-t border-[#2a3544] mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-[#2a3544] text-gray-300 hover:bg-[#2a3544]"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {existingEvaluation ? "Guardar Cambios" : "Registrar Evaluación"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EvaluationForm;