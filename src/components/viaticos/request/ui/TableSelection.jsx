import { Table } from "lucide-react";
import React, { useState } from "react";

const TableSelection = ({ title, data, selectedItem, setSelectedItem, fields, icon }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const summaryFields = fields.filter(f => f.isSummary);
    const tableFields = fields.filter(f => f.isTable);
    const getValue = (item, key) => key.split('.').reduce((obj, k) => obj && obj[k], item);

    const isSelected = (item) => {
        if (!selectedItem) return false;
        if (item.id && selectedItem.id) return item.id === selectedItem.id;
        const keyField = tableFields[0].key;
        if (item[keyField] && selectedItem[keyField]) return item[keyField] === selectedItem[keyField];
        return false;
    };

    return (
        <div className="p-6 space-y-6">
            <h3 className="text-slate-200 font-semibold text-lg mb-4 border-b border-slate-700/50 pb-2 flex items-center">
                {icon} <span className="ml-2">{title}</span>
            </h3>
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/80 text-slate-200 text-sm rounded-lg py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-700/50 transition-colors shadow-inner" />
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700/50 shadow-xl overflow-hidden max-h-72 lg:max-h-96 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 text-xs text-slate-400 uppercase tracking-wider bg-slate-700/50">
                            <tr>{tableFields.map(field => <th key={field.key} className="px-4 py-3 min-w-[100px]">{field.label}</th>)}</tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index} className={`cursor-pointer transition-colors border-b border-slate-800/50 last:border-none ${isSelected(item) ? 'bg-emerald-600/30 text-emerald-300 font-semibold border-emerald-500' : 'hover:bg-slate-700/40 text-slate-300'}`} onClick={() => setSelectedItem(item)}>
                                    {tableFields.map(field => <td key={field.key} className="px-4 py-3 font-medium">{getValue(item, field.key)}</td>)}
                                </tr>
                            ))}
                            {filteredData.length === 0 && <tr><td colSpan={tableFields.length} className="text-center py-4 text-slate-500">Sin resultados.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="w-full lg:w-1/3 p-4 bg-slate-800 rounded-lg border border-emerald-500/50 flex flex-col justify-start space-y-3 shadow-lg">
                    <h4 className="text-base font-bold text-emerald-400 border-b border-slate-700 pb-2">Selección Actual</h4>
                    {selectedItem ? (
                        <div className="space-y-2 text-sm">
                            {summaryFields.map(field => (
                                <div key={field.key} className="flex justify-between"><span className="text-slate-400">{field.label}:</span><span className="text-white text-right font-medium">{getValue(selectedItem, field.key)}</span></div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500 text-sm text-center py-4">Seleccione un ítem.</p>}
                </div>
            </div>
        </div>
    );
};

export default TableSelection;