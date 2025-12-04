import {
  CheckCircle,
  Briefcase,
  Calendar,
  DollarSign,
  UploadCloud,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useState, useEffect  } from "react";
import { registrarViatico, actualizarViatico } from "../../../../services/viaticos/request/Request-service";
import { obtenerTicket } from "../../../../services/viaticos/request/Request-service";

const Step5Final = ({ onClose, transactionData, initialData }) => {
  const [isExpandedAdmin, setIsExpandedAdmin] = useState(false);
  const [isExpandedItems, setIsExpandedItems] = useState(false);

  const { costCenter, worker, expenseItems, attachments } = transactionData;
  const totalValue = expenseItems.reduce((sum, item) => {
  const monto = (Number(item.trip_amount) || 0) * (Number(item.day_amount) || 0);
  return sum + monto;
}, 0);

const formattedTotalAmount = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
}).format(totalValue);



const handleSubmit = async () => {
  try {
    // 1. Obtener ticket único desde el backend
    const ticketResponse = await obtenerTicket();
    const ticket_number = ticketResponse.ticket_number;

    // 2. Construir payload con el ticket ya definido
    const payload = {
      id_center: transactionData.costCenter?.id_center,
      id_worker: transactionData.worker?.id_worker,
      ticket_number, 
      spent_value: transactionData.expenseItems.reduce(
        (acc, e) =>
          acc + (Number(e.trip_amount) || 0) * (Number(e.day_amount) || 0),
        0
      ),
      worker_signature: transactionData.worker_signature || "",
      emission_date: new Date().toISOString(),
      details: transactionData.expenseItems.map((e) => ({
        type_detail: e.category,
        destination: e.destination?.trim() || "",
        trip_amount: Number(e.trip_amount) || 0,
        reason: e.description?.trim() || null,
        expense_date: new Date(e.date).toISOString().split("T")[0],
        day_amount: Number(e.day_amount) || 0,
      })),
    };

    console.log("📦 Datos que se están enviando al backend:");
    console.log(JSON.stringify(payload, null, 2));

    // 3. Enviar al backend
    if (initialData?.id) {
      await actualizarViatico(initialData.id, payload); // PUT
      console.log("Solicitud actualizada con éxito ✅");
    } else {
      await registrarViatico(payload); // POST
      console.log("Solicitud registrada con éxito ✅");
    }
  } catch (error) {
    console.error("❌ Error al guardar viático:", error);
  }
};

  // 🚀 Ejecutar automáticamente al montar
  useEffect(() => {
    handleSubmit();
  }, []); 

  const DataRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-2 border-b border-slate-800 last:border-b-0">
      <Icon size={18} className="text-emerald-500 mr-3 mt-1 min-w-[18px]" />
      <div className="flex-1">
        <span className="block text-xs font-medium text-slate-500 uppercase">
          {label}
        </span>
        <span className="block text-white font-medium break-words">{value}</span>
      </div>
    </div>
  );

  return (
  <div className="p-10 space-y-8">
    <div className="text-center space-y-3 border-b border-slate-700 pb-6">
      <CheckCircle
        size={80}
        className="mx-auto text-emerald-500 animate-bounce-in"
      />
      <h3 className="text-3xl font-extrabold text-white">
        {initialData
          ? "¡Solicitud Actualizada con Éxito!"
          : "¡Solicitud Enviada con Éxito!"}
      </h3>
      <p className="text-slate-400 text-lg">
        La solicitud está{" "}
        <span className="text-red-400 font-bold">Pendiente de Aprobación</span>.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Detalle de gastos */}
      <div className="lg:col-span-1">
        <div className="p-4 bg-slate-800 rounded-lg shadow-inner shadow-black/20">
          <button
            onClick={() => setIsExpandedItems(!isExpandedItems)}
            className="w-full flex justify-between items-center text-slate-300 hover:text-white transition-colors py-2 border-b border-slate-700/70"
          >
            <h4 className="font-bold text-base flex items-center">
              <DollarSign size={18} className="mr-2 text-yellow-400" /> Detalle
              de {expenseItems.length} Gastos
            </h4>
            {isExpandedItems ? (
              <ChevronUp size={20} className="text-yellow-400" />
            ) : (
              <ChevronDown size={20} className="text-yellow-400" />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpandedItems ? "max-h-96 opacity-100 pt-3" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {expenseItems.map((item) => {
                const monto =
                  (Number(item.trip_amount) || 0) *
                  (Number(item.day_amount) || 0);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-700/50 border border-slate-700"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-300">
                        {new Intl.NumberFormat("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        }).format(monto)}
                      </span>
                      <span className="text-xs text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-sm text-white mt-1">{item.category}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">
                      {item.description}
                    </p>
                    {item.destination && (
                      <p className="text-xs text-slate-400 mt-1">
                        Destino: {item.destination}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-700 mt-2">
            <div className="flex justify-between">
              <span className="block text-lg font-bold text-slate-300 uppercase">
                Total
              </span>
              <span className="block text-2xl font-extrabold text-emerald-400">
                {formattedTotalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Datos administrativos */}
      <div className="lg:col-span-1">
        <div className="p-4 bg-slate-800 rounded-lg shadow-inner shadow-black/20">
          <button
            onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
            className="w-full flex justify-between items-center text-slate-300 hover:text-white transition-colors py-2 border-b border-slate-700/70"
          >
            <h4 className="font-bold text-base flex items-center">
              <Briefcase size={18} className="mr-2 text-sky-400" /> Datos
              Administrativos
            </h4>
            {isExpandedAdmin ? (
              <ChevronUp size={20} className="text-sky-400" />
            ) : (
              <ChevronDown size={20} className="text-sky-400" />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpandedAdmin ? "max-h-96 opacity-100 pt-3" : "max-h-0 opacity-0"
            }`}
          >
            <h5 className="text-xs font-semibold text-slate-400 mb-2 mt-1">
              Centro de Costo
            </h5>
            <DataRow
              icon={Briefcase}
              label="Código"
              value={costCenter?.code}
            />
            <h5 className="text-xs font-semibold text-slate-400 mb-2 mt-4">
              Trabajador
            </h5>
            <DataRow icon={User} label="Nombre" value={worker?.name} />
            <DataRow icon={User} label="Email" value={worker?.email} />
          </div>
          <div className="pt-2">
            <DataRow
              icon={Calendar}
              label="Fecha"
              value={new Date().toLocaleDateString("es-PE")}
            />
          </div>
        </div>
      </div>

      {/* Adjuntos */}
      <div className="lg:col-span-1 p-4 bg-slate-800 rounded-lg shadow-inner shadow-black/20">
        <h4 className="font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2 flex items-center">
          <UploadCloud size={18} className="mr-2 text-indigo-400" /> Adjuntos (
          {attachments.length})
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {attachments.length > 0 ? (
            attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center text-sm text-slate-300 bg-slate-700/50 p-2 rounded truncate"
              >
                <span className="truncate">{file.name}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">
              Sin adjuntos.
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Botón final solo para cerrar */}
    <div className="text-center pt-6 border-t border-slate-700">
      <button
        onClick={onClose}
        className="mt-4 px-8 py-3 text-base font-semibold rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-all shadow-lg shadow-slate-900/40"
      >
        Cerrar y Volver al Panel
      </button>
    </div>
  </div>
);
};

export default Step5Final;