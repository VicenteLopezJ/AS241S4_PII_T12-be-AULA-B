import React from 'react';

export const CircularProgress = ({ percentage, label, subLabel }) => {
// Ajustes para dar más "aire" al centro
  const radius = 95; // Aumentado para agrandar el círculo
  const stroke = 15; // Grosor refinado
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/50 shadow-xl flex flex-col relative h-[450px] overflow-hidden">
      {/* Cabecera */}
      <div className="z-10 w-full relative">
        <h3 className="text-white font-bold text-base tracking-wide">Porcentajes</h3>
        <p className="text-slate-400 text-xs mt-1 font-medium">{label}</p>
      </div>
      
      {/* Gráfico */}
      <div className="flex-2 flex items-center justify-center relative mt-5">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] drop-shadow-2xl">
          {/* Fondo del anillo */}
          <circle
            stroke="#475569"
            strokeOpacity="0.3"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500"
          />
          {/* Progreso */}
          <circle
            stroke="#93c5fd" 
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ 
                strokeDashoffset, 
                transition: 'stroke-dashoffset 1s ease-out' 
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        
        {/* Texto Central con más espacio alrededor */}
        <div className="absolute flex flex-col items-center justify-center text-white pb-2">
          {/* Ajustado a text-4xl para que no toque los bordes del círculo */}
          <span className="text-4xl font-bold tracking-tighter drop-shadow-lg">{percentage}%</span>
          <span className="text-sm text-slate-300 mt-1 font-light tracking-wide">{subLabel}</span>
        </div>
      </div>
    </div>
  );
};