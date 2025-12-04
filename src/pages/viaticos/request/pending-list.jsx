import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/viaticos/Sidebar";
import TransactionModal from "../../../components/viaticos/request/TransactionModal";
import { aprobarViatico, rechazarViatico } from "../../../services/viaticos/request/Approbation-service";
import { listarViaticosPendientes } from "../../../services/viaticos/request/Request-service";
import { ChevronDown, Search } from "lucide-react";

export default function PendingList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await listarViaticosPendientes();
      console.log("📦 Datos recibidos:", response);
      const formatted = response.map((item) => ({
        id: item.id_spent,
        ticket: item.ticket_number,
        centro: item.cost_center_name,
        trabajador: item.manager_name,
        monto: `S/ ${item.spent_value}`,
        estado: item.state,
      }));
      setData(formatted);
    } catch (error) {
      console.error("❌ Error al listar viáticos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Aprobar / Rechazar
  const handleApprove = async (id) => {
  try {
    const managerId = JSON.parse(localStorage.getItem("user"))?.id_manager || 1; 
    await aprobarViatico(id, { id_manager: managerId });
    fetchData();
  } catch (err) {
    console.error("❌ Error al aprobar viático:", err);
  }
};

const handleReject = async (id) => {
  try {
    const managerId = JSON.parse(localStorage.getItem("user"))?.id_manager || 1;
    await rechazarViatico(id, { id_manager: managerId });
    fetchData();
  } catch (err) {
    console.error("❌ Error al rechazar viático:", err);
  }
};



  // 🔄 Paginación
  const totalPaginas = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  if (loading) return <div className="text-white p-8">Cargando...</div>;

  return (
    <div className="flex h-screen bg-[#131720] font-sans text-slate-200 overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-full bg-[#131720] relative scroll-smooth">
        <div className="w-full p-6 md:p-10 space-y-8 pb-20 max-w-[1600px] mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#191f2b] p-6 rounded-lg border-b-4 border-[#1e232d]">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Gestión de aprobaciones
            </h1>
          </div>
          {/* Barra de herramientas */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o destino.."
                className="w-full bg-[#3f4555] text-slate-200 text-sm rounded-md py-2.5 pl-10 pr-4 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 border border-transparent"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-[#1e232d] rounded-t-lg border border-slate-700/50 overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-300 uppercase font-bold tracking-wider bg-[#2d3442] border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">TICKET</th>
                    <th className="px-6 py-4">CENTRO DE COSTOS</th>
                    <th className="px-6 py-4">TRABAJADOR</th>
                    <th className="px-6 py-4">MONTO</th>
                    <th className="px-6 py-4">ESTADO</th>
                    <th className="px-6 py-4 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => {
                    let estadoLabel = "";
                    let estadoClass = "";
                    switch (item.estado) {
                      case "A":
                        estadoLabel = "Aprobado";
                        estadoClass = "bg-[#bbf7d0] text-emerald-900";
                        break;
                      case "R":
                        estadoLabel = "Rechazado";
                        estadoClass = "bg-[#fecdd3] text-rose-900";
                        break;
                      case "P":
                      default:
                        estadoLabel = "Pendiente";
                        estadoClass = "bg-[#fef08a] text-yellow-900";
                        break;
                    }
                    return (
                      <tr
                        key={item.id}
                        className="group border-b border-slate-700/50 border-dotted last:border-none hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-5 text-slate-400">{item.id}</td>
                        <td className="px-6 py-5 text-slate-300">{item.ticket}</td>
                        <td className="px-6 py-5 text-slate-300">{item.centro}</td>
                        <td className="px-6 py-5 text-slate-300">{item.trabajador}</td>
                        <td className="px-6 py-5 text-slate-300">{item.monto}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-sm text-xs font-bold ${estadoClass}`}>
                            {estadoLabel}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center space-x-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Rechazar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))
                }
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
      </main>
    </div>
  );
}