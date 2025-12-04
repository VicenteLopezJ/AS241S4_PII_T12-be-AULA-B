import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import { autoLoginVacaciones } from '../../../utils/autoLoginVacaciones'; 


export default function Login() {
  const { reloadAuth } = useAuth();
  const navigate = useNavigate();

  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const performAutoLogin = async () => {
      console.log(' [Login] Iniciando auto-login...');
      setIsAutoLogging(true);

      try {
        const success = await autoLoginVacaciones();

        if (success) {
          console.log(' [Login] Auto-login exitoso');
          const contextReloaded = reloadAuth();

          if (contextReloaded) {
            console.log(' [Login] Contexto recargado, redirigiendo...');
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/vacaciones/panel';
          } else {
            console.log(' [Login] No se pudo recargar el contexto');
            setIsAutoLogging(false);
          }
        } else {
          console.log(' [Login] Auto-login falló, mostrando formulario');
          setIsAutoLogging(false);
        }
      } catch (error) {
        console.error(' [Login] Error en auto-login:', error);
        setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
        setIsAutoLogging(false);
      }
    };

    performAutoLogin();
  }, []);

  if (isAutoLogging) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl mb-6 shadow-lg shadow-cyan-500/20">
            <div className="grid grid-cols-2 gap-1 p-4">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Iniciando sesión automáticamente...
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Por favor espera un momento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Error al iniciar sesión automáticamente
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          {error || 'Puedes intentar nuevamente o usar el login de empleado.'}
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm hover:bg-cyan-600 transition-colors"
          >
            Reintentar autologin
          </button>
          <button
            onClick={() => navigate('/vacaciones/login-empleado')}
            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
          >
            Ir al login de empleado
          </button>
        </div>
      </div>
    </div>
  );
}