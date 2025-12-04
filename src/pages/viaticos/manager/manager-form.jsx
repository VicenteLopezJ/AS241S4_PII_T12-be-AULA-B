import React, { useEffect, useState, useRef } from "react";
import { registrarJefeArea, actualizarJefeArea, listarJefesArea, obtenerFirmaJefeArea} from "../../../services/viaticos/manager/Manager-service";
import { listarTrabajadores } from "../../../services/viaticos/worker/Worker-services";

const ManagerForm = ({ onClose, onRefresh, initialData }) => {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lista de trabajadores desde el backend
  const [workersList, setWorkersList] = useState([]);
  const [managersList, setManagersList] = useState([]);

  // Datos del formulario
  const [formData, setFormData] = useState({
    id_worker: initialData?.id_worker || "",
    manager_signature: initialData?.manager_signature || "", // Base64 string
  });

  const [previewSignature, setPreviewSignature] = useState(initialData?.manager_signature || null);
  const [isDragging, setIsDragging] = useState(false);

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listarTrabajadores(); 
        const managers = await listarJefesArea();
        setManagersList(managers);
        setWorkersList(data);
      } catch (err) {
        console.error("❌ Error al cargar trabajadores:", err);
      }
    };
    fetchData();
  }, []);

  const filteredWorkers = workersList
  .filter(worker => !managersList.some(m => m.id_worker === worker.id_worker))
  .filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.dni.includes(searchTerm)
  );

  useEffect(() => {
  const fetchSignature = async () => {
    if (isEdit && initialData?.id_manager) {
      try {
        const firma = await obtenerFirmaJefeArea(initialData.id_manager);
        setFormData((prev) => ({ ...prev, manager_signature: firma }));
        setPreviewSignature(firma); // 👈 se muestra directamente en <img src={previewSignature}>
      } catch (err) {
        console.error("❌ Error al cargar firma:", err);
      }
    }
  };
  fetchSignature();
}, [isEdit, initialData]);


  // --- LÓGICA DE SUBIDA DE ARCHIVOS (FIRMA) ---
const handleFile = (file) => {
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setFormData((prev) => ({ ...prev, manager_signature: base64 }));
      setPreviewSignature(base64);
    };
    reader.readAsDataURL(file);
  } else {
    alert("Por favor sube un archivo de imagen válido (PNG, JPG).");
  }
};

// --- Eliminar firma ---
const removeSignature = (e) => {
  e.stopPropagation(); // Evita abrir el selector de archivos
  setFormData((prev) => ({ ...prev, manager_signature: "" }));
  setPreviewSignature(null);
  if (fileInputRef.current) fileInputRef.current.value = "";
};

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await actualizarJefeArea(initialData.id_manager, formData);
      } else {
        await registrarJefeArea(formData);
      }
      onRefresh();
      setShowConfirmation(true);
    } catch (err) {
      console.error("❌ Error al enviar:", err);
      alert("Hubo un error al guardar los datos del jefe.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center w-full">
          {isEdit ? "Editar Datos del Jefe" : "Datos del Jefe de Área"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de Trabajador */}
        
             <div className="flex flex-col space-y-3">
          <label className="text-sm text-gray-300 font-bold uppercase tracking-wider">1. Seleccionar Trabajador</label>
          
          {/* Buscador dentro del selector */}
          <div className="relative">
             <input 
                type="text" 
                placeholder="Buscar por nombre o DNI..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#2b2b40] text-sm text-white px-4 py-2 rounded-t-lg border border-gray-600 border-b-0 focus:outline-none focus:bg-[#32324a]"
             />
             <div className="absolute right-3 top-2.5 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             </div>
          </div>

          {/* Tabla Scrollable */}
          <div className="border border-gray-600 rounded-b-lg overflow-hidden bg-[#1e232d] h-48 flex flex-col">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-400 uppercase bg-[#2b2b40] sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">DNI</th>
                    <th className="px-4 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredWorkers.length > 0 ? (
                    filteredWorkers.map(worker => {
                      const isSelected = formData.id_worker === worker.id_worker;
                      return (
                        <tr 
                          key={worker.id_worker}
                          onClick={() => setFormData({ ...formData, id_worker: worker.id_worker })}
                          className={`cursor-pointer transition-colors duration-150 
                            ${isSelected 
                              ? "bg-[#38c172]/20 hover:bg-[#38c172]/30" 
                              : "hover:bg-[#2b2b40]"
                            }`}
                        >
                          <td className="px-4 py-2.5 text-white font-medium flex items-center gap-2">
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#38c172]"></span>
                            )}
                            {`${worker.name} ${worker.last_name}`}
                          </td>
                          <td className="px-4 py-2.5 text-gray-300 font-mono">{worker.dni}</td>
                          <td className="px-4 py-2.5 text-center">
                            {isSelected ? (
                              <span className="text-[#38c172] text-xs font-bold">Seleccionado</span>
                            ) : (
                              <span className="text-gray-500 text-xs">Click para elegir</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-gray-500">
                        No se encontraron trabajadores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mensaje de ayuda */}
          <p className="text-xs text-gray-500 text-right">
            {formData.id_worker ? "Trabajador seleccionado correctamente" : "Seleccione un trabajador de la lista"}
          </p>
        </div>
        {/* Carga de Firma (Drag & Drop) */}
        <div className="flex flex-col items-start space-y-3">
          <label className="text-sm text-gray-300 font-medium">Firma (Máx. 1 archivo)</label>

          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden
              ${
                isDragging
                  ? "border-[#38c172] bg-[#38c172]/10"
                  : "border-gray-600 bg-[#2b2b40] hover:border-[#38c172] hover:bg-[#2b2b40]/80"
              }
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {previewSignature ? (
              <div className="relative w-full h-full flex items-center justify-center p-2 group">
                <img
                  src={previewSignature}
                  alt="Firma previa"
                  className="max-h-full max-w-full object-contain"
                />
                {/* Overlay para eliminar */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={removeSignature}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Eliminar Firma
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 pointer-events-none">
                <div className="mb-3 flex justify-center">
                  {/* Icono de nube de subida */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
                    viewBox="0 0 24 24" fill="none" stroke="#38c172"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Arrastre y suelte o haga click para subir archivos (PNG, JPG)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-4 mt-8 pt-4">
          <button
            type="submit"
            disabled={!formData.id_worker || !formData.manager_signature}
            className={`w-full py-3.5 rounded-lg text-sm font-bold transition-all shadow-lg flex justify-center items-center gap-2
              ${(!formData.id_worker || !formData.manager_signature)
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#38c172] hover:bg-green-600 text-white hover:shadow-green-900/20"
              }`}
          >
            {isEdit ? "Guardar Cambios" : "Crear Jefe de Área"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-lg bg-transparent hover:bg-white/5 border border-gray-600 text-gray-400 hover:text-white text-sm font-medium transition-all"
          >
            Descartar
          </button>
        </div>
    {/* Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl text-center max-w-md w-full border border-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
              alt="Confirmación"
              className="w-20 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              {isEdit ? "¡Jefe actualizado!" : "¡Jefe de area creado!"}
            </h3>
            <p className="text-gray-300 mb-6">
              {isEdit
                ? "Los cambios se han guardado correctamente."
                : "El registro se ha completado correctamente."}
            </p>
            <button
              onClick={() => {
                setShowConfirmation(false);
                onRefresh();
                onClose();
              }}
              className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      </form>
    </div>
  );
};

export default ManagerForm;