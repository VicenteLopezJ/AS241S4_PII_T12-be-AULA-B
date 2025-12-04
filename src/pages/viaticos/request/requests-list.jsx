import Sidebar from "../../../components/viaticos/Sidebar";
import React, { useState, useEffect } from 'react';
import RequestTable from "../../../components/viaticos/request/RequestTable";
import { listarViaticos } from "../../../services/viaticos/request/Request-service";
import TransactionModal from "../../../components/viaticos/request/TransactionModal";

export default function VTRequestList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSpent, setEditingSpent] = useState(null);

  const handleEdit = (spent) => {
    setEditingSpent(spent);   // guardas el gasto seleccionado
    setIsModalOpen(true);     // abres el modal
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await listarViaticos();
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
        console.error("Error al listar viáticos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-[#131720] font-sans text-slate-200 overflow-hidden w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto h-full bg-[#131720] relative scroll-smooth">
        <div className="w-full p-6 md:p-10 space-y-8 pb-20 max-w-[1600px] mx-auto">

          {/* Header Superior: Titulo y Boton Crear */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#191f2b] p-6 rounded-lg border-b-4 border-[#1e232d]">
  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
    Gestión de viáticos y movilidad
  </h1>

  <button
    onClick={() => {
      setEditingSpent(null);     // 👈 asegúrate de que no haya datos previos
      setIsModalOpen(true);      // 👈 abre el modal en modo creación
    }}
    className="flex items-center gap-2 bg-[#38c172] hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded shadow-lg shadow-green-900/20 transition-all"
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
    Nuevo Viático
  </button>
</div>
          

          {/* Tabla con edición */}
          <RequestTable
            data={data}
            loading={loading}
            onEdit={handleEdit}
          />

          {/* Modal de creación/edición */}
          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={editingSpent}   // 👈 aquí pasas el gasto a editar
          />
        </div>
      </main>
    </div>
  );
}