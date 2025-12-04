import { Trash2, UploadCloud } from "lucide-react";
import React, { useEffect } from "react";

const Step4Attachments = ({ nextStep, prevStep, transactionData, setTransactionData }) => {
  const { costCenter, worker, expenseItems, attachments = [], worker_signature, worker_signature_type } = transactionData;

  const totalAmount = expenseItems.reduce((sum, item) => {
    const subtotal = (Number(item.day_amount) || 0) * (Number(item.trip_amount) || 0);
    return sum + subtotal;
  }, 0);

  const formattedTotalAmount = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(totalAmount);

  useEffect(() => {
    if (transactionData?.attachments && transactionData.attachments.length > 0) {
      setTransactionData((prev) => ({
        ...prev,
        attachments: transactionData.attachments,
      }));
    }

    if (transactionData?.worker_signature && !transactionData.worker_signature_type) {
      setTransactionData((prev) => ({
        ...prev,
        worker_signature_type: "image/png",
      }));
    }
  }, [transactionData.attachments, transactionData.worker_signature, transactionData.worker_signature_type, setTransactionData]);

  // 👇 Convertir archivo a Base64 directamente en el front
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor sube un archivo de imagen válido (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result.split(",")[1]; // solo la parte base64
      setTransactionData((prev) => ({
        ...prev,
        worker_signature: base64String,
        worker_signature_type: file.type,
        attachments: [
          { id: Date.now(), name: file.name },
        ],
      }));
      console.log("Firma convertida a Base64 correctamente ✅");
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (id) =>
    setTransactionData((prev) => ({
      ...prev,
      attachments: [],
      worker_signature: null,
      worker_signature_type: null,
    }));

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-4 border-b border-slate-700/50 pb-2">
        4. Revisión y Adjuntos
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos clave */}
        <div className="lg:col-span-1 bg-slate-800 p-4 rounded-lg border border-slate-700/50 shadow-md h-full">
          <h4 className="font-bold text-slate-300 mb-3 border-b border-slate-700/50 pb-1 text-base">
            Datos Clave
          </h4>
          <div className="text-sm space-y-2">
            <div className="pb-2 border-b border-slate-700/50">
              <span className="block text-xs font-medium text-slate-500">Centro de Costo:</span>
              <span className="block text-white font-medium">
                {costCenter?.code} - {costCenter?.name}
              </span>
            </div>
            <div className="pb-2 border-b border-slate-700/50">
              <span className="block text-xs font-medium text-slate-500">Trabajador:</span>
              <span className="block text-white font-medium">
                {worker?.name} ({worker?.id_worker})
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Total de Gastos:</span>
              <span className="text-2xl font-bold text-emerald-400 text-right">
                {formattedTotalAmount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ítems Registrados:</span>
              <span className="text-white text-right font-bold">
                {expenseItems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Adjuntos */}
        <div className="lg:col-span-2 space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            Firma (Máx. 1 archivo)
          </label>
          <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors bg-slate-800/50">
            <input
              id="file-upload"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={attachments.length >= 1}
            />
            <UploadCloud
              size={32}
              className={`mx-auto mb-2 transition-colors ${
                attachments.length < 1 ? "text-emerald-500" : "text-slate-500"
              }`}
            />
            <p className="text-sm text-slate-400">
              {attachments.length < 1
                ? "Arrastre y suelte o haga click para subir archivo (JPG, PNG)"
                : "Ya se subió el archivo de firma."}
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center bg-slate-800 p-3 rounded text-sm border border-slate-700"
                >
                  <span className="text-slate-300 truncate w-3/4">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(file.id)}
                    className="text-rose-500 hover:text-rose-400 p-1 rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Vista previa de la firma */}
          {worker_signature && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Vista previa de la firma:
              </label>
              <img
                src={`data:${worker_signature_type || "image/png"};base64,${worker_signature}`}
                alt="Firma del trabajador"
                className="max-h-32 border border-slate-600 rounded-lg shadow-md mx-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t border-slate-800">
        <button
          onClick={prevStep}
          className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          &larr; Anterior (Gastos)
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all"
        >
          Finalizar y Enviar &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step4Attachments;