import { Settings, X } from "lucide-react"; // asegúrate de tener estos íconos

const ManageWidgetsCard = ({ onClick }) => (
    <div 
        onClick={onClick}
        className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center h-[400px] lg:h-auto cursor-pointer hover:bg-slate-700/50 transition duration-300"
    >
        <Settings className="w-10 h-10 text-indigo-400 mb-3 animate-spin-slow"/>
        <h3 className="text-lg font-bold text-white mb-2">Gestionar Dashboard</h3>
        <p className="text-sm text-slate-400 mb-6">Muestra u oculta las secciones de tu panel.</p>
        <div className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 shadow-md">
            Personalizar
        </div>
    </div>
);

export default ManageWidgetsCard;