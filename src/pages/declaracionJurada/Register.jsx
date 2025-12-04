import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Mail, Lock, User, Phone, CreditCard, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email_usuario: '',
        nombre_usuario: '',
        password: '',
        confirmPassword: '',
        rol: 'TRABAJADOR',
        telefono: '',
        dni_usuario: '',
        cargo: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
        
        // Validar contraseñas
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const { confirmPassword: _confirmPassword, ...dataToSend } = formData;
            const response = await register(dataToSend);
            
            if (response.success) {
                setSuccess('✅ Usuario registrado exitosamente. Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/dj/login');
                }, 2000);
            } else {
                setError(response.error);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-2xl">
                {/* Logo y Título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500 rounded-2xl mb-4">
                        <FileText className="text-white" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-slate-400">
                        Regístrate en el sistema de gestión
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3">
                            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-green-300">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre Completo */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nombre Completo *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="nombre_usuario"
                                        required
                                        value={formData.nombre_usuario}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        name="email_usuario"
                                        required
                                        value={formData.email_usuario}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            {/* DNI */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    DNI *
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="dni_usuario"
                                        required
                                        maxLength="8"
                                        value={formData.dni_usuario}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="12345678"
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="987654321"
                                    />
                                </div>
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Cargo
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="cargo"
                                        value={formData.cargo}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="Técnico de Laboratorio"
                                    />
                                </div>
                            </div>

                            {/* Rol */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Rol *
                                </label>
                                <select
                                    name="rol"
                                    required
                                    value={formData.rol}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                >
                                    <option value="TRABAJADOR">Trabajador</option>
                                    <option value="APROBADOR">Aprobador</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Contraseña *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirmar Contraseña *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/dj/login" className="text-teal-400 hover:text-teal-300 font-medium">
                                Inicia sesión aquí
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

export default Register;