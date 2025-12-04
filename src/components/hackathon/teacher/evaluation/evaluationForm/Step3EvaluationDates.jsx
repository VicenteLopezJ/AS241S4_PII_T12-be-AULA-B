import { useState, useEffect } from "react";

const HOURS_24 = Array.from({ length: 24 }, (_, i) => 
  i.toString().padStart(2, "0")
);
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => 
  i.toString().padStart(2, "0")
);

const TimeSelector24h = ({ value, onChange, label }) => {
  const [h, m] = value ? value.split(":") : ["", ""];

  const handleChange = (type, newVal) => {
    const currentH = h || "00";
    const currentM = m || "00";
    
    if (type === "hour") {
      onChange(`${newVal}:${currentM}`);
    } else {
      onChange(`${currentH}:${newVal}`);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm text-[#8b94a8] mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={h}
          onChange={(e) => handleChange("hour", e.target.value)}
          className="bg-[#0f1724] border border-[#3a4757] rounded px-2 py-2 text-[#e4e4e7] w-full appearance-none text-center cursor-pointer focus:border-[#10b981] outline-none"
        >
          <option value="" disabled>Hrs</option>
          {HOURS_24.map((hour) => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </select>

        <span className="text-[#8b94a8] font-bold">:</span>

        <select
          value={m}
          onChange={(e) => handleChange("minute", e.target.value)}
          className="bg-[#0f1724] border border-[#3a4757] rounded px-2 py-2 text-[#e4e4e7] w-full appearance-none text-center cursor-pointer focus:border-[#10b981] outline-none"
        >
          <option value="" disabled>Min</option>
          {MINUTES_60.map((minute) => (
            <option key={minute} value={minute}>{minute}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default function Step3EvaluationDates({ formData, setFormData }) {
  const minGroups = formData.minGroups || 1;
  const defaultCapacity = formData.capacity || 25; 
  const totalStudents = formData.students?.length || 0;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [touched, setTouched] = useState(false);
  const [groups, setGroups] = useState(() => {
    const incomingGroups = formData.groups || [];
    const savedSessions = formData.groupsAndSessions || [];
    if (incomingGroups.length === 0) return [];

    return incomingGroups.map((freshGroup, index) => {
      
      const savedSession = savedSessions.find(
        (s) =>
          (s.existingGroupId && s.existingGroupId === freshGroup.existingGroupId) ||
          (!s.existingGroupId && !freshGroup.existingGroupId && savedSessions.indexOf(s) === index)
      );

      if (savedSession) {
        return {
          ...freshGroup, 
          caseDescription: savedSession.caseDescription || "",
          sessionDate: savedSession.sessionDate || "",
          startTime: savedSession.startTime || "08:00",
          endTime: savedSession.endTime || "10:00",
        };
      }
      
      return {
        ...freshGroup,
        caseDescription: "",
        sessionDate: "",
        startTime: "08:00",
        endTime: "10:00",
      };
    });
  });

  useEffect(() => {
    
    if (groups.length > 0) return;

    const newGroups = Array.from({ length: minGroups }, (_, i) => ({
      groupName: `Sección ${alphabet[i]}`,
      maxStudents: defaultCapacity,
      minRequired: 1, 
      existingGroupId: null,
      caseDescription: "",
      sessionDate: "",
      startTime: "08:00",
      endTime: "10:00",
    }));

    setGroups(newGroups);
  }, [minGroups, defaultCapacity, groups.length, alphabet]);

  const [timeErrors, setTimeErrors] = useState({});
  const [capacityError, setCapacityError] = useState("");

  useEffect(() => {
    if (!groups.length) return;
    setFormData((prev) => ({
      ...prev,
      groups: groups,
      groupsAndSessions: groups, 
    }));
  }, [groups, setFormData]);

  useEffect(() => {
    if (!groups.length) return;
    const newErrors = {};

    groups.forEach((g, idx) => {
      if (g.startTime && g.endTime && g.startTime >= g.endTime) {
        newErrors[idx] = "La hora de inicio debe ser anterior a la hora de fin.";
      }
    });

    setTimeErrors(newErrors);

    const totalCapacity = groups.reduce(
      (sum, g) => sum + Number(g.maxStudents || 0),
      0
    );

    if (totalCapacity < totalStudents) {
      setCapacityError(
        `ATENCIÓN: La capacidad total (${totalCapacity}) es menor a los estudiantes registrados (${totalStudents}). Aumente la capacidad de los grupos.`
      );
    } else {
      setCapacityError("");
    }
  }, [groups, totalStudents]);

  const updateGroup = (index, field, value) => {
    setGroups((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const isValidDescriptionLength = (value) => (value?.trim().length || 0) >= 20;
  
  const getErrorClass = (isValid) => 
    touched && !isValid ? "border-red-500 focus:border-red-500" : "border-[#3a4757] focus:border-[#10b981]";

  return (
    <div className="space-y-8 " onClick={() => setTouched(true)}>
      {groups.map((group, index) => (
        <div
          key={index}
          className="bg-[#1a2332] border border-[#3a4757] rounded-lg p-4 space-y-4 relative"
        >
           {group.existingGroupId && (
              <span className="absolute top-4 right-4 text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700 uppercase tracking-wider">
                Existente (ID: {group.existingGroupId})
              </span>
           )}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#e4e4e7] flex items-center gap-2">
              <span className="bg-[#10b981] text-[#0f1724] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              {group.groupName || `Grupo ${index + 1}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-[#8b94a8] mb-1">
                Nombre del Grupo
              </label>
              <input
                value={group.groupName}
                onChange={(e) => updateGroup(index, "groupName", e.target.value)}
                className="w-full bg-[#0f1724] border border-[#3a4757] rounded px-3 py-2 text-[#e4e4e7] focus:border-[#10b981] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#8b94a8] mb-1 flex justify-between">
                <span>Capacidad (Max)</span>
                {group.existingGroupId && (
                    <span className="text-xs text-[#f97316]">Mín: {group.minRequired} inscritos</span>
                )}
              </label>
              
              <input
                type="number"
                
                min={group.minRequired || 1} 
                value={group.maxStudents}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    
                    
                    updateGroup(index, "maxStudents", val);
                }}
                className={`w-full bg-[#0f1724] border rounded px-3 py-2 text-[#e4e4e7] outline-none
                    ${(group.maxStudents < group.minRequired) 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-[#3a4757] focus:border-[#10b981]"
                    }
                `}
              />
              
              {(group.maxStudents < group.minRequired) && (
                  <div className="text-[10px] text-red-400 mt-1">
                       No puedes reducir la capacidad por debajo de los {group.minRequired} estudiantes ya inscritos.
                  </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#8b94a8] mb-1">
              Caso de Estudio / Descripción
              {touched && !isValidDescriptionLength(group.caseDescription) && (
                <span className="text-red-400 text-xs ml-2">(Mín. 20 caracteres)</span>
              )}
            </label>
            <textarea
              value={group.caseDescription}
              onChange={(e) => updateGroup(index, "caseDescription", e.target.value)}
              placeholder="Ej: Implementación de API Rest..."
              className={`w-full bg-[#0f1724] border rounded px-3 py-2 text-[#e4e4e7] h-20 outline-none resize-none ${
                getErrorClass(isValidDescriptionLength(group.caseDescription))
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm text-[#8b94a8] mb-1">Fecha</label>
                <input
                  type="date"
                  value={group.sessionDate}
                  onChange={(e) => updateGroup(index, "sessionDate", e.target.value)}
                  className="w-full bg-[#0f1724] border border-[#3a4757] rounded px-3 py-2 text-[#e4e4e7] focus:border-[#10b981] outline-none"
                />
            </div>

            <TimeSelector24h
              label="Hora Inicio"
              value={group.startTime}
              onChange={(val) => updateGroup(index, "startTime", val)}
            />

            <TimeSelector24h
              label="Hora Fin"
              value={group.endTime}
              onChange={(val) => updateGroup(index, "endTime", val)}
            />
          </div>

          {timeErrors[index] && (
            <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20 flex items-center gap-2">
                 {timeErrors[index]}
            </div>
          )}
        </div>
      ))}

      <div
        className={`p-4 rounded-lg border transition-colors flex items-center gap-3 ${
          capacityError
            ? "bg-red-900/20 border-red-700 text-red-300"
            : "bg-green-900/20 border-green-700 text-green-300"
        }`}
      >
        <span className="text-2xl">{capacityError ? "🚫" : "✅"}</span>
        <span>
            {capacityError ||
             `Todo listo: Capacidad para ${groups.reduce((acc, g) => acc + (g.maxStudents || 0), 0)} estudiantes (Inscritos: ${totalStudents}).`}
        </span>
      </div>
    </div>
  );
}