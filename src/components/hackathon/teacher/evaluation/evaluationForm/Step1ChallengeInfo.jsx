import { useEffect, useState, useMemo } from "react";
import { X, Plus, Search, AlertCircle, CheckSquare, Square,Upload } from "lucide-react";
import { getCriteria } from ".././../../../../services/hackathon/criterionService";

const TRACK_OPTIONS = [
  { value: 1, label: "1er Track" },
  { value: 2, label: "2do Track" },
  { value: 3, label: "3er Track" },
];

export default function Step1ChallengeInfo({ formData, setFormData, onImportClick }) {
  const [criteria, setCriteria] = useState(
    formData.criteria?.length
      ? formData.criteria
      : [{ id: 1, criterionDescription: "", maxScore: "", track: 1, teachingUnit: "" }]
  );

  const [maxResult, setMaxResult] = useState(formData.maxResult || 20);
  const [existingCriteria, setExistingCriteria] = useState([]);
  const [search, setSearch] = useState("");
  const [showSelector, setShowSelector] = useState(false);
  const [touched, setTouched] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // Verifica si la prop criteria del formulario es diferente al estado local
    // y si la prop tiene datos (es decir, fue actualizada por la importación)
    if (formData.criteria && formData.criteria !== criteria) {
      setCriteria(formData.criteria);
    }
    // Opcionalmente, sincronizar maxResult también si la importación lo cambia
    if (formData.maxResult && formData.maxResult !== maxResult) {
      setMaxResult(formData.maxResult);
    }
  }, [formData.criteria, formData.maxResult]);
  useEffect(() => {
    if (formData.maxResult === undefined) {
      updateField("maxResult", 20);
    }
  }, []);

  useEffect(() => {
    getCriteria()
      .then((res) =>
        setExistingCriteria(
          res.map((c) => ({
            id: c.idCriterion,
            existingCriterionId: c.idCriterion,
            criterionDescription: c.criterionDescription,
            maxScore: c.maxScore,
            track: c.track || 1,
            teachingUnit: c.teachingUnit || ""
          }))
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (showSelector) setSelectedIds([]);
  }, [showSelector]);

  const uniqueTeachingUnits = useMemo(() => {
    const units = existingCriteria
      .map((c) => c.teachingUnit)
      .filter((u) => u && u.trim() !== "");
    return [...new Set(units)];
  }, [existingCriteria]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const isValidNumber = (num) => num !== "" && Number(num) > 0;
  const isValidTitleLength = (value) => (value?.trim().length || 0) >= 10;
  const isValidDescriptionLength = (value) => (value?.trim().length || 0) >= 20;
  const getErrorClass = (isValid) => touched && !isValid ? "border-red-500 focus:border-red-500" : "border-[#3a4757]";
  const currentTotalScore = criteria.reduce((sum, c) => sum + (parseFloat(c.maxScore) || 0), 0);
  const selectedItemsData = existingCriteria.filter(c => selectedIds.includes(c.id));
  const selectedTotalScore = selectedItemsData.reduce((sum, c) => sum + (parseFloat(c.maxScore) || 0), 0);
  const isOverLimit = (currentTotalScore + selectedTotalScore) > Number(maxResult);
  const isOverLimitLoose = (currentTotalScore + selectedTotalScore) > (Number(maxResult) + 0.01);


  const addCriteria = () => {
    setTouched(true);
    const newId = Math.max(...criteria.map((c) => c.id), 0) + 1;
    const newList = [...criteria, { id: newId, criterionDescription: "", maxScore: "", track: 1, teachingUnit: "" }];
    setCriteria(newList);
    setFormData((prev) => ({ ...prev, criteria: newList }));
  };

  const removeCriteria = (id) => {
    if (criteria.length === 1) return;
    const newList = criteria.filter((c) => c.id !== id);
    setCriteria(newList);
    setFormData((prev) => ({ ...prev, criteria: newList }));
  };

  const updateCriteria = (id, field, value) => {
    setTouched(true);
    const newList = criteria.map((c) => c.id === id ? { ...c, [field]: value } : c);
    setCriteria(newList);
    setFormData((prev) => ({ ...prev, criteria: newList }));
  };

  const maxResultMismatch = Math.abs(currentTotalScore - Number(maxResult)) > 0.01;

  
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const confirmSelection = () => {
    setTouched(true);
    const newItems = selectedItemsData.map(item => ({
        existingCriterionId: item.id,
        criterionDescription: item.criterionDescription,
        maxScore: Number(item.maxScore),
        track: Number(item.track),
        teachingUnit: item.teachingUnit || ""
    }));

    const isDefaultRowEmpty = criteria.length === 1 && criteria[0].criterionDescription.trim() === "";
  
    let newList = [...criteria];
    let maxId = Math.max(...criteria.map((c) => c.id), 0);

    if (isDefaultRowEmpty) {
        newList = []; 
    }

    const itemsWithIds = newItems.map((item, index) => ({
        ...item,
        id: maxId + index + 1
    }));

    const finalCriteriaList = [...newList, ...itemsWithIds];

    setCriteria(finalCriteriaList);
    setFormData((prev) => ({ ...prev, criteria: finalCriteriaList }));
    setShowSelector(false);
    setSearch("");
    setSelectedIds([]);
  };

  const filteredCriteria = existingCriteria.filter((c) =>
    c.criterionDescription.toLowerCase().includes(search.toLowerCase()) ||
    c.teachingUnit?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" onClick={() => setTouched(true)}> 
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#e4e4e7] mb-2">
            Título del Challenge <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.challengeTitle || ""}
            onChange={(e) => updateField("challengeTitle", e.target.value)}
            className={`w-full bg-[#1a2332] border rounded-lg px-4 py-2 text-[#e4e4e7] ${getErrorClass(isValidTitleLength(formData.challengeTitle))}`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#e4e4e7] mb-2">
            Semestre <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.groupSemester || ""}
            onChange={(e) => updateField("groupSemester", e.target.value)}
            className={`w-full bg-[#1a2332] border rounded-lg px-4 py-2 text-[#e4e4e7] ${getErrorClass(formData.groupSemester)}`}
          >
            <option value="">Seleccionar</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}º Semestre</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#e4e4e7] mb-2">
          Descripción del Challenge <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.challengeDescription || ""}
          onChange={(e) => updateField("challengeDescription", e.target.value)}
          rows={3}
          className={`w-full bg-[#1a2332] border rounded-lg px-4 py-2 text-[#e4e4e7] ${getErrorClass(isValidDescriptionLength(formData.challengeDescription))}`}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#e4e4e7] mb-2">
          Nota Máxima Global
        </label>
        <div className="flex items-center gap-3">
            <input
            type="number"
            step="0.1" 
            min="0.1"
            value={maxResult}
            onChange={(e) => {
                const val = e.target.value;
                setMaxResult(val); 
                updateField("maxResult", val);
            }}
            className={`w-32 bg-[#1a2332] border rounded-lg px-3 py-2 text-[#e4e4e7] ${getErrorClass(isValidNumber(maxResult))}`}
            />
            {touched && !isValidNumber(maxResult) && (
                <span className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={14}/> Debe ser mayor a 0
                </span>
            )}
        </div>
      </div>

      <div className="border-t border-[#3a4757] pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#e4e4e7]">
            Criterios de Evaluación
          </h3>
          <div className="flex gap-3">
            <button 
                onClick={onImportClick} 
                className="flex items-center gap-2 bg-[#f97316] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#ea580c] transition-colors"
            >
                <Upload size={16} /> Importar
            </button>
            <button onClick={() => setShowSelector(true)} className="flex items-center gap-2 bg-[#0284c7] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#0369a1]">
              <Search size={16} /> Buscar existentes
            </button>
            <button onClick={addCriteria} className="flex items-center gap-2 bg-[#10b981] text-[#0f172a] px-3 py-1 rounded-lg text-sm hover:bg-[#059669]">
              <Plus size={16} /> Agregar
            </button>
          </div>
        </div>

        <div className="hidden md:flex gap-2 text-xs text-gray-400 px-1 mb-1">
            <div className="flex-[2]">Descripción <span className="text-red-500">*</span></div>
            <div className="flex-1">Unidad de Aprendizaje <span className="text-red-500">*</span></div>
            <div className="w-32">Track</div>
            <div className="w-24">Puntaje <span className="text-red-500">*</span></div>
            <div className="w-8"></div>
        </div>

        <div className="space-y-3">
          {criteria.map((criterion) => {
             
             const isDescValid = criterion.criterionDescription.trim() !== "";
             const isUnitValid = criterion.teachingUnit.trim() !== "";
             const isScoreValid = isValidNumber(criterion.maxScore);

             return (
                <div key={criterion.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-[#131b26] p-3 rounded-lg border border-[#1e293b]">
                
                <div className="flex-[2] w-full">
                    <input
                    type="text"
                    value={criterion.criterionDescription}
                    onChange={(e) => updateCriteria(criterion.id, "criterionDescription", e.target.value)}
                    placeholder="Descripción"
                    className={`w-full bg-[#1a2332] border rounded-lg px-3 py-2 text-[#e4e4e7] text-sm ${getErrorClass(isDescValid)}`}
                    />
                </div>

                <div className="flex-1 w-full">
                    <input
                    type="text"
                    list={`units-${criterion.id}`}
                    value={criterion.teachingUnit}
                    onChange={(e) => updateCriteria(criterion.id, "teachingUnit", e.target.value)}
                    placeholder="Unidad"
                    className={`w-full bg-[#1a2332] border rounded-lg px-3 py-2 text-[#e4e4e7] text-sm ${getErrorClass(isUnitValid)}`}
                    />
                    <datalist id={`units-${criterion.id}`}>
                        {uniqueTeachingUnits.map((unit, idx) => <option key={idx} value={unit} />)}
                    </datalist>
                </div>

                <div className="w-full md:w-32">
                    <select
                        value={criterion.track}
                        onChange={(e) => updateCriteria(criterion.id, "track", Number(e.target.value))}
                        className="w-full bg-[#1a2332] border border-[#3a4757] rounded-lg px-2 py-2 text-[#e4e4e7] text-sm"
                    >
                        {TRACK_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-24 relative">
                    <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={criterion.maxScore}
                    onChange={(e) => updateCriteria(criterion.id, "maxScore", e.target.value)}
                    placeholder="0.0"
                    className={`w-full bg-[#1a2332] border rounded-lg px-3 py-2 text-[#e4e4e7] text-sm text-center ${getErrorClass(isScoreValid)}`}
                    />
                </div>

                <button
                    onClick={() => removeCriteria(criterion.id)}
                    disabled={criteria.length === 1}
                    className="p-2 text-[#ef4444] hover:bg-[#3a4757] rounded-lg disabled:opacity-50"
                >
                    <X size={18} />
                </button>
                </div>
             );
          })}
        </div>

        <div className={`mt-4 bg-[#1a2332] rounded-lg p-4 border flex justify-between items-center ${maxResultMismatch ? 'border-red-500/50' : 'border-[#3a4757]'}`}>
          <div>
             <div className="text-sm text-[#8b94a8]">Puntaje Total</div>
             {maxResultMismatch && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12}/> La suma ({currentTotalScore.toFixed(2)}) no coincide con la nota máxima ({Number(maxResult).toFixed(2)})
                </p>
             )}
          </div>
          <div className={`text-2xl font-bold ${maxResultMismatch ? "text-red-400" : "text-[#10b981]"}`}>
            {currentTotalScore.toFixed(2)} <span className="text-gray-500 text-lg">/ {Number(maxResult).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center backdrop-blur-sm">
             <div className="bg-[#1e293b] flex flex-col rounded-xl border border-[#334155] w-[600px] max-h-[85vh] shadow-2xl">
                 
                 <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#0f172a] rounded-t-xl">
                     <div>
                        <h3 className="text-white font-bold text-lg">Biblioteca de Criterios</h3>
                        <p className="text-xs text-gray-400">
                            Seleccionados: {selectedIds.length} | Suma: {selectedTotalScore.toFixed(2)} pts
                        </p>
                     </div>
                     <div className="flex gap-2">
                        <button 
                            onClick={confirmSelection} 
                            disabled={selectedIds.length === 0 || isOverLimitLoose}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${selectedIds.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 
                                  isOverLimitLoose ? 'bg-red-500/20 text-red-400 border border-red-500/50 cursor-not-allowed' :
                                  'bg-[#10b981] text-black hover:bg-[#059669] shadow-lg shadow-green-900/20'}`}>
                            {isOverLimitLoose ? "Excede Nota Máxima" : "Agregar Seleccionados"}
                        </button>
                        <button onClick={() => setShowSelector(false)} className="p-2 hover:bg-[#334155] rounded-lg text-gray-400"><X/></button>
                     </div>
                 </div>

                 {isOverLimitLoose && (
                     <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center">
                         <p className="text-red-400 text-xs font-medium flex justify-center items-center gap-2">
                            <AlertCircle size={14}/>
                            La selección ({selectedTotalScore} pts) + lo actual ({currentTotalScore} pts) excede el máximo ({maxResult}).
                         </p>
                     </div>
                 )}

                 <div className="p-4 border-b border-[#334155]">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input 
                            className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#0284c7] outline-none"
                            placeholder="Buscar por descripción o unidad..."
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                        />
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {filteredCriteria.map(c => {
                        const isSelected = selectedIds.includes(c.id);
                        return (
                            <div 
                                key={c.id} 
                                onClick={() => toggleSelection(c.id)}
                                className={`
                                    flex gap-3 items-start p-3 rounded-lg border cursor-pointer transition-all group
                                    ${isSelected 
                                        ? 'bg-[#0284c7]/10 border-[#0284c7] shadow-md' 
                                        : 'bg-[#0f172a] border-[#334155] hover:border-gray-500'}
                                `}
                            >
                                <div className="mt-1">
                                    {isSelected 
                                        ? <CheckSquare className="text-[#0284c7]" size={20}/> 
                                        : <Square className="text-gray-500 group-hover:text-gray-300" size={20}/>
                                    }
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {c.criterionDescription}
                                        </p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 whitespace-nowrap ${isSelected ? 'bg-[#0284c7] text-white' : 'bg-[#1e293b] text-[#10b981]'}`}>
                                            {c.maxScore} pts
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                        <span className="bg-[#1e293b] px-1.5 py-0.5 rounded border border-[#334155]">{c.teachingUnit}</span>
                                        <span className="bg-[#1e293b] px-1.5 py-0.5 rounded border border-[#334155]">Track {c.track}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredCriteria.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No se encontraron resultados</p>
                    )}
                 </div>
             </div>
        </div>
      )}
    </div>
  );
}