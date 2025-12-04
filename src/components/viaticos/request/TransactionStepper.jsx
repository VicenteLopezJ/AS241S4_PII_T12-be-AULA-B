import { CheckCircle } from "lucide-react";
import React from "react";

const TransactionStepper = ({ steps, currentStep }) => {
    return (
        <div className="flex bg-[#191f2b] border-b border-slate-700 overflow-hidden">
            {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                let bgClass = 'bg-[#1e293b] text-slate-400';
                if (isActive) bgClass = 'bg-emerald-600 text-white';
                if (isCompleted) bgClass = 'bg-emerald-800 text-emerald-200';

                const arrowStyle = {
                    clipPath: index === 0 
                        ? 'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)' 
                        : 'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%)',
                    marginLeft: index === 0 ? '0' : '-15px',
                    paddingLeft: index === 0 ? '20px' : '35px',
                    paddingRight: '20px',
                    zIndex: 10 - index
                };

                return (
                    <div key={step.id} className={`flex-1 h-12 flex items-center justify-center transition-colors duration-300 relative ${bgClass}`} style={arrowStyle}>
                        <div className="flex items-center space-x-2">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isActive ? 'bg-white text-emerald-600' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-300'}`}>
                                {isCompleted ? <CheckCircle size={14} /> : step.id}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide truncate">{step.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default TransactionStepper;