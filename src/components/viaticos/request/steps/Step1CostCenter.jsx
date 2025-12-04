import React, { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import TableSelection from "../ui/TableSelection";
import { listarCentroDeCostos as listarCostCenters } from "../../../../services/viaticos/cost/Cost-services";

const Step1CostCenter = ({ nextStep, transactionData, setTransactionData }) => {
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await listarCostCenters();
        setCostCenters(response); // adapta según cómo venga tu API
      } catch (error) {
        console.error("Error al listar centros de costo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);


  const setSelectedCenter = (center) =>
    setTransactionData((prev) => ({ ...prev, costCenter: center }));

  const fields = [
    { key: "code", label: "CÓDIGO", isTable: true, isSummary: true },
    { key: "name", label: "NOMBRE", isTable: true, isSummary: true },
    { key: "id_manager", label: "RESPONSABLE", isTable: true, isSummary: true },
  ];

  if (loading)
    return <p className="text-slate-400 p-6">Cargando centros de costo...</p>;

  return (
    <>
      <TableSelection
        title="1. Seleccione el Centro de Costo"
        data={costCenters}
        selectedItem={transactionData.costCenter}
        setSelectedItem={setSelectedCenter}
        fields={fields}
        icon={<Briefcase size={20} className="text-slate-400" />}
      />
      <div className="flex justify-end p-6 pt-0 border-t border-slate-800">
        <button
          onClick={nextStep}
          disabled={!transactionData.costCenter}
          className={`px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md ${
            transactionData.costCenter
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

export default Step1CostCenter;