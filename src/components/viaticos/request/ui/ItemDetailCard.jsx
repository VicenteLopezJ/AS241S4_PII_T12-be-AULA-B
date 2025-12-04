import React from "react";


const ItemDetailCard = ({ icon: Icon, label, value, isMonetary = false }) => (
    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-700 shadow-inner">
        <div className="flex items-center text-slate-400 mb-2">
            <Icon size={18} className="mr-2 text-indigo-400" />
            <span className="text-xs font-semibold uppercase">{label}</span>
        </div>
        <div className="text-white">
            {isMonetary ? (
                <span className="text-2xl font-extrabold text-emerald-400">{value}</span>
            ) : (
                <span className="text-sm font-medium break-words">{value}</span>
            )}
        </div>
    </div>
);

export default ItemDetailCard;