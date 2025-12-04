import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError('');
            
            await login(formData.email, formData.password);
            
            // Redirigir al dashboard DJ
            navigate('/dj/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Botón Regresar - Fixed en esquina superior izquierda */}
            <Link 
                to="/dashboard" 
                className="fixed top-6 left-6 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group z-50"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Regresar al Dashboard General</span>
            </Link>

            <div className="w-full max-w-md">
                {/* Logo y Título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500 rounded-2xl mb-4">
                        <FileText className="text-white" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Sistema de Gestión
                    </h1>
                    <p className="text-slate-400">
                        Declaraciones Juradas - Valle Grande
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            ¿No tienes cuenta?{' '}
                            <Link to="/dj/register" className="text-teal-400 hover:text-teal-300 font-medium">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-8">
                    © 2025 Instituto Valle Grande. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;