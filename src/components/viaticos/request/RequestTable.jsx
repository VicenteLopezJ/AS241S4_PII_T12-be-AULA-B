import { ChevronDown, Search } from "lucide-react";
import ItemActionsMenu from "./ui/ItemActionsMenu.jsx";
import DetailModal from "./ui/DetailModal";
import React, { useState } from "react";
import { enviarCorreoAprobacion } from "../../../services/viaticos/request/Approbation-service";
import { descargarPDF, descargarExcel } from "../../../services/viaticos/request/Request-service";

export const RequestTable = ({ data, loading, onEdit }) => {
  const [viewingItem, setViewingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11; 

  if (loading) return <div className="text-white p-8">Cargando...</div>;
  if (!data) return null;

  // 🔄 Calcular paginación
  const totalPaginas = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full">
      {/* Barra de Herramientas */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto">
          <button className="flex items-center justify-between bg-[#1e1e1e] text-white px-4 py-2.5 rounded-md text-sm font-bold min-w-[120px] hover:bg-slate-800 transition-colors">
            Estado
            <ChevronDown size={14} className="ml-2 text-slate-400" />
          </button>
        </div>

        {/* Buscador */}
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
              {currentData.map((item) => (
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
                    {(() => {
                      let estadoLabel = "";
                      let estadoClass = "";

                      switch (item.estado) {
                        case "A":
                          estadoLabel = "Aprobado";
                          estadoClass = "bg-[#bbf7d0] text-emerald-900"; // verde pastel
                          break;
                        case "R":
                          estadoLabel = "Rechazado";
                          estadoClass = "bg-[#fecdd3] text-rose-900"; // rojo pastel
                          break;
                        case "P":
                        default:
                          estadoLabel = "Pendiente";
                          estadoClass = "bg-[#fef08a] text-yellow-900"; // amarillo pastel
                          break;
                      }

                      return (
                        <span
                          className={`px-3 py-1 rounded-sm text-xs font-bold ${estadoClass}`}
                        >
                          {estadoLabel}
                        </span>
                      );
                    })()}
                  </td>


                  <td className="px-6 py-5 text-center">
                    <ItemActionsMenu
                      item={item}
                      onView={() => setViewingItem(item)}
                      onEdit={() => onEdit(item)}
                      onSendEmail={item.estado === "P" ? () => enviarCorreoAprobacion(item.id) : null}
                      onDownloadPdf={item.estado === "A" ? () => descargarPDF(item.id) : null}
                      onExportExcel={item.estado === "A" ? () => descargarExcel(item.id) : null}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <DetailModal item={viewingItem} onClose={() => setViewingItem(null)} />
        </div>
      </div>

      {/* Footer de Paginación */}
      <div className="bg-[#2d3442] p-3 rounded-b-lg border-x border-b border-slate-700/50 flex justify-center items-center">
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === 1
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
  );
};

export default RequestTable;