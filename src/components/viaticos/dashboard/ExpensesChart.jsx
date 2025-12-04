import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Definición de tipos de gráfico
const CHART_TYPES = {
  LINE: 'Línea',
  BAR: 'Barras',
  PIE: 'Circular',
};

// Colores para el gráfico circular
const PIE_CHART_COLORS = ['#10b981', '#fcd34d', '#f43f5e']; // Emerald, Amber, Rose

// Tooltip personalizado para PieChart
const CustomTooltip = ({ active, payload, label, totalValue }) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-white font-semibold">{dataItem.name}</p>
        <p className="text-indigo-300">Gasto: S/ {dataItem.valor.toFixed(2)}</p>
        <p className="text-slate-400">
          Total: {((dataItem.valor / totalValue) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export const CircularProgress = ({ percentage, label, subLabel }) => {
  const strokeWidth = 10;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center h-full">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-slate-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
          <circle
            className="text-indigo-400 transition-all duration-1000 ease-in-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-slate-400">{subLabel}</p>
    </div>
  );
};

export const ExpensesChart = ({ data, title }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.LINE);

  // Propiedades comunes para XAxis y YAxis
  const commonAxisProps = {
    stroke: "#94a3b8",
    tick: { fontSize: 12 },
    axisLine: false,
    tickLine: false
  };

  // Tooltip común para Line y Bar
  const TooltipContent = (
    <Tooltip
      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
      itemStyle={{ color: '#fff' }}
    />
  );

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
          No hay datos para mostrar en el gráfico.
        </div>
      );
    }

    switch (chartType) {
      case CHART_TYPES.BAR:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} dy={10} />
              <YAxis {...commonAxisProps} />
              {TooltipContent}
              <Bar dataKey="valor" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case CHART_TYPES.PIE: {
        // 👇 Encerramos en bloque para evitar el error ESLint
        const totalValue = data.reduce((sum, item) => sum + item.valor, 0);
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="valor"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip totalValue={totalValue} />} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case CHART_TYPES.LINE:
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} dy={10} />
              <YAxis {...commonAxisProps} />
              {TooltipContent}
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 8, fill: '#818cf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="flex space-x-2 bg-slate-700 rounded-lg p-1">
          {Object.values(CHART_TYPES).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 
                ${chartType === type
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-600'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {renderChart()}
      </div>
    </div>
  );
};
