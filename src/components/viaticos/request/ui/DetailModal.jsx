import React, { useEffect, useState } from "react";
import { Eye, X, DollarSign, Calendar, Tag, FileText, Info, User, Briefcase } from "lucide-react";
import ItemDetailCard from "./ItemDetailCard";

const DetailModal = ({ id_spent, onClose }) => {
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!id_spent) return;

    const fetchItem = async () => {
      try {
        const response = await fetch(
          `https://fearful-spell-pjg9gr9px5v6f6x7w-5000.app.github.dev/spent/${id_spent}`
        );
        if (!response.ok) throw new Error("Error al obtener gasto");
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error("❌ Error cargando gasto:", err);
      }
    };

    fetchItem();
  }, [id_spent]);

  if (!item) return null;

  const formattedAmount = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(item.spent_value);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800 rounded-t-xl">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Eye size={22} className="mr-2 text-sky-400" /> Detalle del Gasto ID:{" "}
            <span className="ml-2 text-slate-400 font-mono text-base">{item.id_spent}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Resumen Clave */}
          <div className="grid grid-cols-2 gap-4">
            <ItemDetailCard icon={DollarSign} label="Monto Total" value={formattedAmount} isMonetary />
            <ItemDetailCard icon={Calendar} label="Fecha de Emisión" value={item.emission_date} />
          </div>

          {/* Cost Center */}
          <ItemDetailCard
            icon={Briefcase}
            label="Centro de Costos"
            value={`${item.cost_center.name} (${item.cost_center.code})`}
          />

          {/* Worker */}
          <ItemDetailCard
            icon={User}
            label="Trabajador"
            value={`${item.worker.name} ${item.worker.last_name} - DNI: ${item.worker.dni}`}
          />

          {/* Ticket y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <ItemDetailCard icon={Tag} label="Ticket" value={item.ticket_number} />
            <ItemDetailCard icon={Info} label="Estado" value={item.state} />
          </div>

          {/* Detalles del gasto */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-inner">
            <div className="flex items-center text-slate-400 mb-3 border-b border-slate-700/50 pb-2">
              <FileText size={18} className="mr-2 text-indigo-400" />
              <span className="text-sm font-semibold uppercase">Detalles del gasto</span>
            </div>
            {item.details && item.details.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-200">
                {item.details.map((d) => (
                  <li key={d.id_detail} className="border-b border-slate-700/30 pb-2">
                    <strong>{d.type_detail}</strong> — {d.reason}  
                    <br />
                    Destino: {d.destination} | Fecha: {d.expense_date}  
                    <br />
                    Monto viaje: {d.trip_amount} | Días: {d.day_amount}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No hay detalles registrados.</p>
            )}
          </div>

          {/* Nota */}
          <div className="text-xs text-slate-500 flex items-start p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <Info size={16} className="text-yellow-500 mr-2 mt-0.5" />
            Esta vista es solo para revisión rápida. Use el botón "Editar" para modificar datos.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-right bg-slate-800 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-900/40"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;