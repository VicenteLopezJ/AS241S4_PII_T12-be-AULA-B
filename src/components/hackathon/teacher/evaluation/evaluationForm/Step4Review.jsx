
import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { setupEvaluationEnvironment } from "../../../../../services/hackathon/evaluationService";
import { useNavigate } from "react-router-dom";

export default function Step4Review({ formData, onSubmit }) {
  const {
    challengeTitle,
    challengeDescription,
    groupSemester,
    studentEmails = [],
    criteria = [],
    groupsAndSessions = []
  } = formData || {};

  const studentCount = studentEmails.length || 0;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoAttendance, setAutoAttendance] = useState(1);
  const handleSubmit = async () => {
    const payload = {
        challengeTitle: formData.challengeTitle,
        challengeDescription: formData.challengeDescription,
        groupSemester: String(formData.groupSemester),
        
        studentEmails: Array.isArray(formData.studentEmails)
            ? formData.studentEmails
            : formData.studentEmails.split(/[\n,]+/).map(s => s.trim()).filter(s => s),        
        studentMappings: formData.studentMappings,        
        maxResult: Number(formData.maxResult),
        autoAttendance: autoAttendance,
        criteria: formData.criteria.map(c => ({
            criterionDescription: c.criterionDescription,
            maxScore: Number(c.maxScore),
            track: Number(c.track),
            teachingUnit: c.teachingUnit
        })),
        
        groupsAndSessions: formData.groupsAndSessions.map(g => ({
            existingGroupId: g.existingGroupId || null,
            groupName: g.groupName,
            maxStudents: Number(g.maxStudents),
            caseDescription: g.caseDescription,
            sessionDate: g.sessionDate,
            startTime: g.startTime, 
            endTime: g.endTime
        }))
    };

    try {
      setLoading(true);
      setError("");
      console.log("payload:", payload)
      const result = await setupEvaluationEnvironment(payload);
      console.log("result:", result)
      onSubmit(result); 
      setShowSuccessModal(true); 

    } catch (err) {
      setError("Error al configurar el entorno. Revisa la consola para más detalles.");
      console.error("Error del servidor:", err);
      
      if (err.response && err.response.data && err.response.data.error) {
         console.error("Detalle del error:", err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalScore = criteria.reduce((a, c) => a + (Number(c.maxScore) || 0), 0);

  return (
    <div className="space-y-6">

      <div className="text-center py-8">
        <CheckCircle size={64} className="text-[#10b981] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#e4e4e7] mb-2">¡Todo está listo!</h2>
        <p className="text-[#8b94a8]">
          Revisa la información antes de confirmar la configuración
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
          <div className="text-sm text-[#8b94a8] mb-2">Challenge</div>
          <div className="text-[#e4e4e7] font-semibold">{challengeTitle}</div>
          <div className="text-xs text-[#8b94a8] mt-2">Semestre: {groupSemester}</div>
        </div>

        <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
          <div className="text-sm text-[#8b94a8] mb-2">Estudiantes</div>
          <div className="text-[#e4e4e7] font-semibold">{studentCount} estudiantes</div>
          
        </div>

        <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
          <div className="text-sm text-[#8b94a8] mb-2">Criterios</div>
          <div className="text-[#e4e4e7] font-semibold">{criteria.length} criterios</div>
          <div className="text-xs text-[#8b94a8] mt-2">
            Puntaje total: {totalScore} pts
          </div>
        </div>

        <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4">
          <div className="text-sm text-[#8b94a8] mb-2">Grupos & Sesiones</div>
          <div className="text-[#e4e4e7] font-semibold">{groupsAndSessions.length} grupos</div>
          <div className="text-xs text-[#8b94a8] mt-2">
            {groupsAndSessions.every(g => g.sessionDate)
              ? "Sesiones configuradas"
              : "Fechas incompletas"}
          </div>
        </div>
      </div>
      
      <div className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#e4e4e7]">Asistencia Automática</h3>
          <p className="text-sm text-[#8b94a8] mt-1">
            Genera automáticamente la asistencia al crear la evaluación.
          </p>
        </div>

        {/* Switch (usando estilos sencillos para simular un switch) */}
        <button
          onClick={() => setAutoAttendance(autoAttendance === 1 ? 0 : 1)}
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${
            autoAttendance === 1 ? "bg-[#10b981] border-[#10b981]" : "bg-gray-700 border-gray-600"
          } focus:outline-none`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
              autoAttendance === 1 ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold text-[#e4e4e7]">
          Casos de Estudio por Grupo
        </h3>

        {groupsAndSessions.map((g, idx) => (
          <div key={idx} className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4 space-y-2">
            <div className="text-[#e4e4e7] font-semibold">{g.groupName}</div>
            <div className="text-sm text-[#8b94a8]">Capacidad: {g.groupCapacity}</div>
            <div className="text-sm text-[#e4e4e7]">
              <span className="text-[#8b94a8]">Caso: </span>
              {g.caseDescription || "No definido"}
            </div>
            <div className="text-sm text-[#8b94a8]">Fecha: {g.sessionDate || "—"}</div>
            <div className="text-sm text-[#8b94a8]">Hora: {g.startTime || "—"} - {g.endTime || "—"}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a2332] border border-[#10b981] border-2 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-[#10b981] mt-1 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-[#e4e4e7]">
              Configuración validada
            </div>
            <p className="text-xs text-[#8b94a8] mt-1">
              Todos los datos han sido verificados. Puedes confirmar la creación
              de esta evaluación.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-right">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold text-white ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#10b981] hover:bg-[#0d9970]"
          }`}
        >
          {loading ? "Creando..." : "Confirmar Evaluación"}
        </button>
      </div>


      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] border border-[#3a4757] rounded-xl p-6 w-[350px] text-center relative shadow-xl">
            
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <CheckCircle size={56} className="text-[#10b981] mx-auto mb-4" />

            <h2 className="text-xl font-bold text-[#e4e4e7]">
              ¡Evaluación creada con éxito!
            </h2>

            <p className="text-[#8b94a8] mt-2 mb-6">
              ¿Qué deseas hacer ahora?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onSubmit({ action: "reset" });
                }}
                className="w-full bg-[#10b981] hover:bg-[#0d9970] text-white py-2 rounded-lg font-semibold"
              >
                ➕ Agregar nueva evaluación
              </button>

              <button
                onClick={() => navigate("/hackathon/evaluationday")}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-2 rounded-lg font-semibold"
              >
                📄 Ver evaluaciones
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
