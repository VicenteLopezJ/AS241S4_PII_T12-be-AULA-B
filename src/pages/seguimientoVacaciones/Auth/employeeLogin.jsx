import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';

export default function EmployeeLoginVacaciones() {
  const { reloadAuth } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.username || !credentials.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const baseModule = await import('../../../utils/autoLoginVacaciones');
      const autoLoginVacaciones = baseModule.autoLoginVacaciones || baseModule.default;

      const success = await autoLoginVacaciones({
        username: credentials.username,
        password: credentials.password,
        role: 'Empleado Comun',
      });

      if (success) {
        const contextReloaded = reloadAuth();
        if (contextReloaded) {
          // Redirigir a los módulos de empleado (por ejemplo, mi saldo)
          window.location.href = '/vacaciones/miSaldoVacaciones';
        } else {
          setError('Error al cargar la sesión');
        }
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error en login de empleado vacaciones:', err);
      setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/empleado');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={handleBack}
          className="absolute -top-16 left-0 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver</span>
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Ingreso Empleado</h1>
            <p className="text-slate-400 text-sm">Accede a tus solicitudes y saldo de vacaciones</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Nombre de usuario
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  placeholder="Ingresa tu usuario"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors duration-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            © 2025 Sistema de Vacaciones
          </p>
        </div>
      </div>
    </div>
  );
}
