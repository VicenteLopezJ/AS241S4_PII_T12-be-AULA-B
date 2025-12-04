import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/viaticos/Sidebar";
import {
  listarTrabajadores,
  eliminarTrabajador,
  restaurarTrabajador,
} from "../../../services/viaticos/worker/Worker-services";
import WorkerForm from "./Worker-form";


function App() {
  const [workers, setWorkers] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [menuDirection, setMenuDirection] = useState("down");
  const [currentPage, setCurrentPage] = useState(1);
  const [workerToEdit, setWorkerToEdit] = useState(null);
  const registrosPorPagina = 11;
  const totalPaginas = Math.ceil(workers.length / registrosPorPagina);
  const trabajadoresVisibles = workers.slice(
    (currentPage - 1) * registrosPorPagina,
    currentPage * registrosPorPagina
  );

  useEffect(() => {
    async function fetchWorkers() {
      try {
        // En un entorno real, esta importación podría fallar si el archivo no existe.
        // Simulamos la carga para que el componente se renderice.
        const data = await listarTrabajadores();
        setWorkers(data);
      } catch (error) {
        console.error("❌ Error al cargar trabajadores:", error);
      }
    }
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const data = await listarTrabajadores();
      setWorkers(data);
    } catch (error) {
      console.error("❌ Error al cargar trabajadores:", error);
    }
  };

  const StatusChip = ({ estado }) => {
    if (!estado) return null;

    let label = estado;
    let colorClasses = "text-gray-600";
    let bgColorClasses = "bg-gray-300";

    if (estado === "A") {
      label = "Activo";
      colorClasses = "text-[#38c172]";
      bgColorClasses = "bg-[#38c172]/15";
    } else if (estado === "I") {
      label = "Inactivo";
      colorClasses = "text-[#e3342f]";
      bgColorClasses = "bg-[#e3342f]/15";
    } else if (estado === "R") {
      label = "Rechazada";
      colorClasses = "text-[#e3342f]";
      bgColorClasses = "bg-[#e3342f]/15";
    }

    return (
      <div
        className={`inline-block font-medium px-3 py-1 text-xs rounded-xl ${colorClasses} ${bgColorClasses}`}
      >
        {label}
      </div>
    );
  };

  const handleMenuToggle = (index, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const espacioDisponible = window.innerHeight - rect.bottom;

    // Si hay poco espacio debajo, muestra el menú hacia arriba
    setMenuDirection(espacioDisponible < 200 ? "up" : "down");
    setActiveMenu(activeMenu === index ? null : index);
  };

  const handleDelete = async (id_worker) => {
    try {
      await eliminarTrabajador(id_worker);
      const data = await listarTrabajadores();
      setWorkers(data);
      setActiveMenu(null);
    } catch (error) {
      console.error("❌ Error al eliminar trabajador:", error);
    }
  };

  const handleRestore = async (id_worker) => {
    try {
      await restaurarTrabajador(id_worker);
      const data = await listarTrabajadores();
      setWorkers(data);
      setActiveMenu(null);
    } catch (error) {
      console.error("❌ Error al restaurar trabajador:", error);
    }
  };

 return (
    <div className="flex h-screen bg-[#131720] font-sans text-slate-200 overflow-hidden w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto h-full bg-[#131720] relative scroll-smooth p-6 md:p-10 pb-20">
        <div className="w-full max-w-[1600px] mx-auto space-y-8">
          
          {/* Header Superior */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#191f2b] p-6 rounded-lg border-b-4 border-[#1e232d]">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Lista de trabajadores
              </h1>
            </div>
            
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-2 bg-[#38c172] hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded shadow-lg shadow-green-900/20 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Nuevo Trabajador
            </button>
          </div>

          <div className="flex flex-col h-full">
            {/* Barra de Herramientas (Filtros y Buscador - Diseño Nuevo) */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              
              <div className="flex gap-3 w-full sm:w-auto">
                {/* Dropdown Estado */}
                <div className="relative group">
                  <button className="flex items-center justify-between bg-[#1e1e1e] text-white px-4 py-2.5 rounded-md text-sm font-bold min-w-[120px] hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                    Estado
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-slate-400">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
                {/* Dropdown Ciudad (Nuevo) */}
                <div className="relative group">
                  <button className="flex items-center justify-between bg-[#1e1e1e] text-white px-4 py-2.5 rounded-md text-sm font-bold min-w-[120px] hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                    Ciudad
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-slate-400">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar trabajador, ciudad, DNI..."
                  className="w-full bg-[#3f4555] text-slate-200 text-sm rounded-md py-2.5 pl-10 pr-4 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 border border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tabla (Diseño Nuevo adaptado a Trabajadores) */}
            <div className="bg-[#1e232d] rounded-t-lg border border-slate-700/50 overflow-hidden flex-1 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  {/* Header de Tabla */}
                  <thead className="text-xs text-slate-300 uppercase font-bold tracking-wider bg-[#2d3442] border-b border-slate-600">
                    <tr>
                      <th className="px-6 py-4">NOMBRE</th>
                      <th className="px-6 py-4">APELLIDO</th>
                      <th className="px-6 py-4">DNI</th>
                      <th className="px-6 py-4">CIUDAD</th>
                      <th className="px-6 py-4">EMAIL</th>
                      <th className="px-6 py-4">ESTADO</th>
                      <th className="px-6 py-4 text-center">ACCIONES</th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    {trabajadoresVisibles.length > 0 ? (
                      trabajadoresVisibles.map((worker, index) => {
                        // Lógica de chips de estado
                        let estadoLabel = worker.status;
                        let estadoClasses = "bg-gray-700 text-gray-300";

                        if (worker.status === "A" || worker.status === "Activo") {
                          estadoLabel = "Activo";
                          estadoClasses = "bg-[#bbf7d0] text-emerald-900"; // Pastel verde
                        } else if (worker.status === "I" || worker.status === "Inactivo") {
                          estadoLabel = "Inactivo";
                          estadoClasses = "bg-[#fecdd3] text-rose-900"; // Pastel rojo
                        } else if (worker.status === "R" || worker.status === "Rechazada") {
                            estadoLabel = "Rechazada";
                            estadoClasses = "bg-[#fecdd3] text-rose-900";
                        }

                        return (
                          <tr
                            key={index}
                            className="group border-b border-slate-700/50 border-dotted last:border-none hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-6 py-5 text-slate-300 font-medium">
                              {worker.name}
                            </td>
                            <td className="px-6 py-5 text-slate-300">
                              {worker.last_name}
                            </td>
                            <td className="px-6 py-5 text-slate-400 font-mono">
                              {worker.dni}
                            </td>
                            <td className="px-6 py-5 text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                {worker.city}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-slate-300">
                              <div className="flex items-center gap-2">
                                {worker.email}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-sm text-xs font-bold ${estadoClasses}`}>
                                {estadoLabel}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center relative">
                              {/* Menú de Acciones */}
                              <button
                                onClick={(e) => handleMenuToggle(index, e)}
                                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </button>

                              {/* Dropdown flotante */}
                              {activeMenu === index && (
                                <div
                                  className={`absolute right-10 z-50 w-36 bg-[#2d3442] rounded-md shadow-xl border border-slate-600 overflow-hidden ${
                                    menuDirection === "up" ? "bottom-full mb-2" : "mt-1 top-8"
                                  }`}
                                >
                                  {worker.status === "A" ? (
                                    <button
                                      onClick={() => handleDelete(worker.id_worker)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 flex items-center gap-2 transition-colors"
                                    >
                                      Eliminar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRestore(worker.id_worker)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center gap-2 transition-colors"
                                    >
                                      Restaurar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setWorkerToEdit(worker);
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
                        <td colSpan="6" className="text-center py-10 text-slate-500 text-sm">
                          No hay trabajadores registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer de Paginación */}
            <div className="bg-[#2d3442] p-3 rounded-b-lg border-x border-b border-slate-700/50 flex justify-center items-center">
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    currentPage === 1
                      ? "text-slate-500 cursor-not-allowed bg-transparent"
                      : "text-slate-300 bg-slate-600/50 hover:bg-slate-600"
                  }`}
                >
                  Anterior
                </button>

                {[...Array(totalPaginas || 1)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                      currentPage === i + 1
                        ? "text-white bg-slate-600"
                        : "text-slate-300 hover:bg-slate-600/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                  disabled={currentPage === totalPaginas}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    currentPage === totalPaginas
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
                  setWorkerToEdit(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <WorkerForm
                onClose={() => {
                  setShowFormModal(false);
                  setWorkerToEdit(null);
                }}
                onRefresh={fetchWorkers}
                initialData={workerToEdit}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;