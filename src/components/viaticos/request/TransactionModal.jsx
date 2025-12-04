import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { obtenerViaticoPorId } from "../../../services/viaticos/request/Request-service";
import TransactionStepper from "./TransactionStepper";
import Step1CostCenter from "./steps/Step1CostCenter";
import Step2Worker from "./steps/Step2Worker";
import Step3Expenses from "./steps/Step3Expenses";
import Step4Attachments from "./steps/Step4Attachments";
import Step5Final from "./steps/Step5Final";

const TransactionModal = ({ isOpen, onClose, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [transactionData, setTransactionData] = useState({
    costCenter: null,
    worker: null,
    expenseItems: [],
    attachments: [],
    worker_signature: "",
  });

   useEffect(() => {
    const fetchById = async () => {
      if (initialData?.id) {
        try {
          const response = await obtenerViaticoPorId(initialData.id);
          console.log("📥 Datos completos desde backend:", response);
          const calculatedTotal = response.details?.reduce((sum, item) => {
  const subtotal = (Number(item.day_amount) || 0) * (Number(item.trip_amount) || 0);
  return sum + subtotal;
}, 0);

          // Normalizamos id_center → id_cost_center
          const normalizedCostCenter = response.cost_center
            ? {
                ...response.cost_center,
                id_cost_center: response.cost_center.id_center,
              }
            : null;

          // Transformamos los detalles a formato visual
          const normalizedItems = response.details?.map((item) => ({
  id: item.id_detail,
  date: new Date(item.expense_date).toISOString().substring(0, 10),
  day_amount: Number(item.day_amount) || 0,
  trip_amount: Number(item.trip_amount) || 0,
  description: item.reason,
  category: item.type_detail,
  destination: item.destination || "",
})) || [];

          setTransactionData({
            costCenter: normalizedCostCenter,
            worker: response.worker || null,
            expenseItems: normalizedItems,
            spent_value: calculatedTotal,
            attachments: response.attachments || [],
            worker_signature: response.worker_signature || "",
          });

          console.log("✅ transactionData inicializado:", {
            costCenter: normalizedCostCenter,
            worker: response.worker,
            expenseItems: normalizedItems,
          });

          setCurrentStep(1);
        } catch (error) {
          console.error("❌ Error al cargar solicitud por id:", error);
        }
      } else {
        // modo creación
        setTransactionData({
          costCenter: null,
          worker: null,
          expenseItems: [],
          attachments: [],
          worker_signature: "",
        });
        console.log("⚠️ transactionData inicializado vacío (modo creación)");
        console.log("initialData recibido:", initialData);
        setCurrentStep(1);
      }
    };

    if (isOpen) {
      fetchById();
    }
  }, [initialData, isOpen]);


  if (!isOpen) return null;

  const stepsConfig = [
    { id: 1, label: "CENTRO DE COSTO", Component: Step1CostCenter },
    { id: 2, label: "TRABAJADOR", Component: Step2Worker },
    { id: 3, label: "GASTOS", Component: Step3Expenses },
    { id: 4, label: "ADJUNTOS", Component: Step4Attachments },
    { id: 5, label: "CONFIRMACIÓN", Component: Step5Final },
  ];

  const nextStep = () =>
    currentStep < totalSteps && setCurrentStep((curr) => curr + 1);
  const prevStep = () =>
    currentStep > 1 && setCurrentStep((curr) => curr - 1);

  const handleClose = () => {
    setTransactionData({
      costCenter: null,
      worker: null,
      expenseItems: [],
      attachments: [],
      worker_signature: "",
    });
    setCurrentStep(1);
    onClose();
    console.log("❌ Modal cerrado, transactionData reseteado");
  };

  const CurrentComponent = stepsConfig.find((s) => s.id === currentStep)?.Component;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[#131720] rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-[#131720]">
          <h2 className="text-2xl font-extrabold text-white">
            {initialData ? "Editar solicitud" : "Crear nueva solicitud"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
          >
            <X size={24} />
          </button>
        </div>
        {currentStep < 5 && (
          <TransactionStepper steps={stepsConfig.slice(0, 4)} currentStep={currentStep} />
        )}
        <div className="min-h-[400px] max-h-[70vh] overflow-y-auto custom-scrollbar">
          {CurrentComponent && (
            <CurrentComponent
              nextStep={nextStep}
              prevStep={prevStep}
              onClose={handleClose}
              transactionData={transactionData}
              setTransactionData={setTransactionData}
              initialData={initialData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;