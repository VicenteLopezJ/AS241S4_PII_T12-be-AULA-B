import { useEffect, useState } from "react";
import { Button, Input } from "../../index";
import { X, Plus, AlertTriangle } from "lucide-react";

function GroupForm({ isOpen, onClose, onSubmit, group, groups = [], teachers = [] }) {
    const initialSemester = group?.semester?.toString() || "1";

    const [formData, setFormData] = useState({
        sectionLetter: group?.name?.split(" ")[1] || "A",
        semester: initialSemester,
        maxStudents: 1,
    });

    const [occupiedSections, setOccupiedSections] = useState([]);
    const groupNameFull = `Sección ${formData.sectionLetter}`;
    const [addStudentData, setAddStudentData] = useState([]);
    const [newStudentInput, setNewStudentInput] = useState({ email: "", tutorId: "" });

    const [errors, setErrors] = useState({
        name: "",
        semester: "",
        maxStudents: "",
        addStudentData: "",
        backendCollision: "",
    });

    const [currentStudentCount, setCurrentStudentCount] = useState(0);
    const semesterChanged = group && formData.semester !== initialSemester;
    const EMAIL_REGEX = /^[a-zA-Z0-9]+[.-][a-zA-Z0-9]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

    const isValidStudentEmail = (email) => {
        return EMAIL_REGEX.test(email);
    };
    useEffect(() => {
        if (group) {
            setFormData({
                sectionLetter: group.name?.split(" ")[1] || "A",
                semester: group.semester?.toString() || "1",
                maxStudents: group.maxStudents || group.totalStudents || 0,
            });
            setCurrentStudentCount(group.totalStudents || 0);
        } else {
            setFormData((prev) => ({
                ...prev,
                sectionLetter: "A",
                semester: "1",
                maxStudents: 1,
            }));
            setCurrentStudentCount(0);
        }

        setAddStudentData([]);
        setNewStudentInput({ email: "", tutorId: "" });
        setErrors({ name: "", semester: "", maxStudents: "", addStudentData: "", backendCollision: "" });
    }, [group, isOpen, groups]);

    useEffect(() => {
        const groupsInCurrentSemester = groups.filter(
            (g) => g.semester?.toString() === formData.semester
        );

        const currentOccupied = groupsInCurrentSemester
            .filter((g) => (group ? g.id_group !== group.id_group : true))
            .map((g) => g.name?.split(" ")[1])
            .filter((letter) => letter?.length === 1);

        setOccupiedSections(currentOccupied);

        if (!group) {
            if (currentOccupied.includes(formData.sectionLetter)) {
                const available = generateAlphabeticalOptions(currentOccupied, group);
                setFormData((prev) => ({
                    ...prev,
                    sectionLetter: available[0] || "A",
                }));
            }
        }
    }, [formData.semester, groups, group, formData.sectionLetter]);

    const generateAlphabeticalOptions = (occupied = [], currentGroup = null) => {
        const letters = [];
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode("A".charCodeAt(0) + i);
            if (!currentGroup && occupied.includes(letter)) continue;
            letters.push(letter);
        }
        return letters;
    };

    const availableSectionLetters = generateAlphabeticalOptions(occupiedSections, group);

    const handleChange = (e) => {
        const { id, value } = e.target;
        let newValue = value;

        setErrors((prev) => ({ ...prev, backendCollision: "", name: "" }));

        if (id === "maxStudents") newValue = Number.parseInt(value) || 1;

        if (id === "sectionLetter") {
            setFormData({ ...formData, sectionLetter: newValue });
            return;
        }

        if (id === "semester") {
            setFormData((prev) => ({ ...prev, semester: newValue }));
            return;
        }

        setFormData({ ...formData, [id]: newValue });
    };

    const handleAddStudent = () => {
        const { email, tutorId } = newStudentInput;
      console.log("--- DEBUG VALIDACIÓN ---");
      console.log("Email a validar (raw):", email);
      console.log("Email a validar (trim):", email.trim());
        if (!email.trim()) {
            setErrors({ ...errors, addStudentData: "El email del estudiante es requerido." });
            return;
        }

        if (!isValidStudentEmail(email.trim())) {
            setErrors({
              ...errors,
              addStudentData: "Formato inválido. Debe ser: nombre.apellido@dominio.com (o nombre-apellido)",
            });
            return;
        }

        if (!tutorId || tutorId === "0") {
            setErrors({ ...errors, addStudentData: "Debe seleccionar un tutor para el estudiante." });
            return;
        }
        if (addStudentData.some((s) => s.email === email)) {
            setErrors({
                ...errors,
                addStudentData: `El estudiante ${email} ya está en la lista.`,
            });
            return;
        }

        setAddStudentData([...addStudentData, { email: email.trim(), tutorId: Number(tutorId) }]);
        setNewStudentInput({ email: "", tutorId: "" });
        setErrors((prev) => ({ ...prev, addStudentData: "" }));
    };

    const handleRemoveStudent = (emailToRemove) => {
        setAddStudentData(addStudentData.filter((s) => s.email !== emailToRemove));
    };

    const validateForm = () => {
        const newErrors = {
            name: "",
            semester: "",
            maxStudents: "",
            addStudentData: "",
            backendCollision: "",
        };

        const nameToValidate = groupNameFull;
        const { semester, maxStudents } = formData;
        const projectedCount = currentStudentCount + addStudentData.length;

        if (!nameToValidate.trim()) newErrors.name = "El nombre del grupo es requerido";

        if (!semester || semester === "0") newErrors.semester = "Debe seleccionar un semestre";

        if (!maxStudents) {
            newErrors.maxStudents = "La capacidad es requerida";
        } else if (maxStudents < projectedCount) {
            newErrors.maxStudents = `La capacidad (${maxStudents}) debe ser al menos ${projectedCount}.`;
        } else if (isNaN(maxStudents) || maxStudents <= 0) {
            newErrors.maxStudents = "La capacidad debe ser un número válido mayor a 0";
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e !== "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors((prev) => ({ ...prev, backendCollision: "" }));

        if (!validateForm()) return;

        const baseData = {
            name: groupNameFull,
            semester: formData.semester,
            maxStudents: formData.maxStudents,
        };

        if (!group) {
            const dataToSend = {
                groupData: baseData,
                newStudentsData: addStudentData,
            };
            try {
                await onSubmit(dataToSend);
            } catch (error) {
                setErrors((prev) => ({
                    ...prev,
                    backendCollision: error.message || "Error al crear grupo.",
                }));
            }
            return;
        }

        if (semesterChanged) {
            try {
                await onSubmit({
                    name: groupNameFull,
                    semester: formData.semester,
                    maxStudents: formData.maxStudents,
                });
            } catch (error) {
                setErrors((prev) => ({
                    ...prev,
                    backendCollision: error.message || "Error al actualizar grupo.",
                }));
            }
            return;
        }

        try {
            await onSubmit({
                ...baseData,
                addStudentData: addStudentData,
            });
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                backendCollision: error.message || "Error al actualizar grupo.",
            }));
        }
    };

    if (!isOpen) return null;

    const semesterOptions = ["1", "2", "3", "4", "5", "6"];

    return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a2332] border border-[#2a3544] text-white rounded-xl shadow-2xl w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-2 p-6 border-b border-[#2a3544]">
          <h2 className="text-2xl font-bold">
            {group ? "Editar Grupo" : "Crear Nuevo Grupo"}
          </h2>
          <p className="text-sm text-gray-400">
            {group
              ? "Modifica los datos del grupo y su capacidad."
              : "Define los parámetros del nuevo grupo y asigna los estudiantes iniciales."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">

            {/* INPUT: Nombre del Grupo */}
            <div className="space-y-2">
              <label
                htmlFor="sectionLetter"
                className="text-sm font-semibold leading-none text-gray-300"
              >
                Nombre del Grupo *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-white text-base py-2.5 px-3 bg-[#0f1419] border border-[#2a3544] rounded-md flex-shrink-0">
                  Sección
                </span>

                <select
                  id="sectionLetter"
                  value={formData.sectionLetter}
                  onChange={handleChange}
                  className="w-20 bg-[#0f1419] border border-[#2a3544] text-white p-2.5 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-colors duration-200"
                >
                  {availableSectionLetters.length > 0 ? (
                    availableSectionLetters.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))
                  ) : (
                    <option value={formData.sectionLetter}>{formData.sectionLetter}</option>
                  )}
                </select>

                {/* Mostrar mensaje de ocupación solo en modo CREACIÓN */}
                {!group && availableSectionLetters.length === 0 && (
                  <p className="text-xs text-red-400 font-medium ml-2">
                    Todas las secciones (A-Z) están ocupadas en el semestre {formData.semester}.
                  </p>
                )}
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 font-medium">{errors.name}</p>
              )}
            </div>

            {/* INPUT: Semestre */}
            <div className="space-y-2">
              <label
                htmlFor="semester"
                className="text-sm font-semibold leading-none text-gray-300"
              >
                Semestre *
              </label>
              <select
                id="semester"
                value={formData.semester}
                onChange={handleChange}
                className="bg-[#0f1419] border border-[#2a3544] text-white w-full p-2.5 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-colors duration-200"
              >
                <option value="0" disabled>
                  Selecciona el semestre
                </option>
                {semesterOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="text-xs text-red-400 font-medium">{errors.semester}</p>
              )}

              {semesterChanged && (
                <div className="p-3 bg-yellow-900/50 border border-yellow-700/50 text-yellow-300 rounded-lg flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  Advertencia: El cambio de semestre **inactivará todas las evaluaciones**
                  anteriores. Solo se actualizará el nombre y el semestre.
                </div>
              )}
            </div>

            {/* NEW: Mensaje de error backend */}
            {errors.backendCollision && (
              <div className="p-3 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <strong>Error de Validación:</strong> {errors.backendCollision}
              </div>
            )}

            {/* INPUT: Capacidad Máxima */}
            <div className="space-y-2">
              <label
                htmlFor="maxStudents"
                className="text-sm font-semibold leading-none text-gray-300"
              >
                Capacidad Máxima de Estudiantes *
              </label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                min={1}
                onChange={handleChange}
                disabled={semesterChanged}
                className={`bg-[#0f1419] border border-[#2a3544] text-white placeholder:text-gray-500 ${
                  semesterChanged ? "opacity-50 cursor-not-allowed" : ""
                }`}
                placeholder="Ej: 30"
              />
              {errors.maxStudents && (
                <p className="text-xs text-red-400 font-medium">{errors.maxStudents}</p>
              )}
              {group && (
                <p className="text-xs text-gray-500">
                  Estudiantes actuales: {currentStudentCount}. Capacidad mínima requerida:{" "}
                  {currentStudentCount + addStudentData.length}.
                </p>
              )}
            </div>

            {/* SECCIÓN: Agregar Estudiantes */}
            <div
              className={`space-y-3 p-4 border border-[#2a3544] rounded-lg ${
                semesterChanged ? "opacity-50 pointer-events-none bg-[#101419]" : ""
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-200">
                {group ? "Gestionar Estudiantes" : "Estudiantes Iniciales"}
              </h3>

              {/* Formulario de adición */}
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={newStudentInput.email}
                  onChange={(e) =>
                    setNewStudentInput({ ...newStudentInput, email: e.target.value })
                  }
                  placeholder="Email del estudiante"
                  className="flex-grow bg-[#0f1419] border-[#2a3544]"
                  disabled={semesterChanged}
                />

                {/* SELECTOR DE TUTOR */}
                <select
                  value={newStudentInput.tutorId}
                  onChange={(e) =>
                    setNewStudentInput({
                      ...newStudentInput,
                      tutorId: e.target.value,
                    })
                  }
                  className="w-40 bg-[#0f1419] border border-[#2a3544] text-white p-2 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-colors duration-200"
                  disabled={semesterChanged}
                >
                  <option value="">Seleccionar Tutor *</option>
                  {teachers.map((tutor) => (
                    <option key={tutor.idTeacher} value={tutor.idTeacher}>
                      {tutor.name} {tutor.surname}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={handleAddStudent}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
                  disabled={semesterChanged}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {errors.addStudentData && (
                <p className="text-xs text-red-400 font-medium">{errors.addStudentData}</p>
              )}

              {/* Lista de estudiantes */}
              {addStudentData.length > 0 && (
                <div className="space-y-2 mt-3 max-h-32 overflow-y-auto border-t border-[#2a3544] pt-3">
                  <p className="text-sm text-gray-400 font-semibold">
                    Añadirán ({addStudentData.length}):
                  </p>
                  {addStudentData.map((s, index) => {
                    const tutor = teachers.find((t) => t.idTeacher === s.tutorId);
                    const tutorName = tutor
                      ? `${tutor.name} ${tutor.surname}`
                      : `ID: ${s.tutorId}`;

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs p-2 bg-[#2a3544] rounded"
                      >
                        <span>
                          {s.email} (Tutor: {tutorName})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(s.email)}
                          className="text-red-400 hover:text-red-500 ml-2 p-1 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-[#2a3544] mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-[#2a3544]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {group ? "Guardar Cambios" : "Crear Grupo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

}

export default GroupForm;
