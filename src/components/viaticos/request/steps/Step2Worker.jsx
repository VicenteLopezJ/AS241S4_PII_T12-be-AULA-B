import { User } from "lucide-react";
import TableSelection from "../ui/TableSelection";
import { listarTrabajadores as listarWorkers } from "../../../../services/viaticos/worker/Worker-services";
import React, { useState, useEffect } from "react";

const Step2Worker = ({ nextStep, prevStep, transactionData, setTransactionData }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await listarWorkers();
        setWorkers(response); // adapta según cómo venga tu API
      } catch (error) {
        console.error("Error al listar trabajadores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  // 👇 Precarga en modo edición
  useEffect(() => {
    if (transactionData?.worker) {
      const match = workers.find(
        (w) => String(w.id_worker) === String(transactionData.worker.id_worker)
      );
      if (match) {
        setTransactionData((prev) => ({ ...prev, worker: match }));
      }
    }
  }, [workers, transactionData.worker, setTransactionData]);

  const setSelectedWorker = (worker) =>
    setTransactionData((prev) => ({ ...prev, worker }));

  const fields = [
    { key: "id_worker", label: "ID", isTable: true, isSummary: true },
    { key: "name", label: "NOMBRE", isTable: true, isSummary: true },
    { key: "last_name", label: "APELLIDO", isTable: true, isSummary: false },
    { key: "dni", label: "DNI", isTable: false, isSummary: true },
  ];

  if (loading) return <p className="text-slate-400 p-6">Cargando trabajadores...</p>;

  return (
    <>
      <TableSelection
        title="2. Seleccione el Trabajador"
        data={workers}
        selectedItem={transactionData.worker}
        setSelectedItem={setSelectedWorker}
        fields={fields}
        icon={<User size={20} className="text-slate-400" />}
      />
      <div className="flex justify-between p-6 pt-0 border-t border-slate-800">
        <button
          onClick={prevStep}
          className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700/50"
        >
          &larr; Anterior
        </button>
        <button
          onClick={nextStep}
          disabled={!transactionData.worker}
          className={`px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md ${
            transactionData.worker
              ? "bg-emerald-600 text-white"
              : "bg-slate-700 text-slate-500"
          }`}
        >
          Siguiente &rarr;
        </button>
      </div>
    </>
  );
};

export default Step2Worker;