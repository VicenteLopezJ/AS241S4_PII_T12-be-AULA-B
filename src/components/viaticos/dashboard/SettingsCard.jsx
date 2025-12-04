import { Settings } from "lucide-react";

const SettingsCard = ({ onClick }) => (
    <div 
        onClick={onClick}
        className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center h-[400px] lg:h-full cursor-pointer hover:bg-slate-700 transition duration-300 border border-transparent hover:border-indigo-600/50"
    >
        <Settings className="w-12 h-12 text-indigo-400 mb-4 animate-spin-slow"/>
        <h3 className="text-xl font-bold text-white mb-2">Personalizar Dashboard</h3>
        <p className="text-sm text-slate-400 mb-6">Muestra u oculta las secciones de tu panel para optimizar la vista.</p>
        <div className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 shadow-lg">
            Administrar Widgets
        </div>
    </div>
);

export default SettingsCard;