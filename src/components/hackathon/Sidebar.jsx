import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import logo from '../../assets/logo.png';
import { LayoutDashboard, ShoppingBag, Files, Lock, Users } from 'lucide-react'; 
import { getCurrentUser, logout } from '../../services/hackathon/userService'; 

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const user = getCurrentUser(); 

  const activeBg = "bg-[#C8FAD6]";  
  const activeTextColor = "text-black"; 
  const hoverBg = "hover:bg-[#C8FAD6]"; 
  const hoverTextColor = "hover:text-[#007867]";
  const defaultLetterColor = "text-white"; 
  const defaultIconColor = "text-[#637381]"; 

  const navItems = [
    { name: "Evaluaciones", path: "/hackathon/evaluationday", icon: ShoppingBag },
    { name: "Estudiantes", path: "/hackathon/students", icon: Files },
     { name: "Profesores", path: "/hackathon/teachers", icon: Files },
    { name: "Asistencia", path: "/hackathon/attendance", icon: Lock },
    { name: "Grupos", path: "/hackathon/groups", icon: Users },
  ];

  const handleLogout = () => {
        logout();                   
        navigate('/academic')
    };

  return (
    <aside className="fixed left-0 top-0 h-full w-65 bg-[#1A212D] z-10 p-2 min-h-screen flex flex-col">
      <div className="p-1.5 flex-1">

        <div className="flex items-center mb-2 border-b border-[#2a3544] p-1">
          <div className="w-6 h-6 flex items-center justify-center">
            <img 
              src={logo} 
              alt="Logo Sistema Administrativo"
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-[#00A76F] font-bold text-lg ml-2">
            Sistema Academico
          </span>
        </div>
        
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon; 
            const isActive = currentPath.startsWith(item.path) && item.path !== "/";

            const itemLetterColor = isActive ? activeTextColor : defaultLetterColor;
            const itemIconColor = isActive ? activeTextColor : defaultIconColor;

            return (
              <Link 
                key={item.name}
                to={item.path}
                className={`
                  w-full flex items-center gap-3 
                  px-4 py-2 rounded-md transition-colors duration-200 
                  ${isActive ? `${activeBg} font-semibold` : `${hoverBg} text-white`}
                `}
              >
                <Icon 
                  className={`w-5 h-5 ${itemIconColor} ${!isActive ? hoverTextColor : ''}`} 
                /> 
                <span 
                  className={`flex-1 ${itemLetterColor} ${!isActive ? hoverTextColor : ''}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-slate-700">

        {user && (
          <div className="text-xs text-white mb-2">
            Conectado como{" "}
            <span className="text-white font-semibold">
              {user.username}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 bg-red-600 text-white"
        >
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
