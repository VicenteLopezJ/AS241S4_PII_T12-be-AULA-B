import { useState } from "react";
import Sidebar from "../../../../components/hackathon/Sidebar";
import {Step1ChallengeInfo,Step2StudentRegistration,Step3EvaluationDates,Step4Review} from "../../../../components/hackathon/teacher/evaluation/evaluationForm/index";
import ImportDriveModal from "../../../../components/hackathon/teacher/evaluation/evaluationModal/importDriveModal"; 
import { importDriveDocument } from "../../../../services/hackathon/googleDocumentService"; 

export default function EvaluationSetupPage() {
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importError, setImportError] = useState(null);
  
  const [formData, setFormData] = useState({
    criteria: [], 
    groups: [],
    sessions: [],
    students: [],
    selectedGroupIds: [],
    selectedSemester: null,
    isStep2Loading: false,
    maxResult: 20, 
    challengeTitle: "", 
    challengeDescription: "",
    groupSemester: null,
    mode: 'manual',
  });

  const handleFileSelected = async (fileId) => {
    setIsModalOpen(false); 
    setImportError(null);
    
    try {
      const data = await importDriveDocument(fileId);
      console.log("PC1 - Data del Backend (studentEmails):", data.studentEmails);
      
      setFormData(prev => {
        
        const studentsArray = (data.studentEmails || []).map(email => ({ email, isMapped: false }));

        const newFormData = {
          ...prev,
          mode: 'import',
          
          challengeTitle: data.general.challengeTitle || prev.challengeTitle,
          challengeDescription: data.general.challengeDescription || prev.challengeDescription,
          groupSemester: data.general.groupSemester || prev.groupSemester,
          maxResult: data.general.maxResult || 20,
          
          
          criteria: data.criterios || [], 
          students: studentsArray, 
        };

        console.log("PC2 - formData.students (Array de Objetos):", newFormData.students); 
        
        return newFormData;
      });
      
    } catch (error) {
      console.error("Error al importar el documento de Drive:", error);
      setImportError(error.message); 
    }
};

  const isNextDisabled = () => {
    
    if (step === 1) {
      const {
        challengeTitle,
        challengeDescription,
        groupSemester,
        maxResult,
        criteria,
      } = formData;

      if (
          !challengeTitle?.trim() ||
          !challengeDescription?.trim() ||
          !groupSemester ||
          challengeTitle.trim().length < 10 || 
          challengeDescription.trim().length < 20
      ) {
          return true; 
      }

      const maxResNum = Number(maxResult);
      if (!maxResNum || maxResNum <= 0) {
        return true; 
      }
      if (!criteria || criteria.length === 0) return true;

      let currentTotalScore = 0;
      const hasInvalidCriterion = criteria.some((c) => {
        const score = Number(c.maxScore);
        currentTotalScore += score || 0; 

        return (
          !c.criterionDescription?.trim() || 
          !c.teachingUnit?.trim() ||         
          !score || score <= 0               
        );
      });

      if (hasInvalidCriterion) return true;

      const difference = Math.abs(currentTotalScore - maxResNum);
      if (difference > 0.01) {
        return true; 
      }

      return false; 
    }

    
    if (step === 2) {
      const hasStudents = formData.students && formData.students.length > 0;
      const hasDuplicateEmails =
        formData.existingEmailErrors && formData.existingEmailErrors.length > 0;

      return formData.isStep2Loading || !hasStudents || hasDuplicateEmails;
    }

    if (step === 3) {
      const allGroupsValid = formData.groupsAndSessions?.every(group => 
          group.caseDescription?.trim().length >= 20 &&
          group.sessionDate?.trim().length > 0 &&
          group.startTime?.trim().length > 0 &&
          group.endTime?.trim().length > 0
      );

      if (!allGroupsValid) {
          return true;
      }
    }

    
    return false;
  };

  const nextStep = () => {
    if (!isNextDisabled()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1ChallengeInfo formData={formData} setFormData={setFormData} 
          onImportClick={() => {
              setIsModalOpen(true);
              setImportError(null); 
            }} />
        );
      case 2:
        return (
          <Step2StudentRegistration
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <Step3EvaluationDates formData={formData} setFormData={setFormData} />
        );
      case 4:
        return (
          <Step4Review
            formData={formData}
            onSubmit={(data) => {
              if (data?.action === "reset") {
                setFormData({}); 
                setStep(1); 
                return;
              }
              console.log("Evaluación creada:", data);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#232C3A]">
      <Sidebar />

      <main className="ml-64 w-[calc(100vw-16rem)] p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Configurar Challenge - Paso {step} / 4
          </h1>

          {importError && (
            <div className="bg-red-800 text-white p-3 rounded-lg mb-4 border border-red-900">
              ❌ Error de Importación de Drive: {importError}
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-[#3a4757] text-[#e4e4e7] rounded-lg hover:bg-[#4b5563] transition-colors"
              >
                Atrás
              </button>
            )}

            {step < 4 && (
              <button
                onClick={nextStep}
                disabled={isNextDisabled()}
                className={`px-4 py-2 text-white rounded-lg transition-all duration-200 ${
                  isNextDisabled()
                    ? "opacity-50 cursor-not-allowed bg-[#3a4757]"
                    : "bg-[#10b981] hover:bg-[#0c9d6f]"
                }`}
              >
                Siguiente
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">{renderStep()}</div>
      </main>
      <ImportDriveModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileSelected={handleFileSelected} 
      />
    </div>
  );
}