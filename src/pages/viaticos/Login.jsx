import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/viaticos/api";

export default function VTLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(formData);

      if (response?.token) {
        localStorage.setItem("token", response.token);

        const userData = {
          username: response.username || formData.username,
          id_worker: response.id_worker,
          id_credential: response.id_credential,
          rol: response.rol
        };

        localStorage.setItem("user", JSON.stringify(userData));

        navigate("/dashboard-movil");
      } else {
        setError("Credenciales incorrectas");
      }

    } catch (err) {
      setError("Error al conectar al servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-2xl border border-slate-600">

        {/* HEADER */}
        <div className="px-8 py-8 text-center border-b border-slate-600">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            👤
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Iniciar Sesión</h2>
          <p className="text-slate-400">Accede a tu cuenta</p>
        </div>

        {/* FORM */}
        <div className="px-8 py-8">
          <form onSubmit={handleLogin} className="space-y-6">

            {error && (
              <div className="bg-red-900/50 text-red-300 px-4 py-3 rounded-md border border-red-800 text-sm">
                {error}
              </div>
            )}

            {/* USERNAME */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tu nombre de usuario"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-500 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 
                focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-500 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 
                focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 
              disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
