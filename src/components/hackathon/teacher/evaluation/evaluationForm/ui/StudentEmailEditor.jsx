import React from 'react';
import { COHORT_STATE } from '../hooks/useCohortLogic'; // Asumiendo que esta ruta es correcta

export default function StudentEmailEditor({
    studentEmails,
    setStudentEmails,
    setStudentMappings,
    setSelectedGroupIds,
    setLockedSemester,
    setComparisonState,
    existingEmailErrors,
    studentMappingsLength,
    validEmailsLength
}) {

    const handleEmailChange = (e) => {
        setStudentEmails(e.target.value);
        
        // Reinicio de estados al editar manualmente
        if(studentMappingsLength > 0) {
            setStudentMappings([]); 
        }
        setSelectedGroupIds([]);
        setLockedSemester(null);
        setComparisonState(COHORT_STATE.NEW_COHORT);
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-[#e4e4e7] mb-2">
                Lista de Correos <span className="text-red-500">*</span>
            </label>
            <textarea
                value={studentEmails}
                onChange={handleEmailChange}
                rows={6}
                className={`
                    w-full bg-[#1a2332] border rounded-lg px-4 py-2
                    text-[#e4e4e7] placeholder-[#8b94a8] focus:outline-none text-sm font-mono
                    ${existingEmailErrors.length > 0 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-[#3a4757] focus:border-[#10b981]"
                    }
                `}
            />
            {existingEmailErrors.length > 0 && (
                <div className="mt-2 text-red-400 text-xs">
                    Los siguientes correos ya existen en el sistema:
                    <ul className="list-disc ml-4">
                        {existingEmailErrors.map(email => (
                            <li key={email}>{email}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                    {studentMappingsLength > 0 
                        ? `✅ ${studentMappingsLength} estudiantes tienen tutor asignado.` 
                        : "Edita la lista antes de asignar tutores."}
                </span>
                <span className="text-xs text-[#10b981] font-semibold">{validEmailsLength} correos válidos</span>
            </div>
        </div>
    );
}