import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/viaticos/Sidebar";
import {
  listarCentroDeCostos,
  eliminarCentroDeCosto,
  restaurarCentroDeCosto,
} from "../../../services/viaticos/cost/Cost-services";
import CostForm from "./Cost-form";
import { listarTrabajadores } from "../../../services/viaticos/worker/Worker-services";
import { listarJefesArea } from "../../../services/viaticos/manager/Manager-service";


function App() {
  // --- ESTADOS Y LÓGICA ORIGINAL ---
  const [cost, setCost] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [menuDirection, setMenuDirection] = useState("down");
  const [currentPage, setCurrentPage] = useState(1);
  const [CostToEdit, setCostToEdit] = useState(null);
  const [workersList, setWorkersList] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);


  const registrosPorPagina = 5;
  const totalPaginas = Math.ceil(cost.length / registrosPorPagina);
  const costosVisibles = cost.slice(
    (currentPage - 1) * registrosPorPagina,
    currentPage * registrosPorPagina
  );

  useEffect(() => {
    fetchCost();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areas = await listarJefesArea();
        const workers = await listarTrabajadores();

        console.log("Areas (raw):", areas);
        console.log("Workers (raw):", workers);

        // Si tu API envía { data: [...] } u otra envoltura, ajusta aquí:
        const areasList = Array.isArray(areas) ? areas : areas?.data ?? [];
        const workersListRaw = Array.isArray(workers) ? workers : workers?.data ?? [];

        setAreaManagers(areasList);
        setWorkersList(workersListRaw);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
      }
    };
    fetchData();
  }, []);

  const fetchCost = async () => {
    try {
      const data = await listarCentroDeCostos();
      setCost(data);
    } catch (error) {
      console.error("❌ Error al cargar costos:", error);
    }
  };

  const getManagerName = (id_manager) => {
    if (!id_manager || !Array.isArray(areaManagers) || !Array.isArray(workersList)) return "ninguno";

    // Buscar el área por id_manager
    const area = areaManagers.find(a => String(a.id_manager) === String(id_manager));
    if (!area) return "ninguno";

    // Buscar el trabajador por id_worker del área
    const worker = workersList.find(w => String(w.id_worker) === String(area.id_worker));
    return worker ? `${worker.name} ${worker.last_name}` : "ninguno";
  };

  const handleMenuToggle = (index, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const espacioDisponible = window.innerHeight - rect.bottom;
    setMenuDirection(espacioDisponible < 200 ? "up" : "down");
    setActiveMenu(activeMenu === index ? null : index);
  };

  const handleDelete = async (id) => {
    try {
      await eliminarCentroDeCosto(id);
      fetchCost();
      setActiveMenu(null);
    } catch (error) {
      console.error("❌ Error al eliminar centro de costos:", error);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restaurarCentroDeCosto(id);
      fetchCost();
      setActiveMenu(null);
    } catch (error) {
      console.error("❌ Error al restaurar centro de costos:", error);
    }
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex h-screen bg-[#131720] font-sans text-slate-200 overflow-hidden w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto h-full bg-[#131720] relative scroll-smooth p-6 md:p-10 pb-20">
        <div className="w-full max-w-[1600px] mx-auto space-y-8">

          {/* Header Superior: Titulo y Boton Crear */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#191f2b] p-6 rounded-lg border-b-4 border-[#1e232d]">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Gestión de centros de costos
            </h1>
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded shadow-lg shadow-emerald-900/20 transition-all"
            >
              Crear transacción
            </button>
          </div>

          <div className="flex flex-col h-full">
            {/* Barra de Herramientas (Filtros y Buscador - Nuevo Diseño) */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Dropdown Estado */}
              <div className="w-full sm:w-auto relative group">
                <button className="flex items-center justify-between bg-[#1e1e1e] text-white px-4 py-2.5 rounded-md text-sm font-bold min-w-[120px] hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                  Estado
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 text-slate-400"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {/* Aquí podrías agregar el menú desplegable de filtros si lo deseas */}
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o destino.."
                  className="w-full bg-[#3f4555] text-slate-200 text-sm rounded-md py-2.5 pl-10 pr-4 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 border border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tabla (Nuevo Diseño) */}
            <div className="bg-[#1e232d] rounded-t-lg border border-slate-700/50 overflow-hidden flex-1 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  {/* Header de Tabla */}
                  <thead className="text-xs text-slate-300 uppercase font-bold tracking-wider bg-[#2d3442] border-b border-slate-600">
                    <tr>
                      <th className="px-6 py-4">CODIGO</th>
                      <th className="px-6 py-4">JEFE DE CENTRO DE COSTOS</th>
                      <th className="px-6 py-4">NOMBRE DE CENTRO DE COSTOS</th>
                      <th className="px-6 py-4">ESTADO</th>
                      <th className="px-6 py-4 text-center">ACCIONES</th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    {costosVisibles.length > 0 ? (
                      costosVisibles.map((item, index) => {
                        // Lógica de visualización de estado
                        let estadoLabel = "Pendiente";
                        let estadoClasses = "bg-[#fef08a] text-yellow-900"; // Amarillo por defecto

                        if (item.status === "A" || item.status === "Activo") {
                          estadoLabel = "Activo";
                          estadoClasses = "bg-[#bbf7d0] text-emerald-900"; // Verde
                        } else if (
                          item.status === "I" ||
                          item.status === "Inactivo"
                        ) {
                          estadoLabel = "Inactivo";
                          estadoClasses = "bg-[#fecdd3] text-rose-900"; // Rojo
                        }

                        return (
                          <tr
                            key={index}
                            className="group border-b border-slate-700/50 border-dotted last:border-none hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-6 py-5 text-slate-300 font-medium">
                              {item.code}
                            </td>
                            <td className="px-4 py-2.5 text-white">
                              {getManagerName(item.id_manager)}
                            </td>
                            <td className="px-6 py-5 text-slate-300">
                              {item.name}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`px-3 py-1 rounded-sm text-xs font-bold ${estadoClasses}`}
                              >
                                {estadoLabel}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center relative">
                              {/* Menú de Acciones (Reemplazo de ItemActionsMenu) */}
                              <button
                                onClick={(e) => handleMenuToggle(index, e)}
                                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </button>

                              {/* Dropdown flotante */}
                              {activeMenu === index && (
                                <div
                                  className={`absolute right-10 z-50 w-36 bg-[#2d3442] rounded-md shadow-xl border border-slate-600 overflow-hidden ${menuDirection === "up"
                                      ? "bottom-full mb-2"
                                      : "mt-1 top-8"
                                    }`}
                                >
                                  {item.status === "A" ||
                                    item.status === "Activo" ? (
                                    <button
                                      onClick={() => handleDelete(item.id_center)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 flex items-center gap-2 transition-colors"
                                    >
                                      Eliminar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRestore(item.id_center)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center gap-2 transition-colors"
                                    >
                                      Restaurar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setCostToEdit(item);
                                      setShowFormModal(true);
                                      setActiveMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-blue-500/20 hover:text-blue-400 flex items-center gap-2 transition-colors"
                                  >
                                    Editar
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-10 text-slate-500 text-sm"
                        >
                          No hay registros para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer de Paginación (Nuevo Diseño conectado a lógica) */}
            <div className="bg-[#2d3442] p-3 rounded-b-lg border-x border-b border-slate-700/50 flex justify-center items-center">
              <div className="flex space-x-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === 1
                      ? "text-slate-500 cursor-not-allowed bg-transparent"
                      : "text-slate-300 bg-slate-600/50 hover:bg-slate-600"
                    }`}
                >
                  Anterior
                </button>

                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${currentPage === i + 1
                        ? "text-white bg-slate-600"
                        : "text-slate-300 hover:bg-slate-600/50"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={currentPage === totalPaginas}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === totalPaginas
                      ? "text-slate-500 cursor-not-allowed bg-transparent"
                      : "text-slate-300 bg-slate-600/50 hover:bg-slate-600"
                    }`}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Formulario */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e2d] rounded-xl shadow-2xl w-full max-w-3xl p-8 relative text-white border border-slate-700">
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setCostToEdit(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <CostForm
                onClose={() => {
                  setShowFormModal(false);
                  setCostToEdit(null);
                }}
                onRefresh={fetchCost}
                initialData={CostToEdit}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;