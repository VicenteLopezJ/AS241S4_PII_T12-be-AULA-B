import { DollarSign, PlusCircle, Pencil, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import ExpenseItemForm from "../ui/ExpenseItemForm";

const Step3Expenses = ({ nextStep, prevStep, transactionData, setTransactionData }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (transactionData?.expenseItems && transactionData.expenseItems.length > 0) {
      setEditingItem(null);
      setIsAddingNew(false);
    }
  }, [transactionData.expenseItems]);

  // Calcular total en tiempo real
  const totalAmount = transactionData.expenseItems.reduce((sum, item) => {
    const subtotal = Number(item.day_amount) * Number(item.trip_amount);
    return sum + (isNaN(subtotal) ? 0 : subtotal);
  }, 0);

  const newItemTemplate = {
    id: Date.now(),
    date: new Date().toISOString().substring(0, 10),
    day_amount: 1,
    trip_amount: 0,
    description: "",
    category: "",
    destination: ""
  };

  const handleSave = () => {
  if (!editingItem) return;

  const cleanedItem = {
    ...editingItem,
    day_amount: editingItem.day_amount > 0 ? editingItem.day_amount : 1,
    trip_amount: editingItem.trip_amount > 0 ? editingItem.trip_amount : 0,
    description: editingItem.description?.trim() || "Sin descripción",
    category: editingItem.category?.trim() || "General",
    destination: editingItem.destination?.trim() || ""
  };

  setTransactionData((prev) => {
    const items = prev.expenseItems;
    if (isAddingNew) {
      return { ...prev, expenseItems: [...items, cleanedItem] };
    }
    const index = items.findIndex((i) => i.id === editingItem.id);
    if (index !== -1) {
      const newItems = [...items];
      newItems[index] = cleanedItem;
      return { ...prev, expenseItems: newItems };
    }
    return prev;
  });

  setEditingItem(null);
  setIsAddingNew(false);
};

  const handleDelete = (id) =>
    setTransactionData((prev) => ({
      ...prev,
      expenseItems: prev.expenseItems.filter((i) => i.id !== id)
    }));

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-slate-200 font-semibold text-lg border-b border-slate-700/50 pb-2 flex items-center">
        <DollarSign size={20} className="text-slate-400 mr-2" /> 3. Lista de Gastos
      </h3>

      {(editingItem || isAddingNew) && (
        <ExpenseItemForm
          item={editingItem}
          onChange={(k, v) => setEditingItem((p) => ({ ...p, [k]: v }))}
          onSave={handleSave}
          onCancel={() => {
            setEditingItem(null);
            setIsAddingNew(false);
          }}
          isEditing={!isAddingNew}
        />
      )}

      {!editingItem && !isAddingNew && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingItem({ ...newItemTemplate, id: Date.now() });
              setIsAddingNew(true);
            }}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <PlusCircle size={18} className="mr-1" /> Añadir Gasto
          </button>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg border border-slate-700/50 p-4 max-h-64 overflow-y-auto custom-scrollbar">
        {transactionData.expenseItems.length === 0 ? (
          <p className="text-center text-slate-500">Sin gastos.</p>
        ) : (
          <div className="space-y-3">
            {transactionData.expenseItems.map((item) => {
              const monto = Number(item.day_amount) * Number(item.trip_amount);
              const montoSeguro = isNaN(monto) ? 0 : monto;

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg border border-slate-700"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-white">
                      {new Intl.NumberFormat("es-PE", {
                        style: "currency",
                        currency: "PEN"
                      }).format(montoSeguro)}{" "}
                      ({item.category})
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.date} | {item.description} {item.destination && `(${item.destination})`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsAddingNew(false);
                      }}
                      className="text-sky-500 p-2 hover:bg-slate-700 rounded-full"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-500 p-2 hover:bg-slate-700 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg border border-slate-600">
        <span className="text-lg font-bold text-slate-300">Total:</span>
        <span className="text-2xl font-extrabold text-emerald-400">
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN"
          }).format(totalAmount)}
        </span>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-800">
        <button
          onClick={prevStep}
          disabled={isAddingNew || editingItem}
          className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700/50"
        >
          &larr; Anterior
        </button>
        <button
          onClick={nextStep}
          disabled={
            transactionData.expenseItems.length === 0 || isAddingNew || editingItem
          }
          className={`px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md ${
            transactionData.expenseItems.length > 0 &&
            !isAddingNew &&
            !editingItem
              ? "bg-emerald-600 text-white"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          Siguiente &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step3Expenses;