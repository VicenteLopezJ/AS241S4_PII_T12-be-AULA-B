import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/asistencia/context/AuthContext';
import { userService } from '../../services/asistencia/user/userService';
import '../../styles/asistencia/Login.css';

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState('student');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const roles = [
        { id: 'student', label: 'Estudiante', icon: '🎓' },
        { id: 'admin', label: 'Administrador', icon: '👨‍💼' },
        { id: 'teacher', label: 'Profesor', icon: '👨‍🏫' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !dni) {
            setError('Por favor, completa todos los campos');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, ingresa un correo electrónico válido');
            return;
        }

        if (dni.length < 8) {
            setError('La contraseña/DNI debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await userService.login({
                username: email,
                password: dni
            });

            console.log('='.repeat(80));
            console.log('🔍 DEBUGGING LOGIN RESPONSE');
            console.log('='.repeat(80));
            console.log('📦 Response completa:', response);
            console.log('📦 Response.user:', response.user);
            console.log('📦 Response.data:', response.data);
            
        
            console.log('🔑 Claves en response:', Object.keys(response));
            if (response.user) {
                console.log('🔑 Claves en response.user:', Object.keys(response.user));
            }
            if (response.data?.user) {
                console.log('🔑 Claves en response.data.user:', Object.keys(response.data.user));
            }
            console.log('='.repeat(80));

            if (response && response.token) {
         
                const userData = {
                    userId: response.user?.userId || response.user?.user_id || response.user?.id || 
                            response.data?.user?.userId || response.data?.user?.user_id || response.data?.user?.id,
                    email: response.user?.email || response.data?.user?.email,
                    username: response.user?.username || response.user?.email || response.data?.user?.username || response.data?.user?.email,
                    role: (response.user?.role || response.data?.user?.role || response.role || selectedRole).toLowerCase(),
                    studentId: response.user?.studentId || response.user?.student_id || 
                               response.data?.user?.studentId || response.data?.user?.student_id ||
                               response.studentId || response.student_id,
                    teacherId: response.user?.teacherId || response.user?.teacher_id || 
                               response.data?.user?.teacherId || response.data?.user?.teacher_id,
                    adminId: response.user?.adminId || response.user?.admin_id || 
                             response.data?.user?.adminId || response.data?.user?.admin_id,
                };

                console.log('✅ userData construido:', userData);
                console.log('📧 Email:', userData.email);
                console.log('🔑 Role:', userData.role);
                console.log('🆔 Student ID:', userData.studentId);
                console.log('👨‍🏫 Teacher ID:', userData.teacherId);
                console.log('👨‍💼 Admin ID:', userData.adminId);
                
               
                if ((userData.role === 'student' || userData.role === 'estudiante') && !userData.studentId) {
                    console.error('🚨 ERROR CRÍTICO: Usuario tipo estudiante sin studentId');
                    console.error('🔍 Response user completo:', response.user);
                    setError('Error de configuración: El estudiante no tiene ID asignado. Contacta al administrador.');
                    setLoading(false);
                    return;
                }

              
                login(userData, response.token);

                // ✅ REDIRIGIR CON EL PREFIJO /asistencia
                const roleLower = userData.role?.toLowerCase();
                switch (roleLower) {
                    case 'admin':
                        navigate('/asistencia/admin/initial', { replace: true });
                        break;
                    case 'teacher':
                    case 'profesor':
                        navigate('/asistencia/teacher/inicial', { replace: true });
                        break;
                    case 'student':
                    case 'estudiante':
                    default:
                        navigate('/asistencia/student/cursos', { replace: true });
                }
            } else {
                setError('Respuesta del servidor inválida');
            }
        } catch (err) {
            console.error('❌ Error en login:', err);

            if (err.code === 'ERR_NETWORK') {
                setError('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña/DNI.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-icon">
                            {roles.find(r => r.id === selectedRole)?.icon}
                        </div>
                        <h1>Sistema de Asistencias</h1>
                        <p>Ingresa tus credenciales para continuar</p>
                    </div>

                    {/* Role Tabs */}
                    <div className="role-tabs">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                className={`role-tab ${selectedRole === role.id ? 'active' : ''}`}
                                onClick={() => setSelectedRole(role.id)}
                                type="button"
                            >
                                <span>{role.icon}</span> {role.label}
                            </button>
                        ))}
                    </div>

                    {/* Login Form */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dni">
                                {selectedRole === 'student' ? 'DNI / Contraseña' : 'Contraseña'}
                            </label>
                            <input
                                id="dni"
                                type="password"
                                placeholder={selectedRole === 'student' ? 'Ingresa tu  contraseña' : 'Ingresa tu contraseña'}
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            {selectedRole === 'student' && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Usa  la contraseña que hayas configurado
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${loading ? 'loading' : ''}`}
                            data-role={selectedRole}
                            disabled={loading}
                        >
                            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;