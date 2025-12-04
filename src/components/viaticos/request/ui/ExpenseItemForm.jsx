import { ChevronDown, Save, XCircle } from "lucide-react";
import React from "react";
const CATEGORIES = ['Alimentación', 'Movilidad Local', 'Alojamiento', 'Combustible', 'Materiales', 'Otros'];

const ExpenseItemForm = ({ item, onChange, onSave, onCancel, isEditing }) => {
    // Validaciones personalizadas
    const isValidDays = item.day_amount && item.day_amount > 0;
    const isValidValue = (Number(item.trip_amount) || 0) * (Number(item.day_amount) || 0) > 0;
    const isValidDestination = /^[A-Za-z\s]+$/.test(item.destination || "");
    const isValidDescription = /^[A-Za-z0-9\s]+$/.test(item.description || "") && item.description.length > 5;

    const isFormValid = item.date && isValidValue && isValidDays && isValidDestination && isValidDescription && item.category;

    const inputClasses = "w-full bg-slate-800/80 text-slate-200 text-sm rounded-lg py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-700/50 transition-colors";

    return (
        <div className="p-4 bg-slate-700/50 rounded-lg space-y-4 border border-slate-700/70">
            <h4 className="font-bold text-slate-200">{isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Monto por día</label>
                    <input
                        type="number"
                        value={item.trip_amount || 0}
                        onChange={e => onChange('trip_amount', Math.max(1, parseFloat(e.target.value)))}
                        className={inputClasses}
                        min="1.00"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Cantidad de días</label>
                    <input
                        type="number"
                        value={item.day_amount || 1}
                        onChange={e => onChange('day_amount', Math.max(1, parseInt(e.target.value)))}
                        className={inputClasses}
                        min="1"
                    />
                </div>
                <div className="relative md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
                    <select value={item.category} onChange={e => onChange('category', e.target.value)} className={`${inputClasses} appearance-none`}>
                        <option value="">-- Seleccione --</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-8 text-slate-500 pointer-events-none" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
                    <input type="date" value={item.date} onChange={e => onChange('date', e.target.value)} className={inputClasses} />
                </div>

                <div className="relative md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Destino</label>
                    <input
                        type="text"
                        value={item.destination || ""}
                        onChange={e => {
                            const val = e.target.value;
                            if (/^[A-Za-z\s]*$/.test(val)) {
                                onChange('destination', val);
                            }
                        }}
                        className={inputClasses}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
                <textarea
                    value={item.description}
                    onChange={e => {
                        const val = e.target.value;
                        if (/^[A-Za-z0-9\s]*$/.test(val)) {
                            onChange('description', val);
                        }
                    }}
                    rows="2"
                    className={inputClasses}
                />
            </div>
            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-700">
                <button onClick={onCancel} className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700">
                    <XCircle size={16} className="mr-1" /> Cancelar
                </button>
                <button onClick={onSave} disabled={!isFormValid} className={`flex items-center px-5 py-2 text-sm font-semibold rounded-lg shadow-md ${isFormValid ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}>
                    <Save size={16} className="mr-1" /> Guardar
                </button>
            </div>
        </div>
    );
};

export default ExpenseItemForm;
