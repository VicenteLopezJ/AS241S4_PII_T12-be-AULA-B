import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, User, AlertCircle } from 'lucide-react';


import { useHackathonData } from './hooks/useHackathonData';
import { useCohortLogic, COHORT_STATE } from './hooks/useCohortLogic';
import TutorAssignmentModal from './ui/TutorAssignmentModal';
import useGroupConstruction from './hooks/useGroupConstruction';
import useStep2Calculations from './hooks/useStep2Calculation';
import useTutorAssignmentModal from './hooks/useTutorAssignmentModal'; 

import CohortStatusPanel from './ui/CohortStatusPanel';
import GroupSelectionGrid from './ui/GroupSelectionGrid';

import StudentEmailEditor from './ui/StudentEmailEditor';
import CapacityAndTutorActionBar from './ui/CapacityAndTutorActionBar';
import StatsAndDistributionDashboard from './ui/StatsAndDistributionDashboard';

export default function Step2StudentRegistration({ formData, setFormData }) {
  
  const initialEmailsString = useMemo(() => {
        if (Array.isArray(formData.students) && formData.students.length > 0) {
            
            return formData.students.map(s => s.email).join("\n");
        }
        return '';
    }, [formData.students]); 

  const [studentEmails, setStudentEmails] = useState(initialEmailsString);
  const [selectedGroupIds, setSelectedGroupIds] = useState(formData.selectedGroupIds || []);
  const [lockedSemester, setLockedSemester] = useState(formData.selectedSemester || null);
  const [studentMappings, setStudentMappings] = useState(formData.studentMappings || []);
  const [existingEmailErrors, setExistingEmailErrors] = useState([]);
  const [manualMaxCapacity, setManualMaxCapacity] = useState(formData.maxCapacity?.toString() ?? '25');
  
  const mode = formData.mode;
  const targetSemester = formData.groupSemester ? String(formData.groupSemester) : "";

  
  const { dbGroups, dbStudents, teachers, isLoadingData } = useHackathonData(setFormData);

useEffect(() => {
    
    console.log("👉 Target Semester (formData.groupSemester):", targetSemester);
    console.log("👉 estudiantes (formData.students):", studentEmails);
    
    if (!isLoadingData) {
        
        console.log("✅ Datos de Estudiantes (dbStudents) cargados:", dbStudents.length, "registros.");
        console.log("   Muestra (Primeros 3 estudiantes):", dbStudents.slice(0, 3));
        
        
        console.log("✅ Datos de Grupos (dbGroups) cargados:", dbGroups.length, "registros.");
        console.log("   Muestra (Primeros 3 grupos):", dbGroups.slice(0, 3));

        
        console.log("✅ Datos de Tutores (teachers) cargados:", teachers.length, "registros.");
    }
}, [isLoadingData, dbStudents, dbGroups, teachers, targetSemester]);
  
  const {
        validEmails,
        effectiveCapacity,
        minGroups,
        totalStudentsToList,
        duplicatedEmails,
        hasDuplicateEmails,
        availableGroups,
        unassignedEmails,
        totalEmails,
        totalAssigned,
        isAssignmentComplete,
    } = useStep2Calculations({
        studentEmails,
        dbStudents,
        selectedGroupIds,
        dbGroups,
        manualMaxCapacity,
        studentMappings,
        targetSemester,
    });
    
    
  const groups = useGroupConstruction(
        minGroups,
        effectiveCapacity,
        selectedGroupIds,
        dbGroups,
        dbStudents
  );
  const {
        showTutorModal,
        studentSearch,
        setStudentSearch,
        filteredUnassigned,
        selectedEmailsInModal,
        setSelectedEmailsInModal,
        selectedTutorInModal,
        setSelectedTutorInModal,
        handleOpenTutorModal,
        handleCloseModal, 
        handleToggleEmailSelection,
        handleAssignTutorBatch,
    } = useTutorAssignmentModal(unassignedEmails, setStudentMappings);
  
  const { 
    comparisonState, 
    existingSemesterEmails, 
    setComparisonState,
    semesterStudents
  } = useCohortLogic({
     mode, isLoadingData, targetSemester, validEmails, availableGroups, dbStudents,
     setStudentEmails, setStudentMappings, setSelectedGroupIds, setLockedSemester, setExistingEmailErrors
  });

  const getStudentsAndMappingsFromGroups = (currentSelectedGroupIds, allDbStudents) => {
        if (currentSelectedGroupIds.length === 0) {
            return { emails: [], mappings: [] };
        }

        
        const studentsInSelectedGroups = allDbStudents.filter(student => 
            currentSelectedGroupIds.includes(student.idGroup)
        );

        
        const emails = studentsInSelectedGroups.map(s => s.email).join("\n");
        
        
        const mappings = studentsInSelectedGroups
            .map(s => ({ 
                email: s.email, 
                idTeacher: s.idTeacher 
            }))
            
            .filter(m => m.idTeacher != null); 
            
        return { emails, mappings };
    };

  
  
 
  const handleReplaceCohort = () => {
    setComparisonState(COHORT_STATE.NEW_COHORT);
    setSelectedGroupIds([]);
    setLockedSemester(null);
    setStudentMappings([]);
    setExistingEmailErrors([]);
    
  };

  const handleUseExistingCohort = () => {
    setComparisonState(COHORT_STATE.MATCH_FULL);
    const groupIds = availableGroups.map(g => g.idGroup);
    setSelectedGroupIds(groupIds);
    const mappings = semesterStudents.map(s => ({ email: s.email, idTeacher: s.idTeacher }));
    setStudentMappings(mappings);
    setStudentEmails(semesterStudents.map(s => s.email).join("\n"));
    setExistingEmailErrors([]);
  };

  const handleGroupInteraction = (group) => {
        setSelectedGroupIds(prev => {
            const isSelected = prev.includes(group.idGroup);
            const newSelectedIds = isSelected 
                ? prev.filter(id => id !== group.idGroup) 
                : [...prev, group.idGroup];
            
            
            const { emails, mappings } = getStudentsAndMappingsFromGroups(
                newSelectedIds, 
                dbStudents
            );

            
            setStudentEmails(emails); 
            setStudentMappings(mappings);
            
            
            

            return newSelectedIds;
        });
  };

  useEffect(() => {
    if (!isLoadingData && dbStudents.length > 0 && selectedGroupIds.length > 0) {
        // Solo si el email string está vacío, intentamos recuperarlo de los grupos
        if (!studentEmails || studentEmails.trim() === '') {
             const { emails, mappings } = getStudentsAndMappingsFromGroups(selectedGroupIds, dbStudents);
             if (emails) {
                 console.log("🔄 Restaurando emails desde grupos seleccionados...");
                 setStudentEmails(emails);
                 // Solo restauramos mappings si no hay ninguno actual
                 if (studentMappings.length === 0) setStudentMappings(mappings);
             }
        }
    }
  }, [isLoadingData, dbStudents, selectedGroupIds]);
  
  
  useEffect(() => {
    if (isLoadingData) return;
    setFormData(prev => ({
        ...prev,
        studentMappings: studentMappings,
        
        isStep2Valid: mode === "manual"
          ? isAssignmentComplete   
          : isAssignmentComplete && !hasDuplicateEmails && comparisonState !== COHORT_STATE.NEEDS_DECISION,
        studentEmails: validEmails,
        students: validEmails,
        totalStudents: validEmails.length, 
        capacity: effectiveCapacity, 
        minGroups: minGroups,
        groups: groups, 
        selectedGroupIds: selectedGroupIds, 
        selectedSemester: lockedSemester,
        hasDuplicateEmails: hasDuplicateEmails,
        duplicateEmails: duplicatedEmails
      }));
    }, [isLoadingData,studentMappings,
      validEmails, 
      effectiveCapacity, 
      groups, 
      minGroups, 
      selectedGroupIds, 
      lockedSemester, 
      setFormData,
      isAssignmentComplete,
      hasDuplicateEmails,
      duplicatedEmails,
      comparisonState
  ]);

  return (
    <div className="space-y-6">
      
      <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-[#e4e4e7] flex items-center gap-2">
             📂 Grupos del {targetSemester}º Semestre
             {isLoadingData && <span className="animate-pulse text-xs text-[#10b981]">(Cargando...)</span>}
            </h3>
        </div>

        {/* COMPONENTE 1: Status Panel */}
        <CohortStatusPanel 
            comparisonState={comparisonState}
            targetSemester={targetSemester}
            validEmailsCount={validEmails.length}
            existingSemesterEmails={existingSemesterEmails}
            onReplaceCohort={handleReplaceCohort}
            onUseExistingCohort={handleUseExistingCohort}
        />

        {/* COMPONENTE 2: Grid de Grupos */}
        {(comparisonState === COHORT_STATE.NEW_COHORT) ? (
            <div className="p-4 bg-[#252f3f] border border-[#3a4757] rounded-lg mb-4">
                <p className="text-sm text-[#8b94a8]">
                    Al elegir la lista importada, se **crearán nuevos grupos** automáticamente según la capacidad definida.
                </p>
            </div>
        ) : (
            <GroupSelectionGrid 
                availableGroups={availableGroups}
                selectedGroupIds={selectedGroupIds}
                dbStudents={dbStudents}
                targetSemester={targetSemester}
                comparisonState={comparisonState}
                COHORT_STATE={COHORT_STATE}
                onToggleGroup={handleGroupInteraction}
            />
        )}
      </div>

        {/* SECCIÓN 1: INPUT DE EMAILS */}
            <StudentEmailEditor 
                studentEmails={studentEmails}
                setStudentEmails={setStudentEmails}
                setStudentMappings={setStudentMappings}
                setSelectedGroupIds={setSelectedGroupIds}
                setLockedSemester={setLockedSemester}
                setComparisonState={setComparisonState}
                existingEmailErrors={existingEmailErrors}
                studentMappingsLength={studentMappings.length}
                validEmailsLength={validEmails.length}
            />

            {/* SECCIÓN 2: BARRA DE ACCIONES (Capacidad y Tutor) */}
            <CapacityAndTutorActionBar
                selectedGroupIds={selectedGroupIds}
                effectiveCapacity={effectiveCapacity}
                setManualMaxCapacity={setManualMaxCapacity}
                isAssignmentComplete={isAssignmentComplete}
                totalEmails={totalEmails}
                totalAssigned={totalAssigned}
                handleOpenTutorModal={handleOpenTutorModal}
                comparisonState={comparisonState}
            />

            {/* SECCIÓN 3: DASHBOARD DE ESTADÍSTICAS */}
            <StatsAndDistributionDashboard
                totalStudentsToList={totalStudentsToList}
                minGroups={minGroups}
                effectiveCapacity={effectiveCapacity}
            />

       {/* --- MODAL DE ASIGNACIÓN DE TUTORES --- */}
            <TutorAssignmentModal
                showTutorModal={showTutorModal}
                unassignedEmails={unassignedEmails}
                handleCloseModal={handleCloseModal}
                studentSearch={studentSearch}
                setStudentSearch={setStudentSearch}
                selectedEmailsInModal={selectedEmailsInModal}
                setSelectedEmailsInModal={setSelectedEmailsInModal}
                filteredUnassigned={filteredUnassigned}
                handleToggleEmailSelection={handleToggleEmailSelection}
                teachers={teachers}
                selectedTutorInModal={selectedTutorInModal}
                setSelectedTutorInModal={setSelectedTutorInModal}
                handleAssignTutorBatch={handleAssignTutorBatch}
            />
    </div>
  );
}