import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, color = "green" }) => {
    const colorClasses = {
        green: "bg-green-50 border-green-200 text-green-600",
        yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
        red: "bg-red-50 border-red-200 text-red-600",
        blue: "bg-blue-50 border-blue-200 text-blue-600"
    };

    return (
        <div className={`${colorClasses[color].split(' ')[0]} rounded-2xl shadow-lg p-6 border-l-4 ${colorClasses[color].split(' ')[1]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
                    <p className="text-4xl font-bold text-gray-800">{value || 0}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`w-14 h-14 ${colorClasses[color].split(' ')[0]} rounded-xl flex items-center justify-center`}>
                    {icon ? React.createElement(icon, { className: colorClasses[color].split(' ')[2], size: 28 }) : null}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
