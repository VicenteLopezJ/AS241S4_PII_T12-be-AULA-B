import React from 'react';

export const StatCard = ({ title, value, subtext, colorClass, textColor = "text-slate-900" }) => {
  return (
    <div className={`${colorClass} rounded-xl p-6 flex flex-col justify-between h-32 shadow-lg transition-transform hover:scale-105`}>
      <div>
        <h3 className={`text-sm font-bold ${textColor} opacity-80`}>{title}</h3>
        <div className={`text-3xl font-extrabold mt-2 ${textColor}`}>{value}</div>
      </div>
      {subtext && <div className={`text-xs font-medium ${textColor} mt-1`}>{subtext}</div>}
    </div>
  );
};