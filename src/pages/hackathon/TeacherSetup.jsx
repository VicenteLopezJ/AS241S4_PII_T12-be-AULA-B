import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithRole } from '../../services/hackathon/userService'; 
import '../../styles/hackathon/Login.css'; 

const TeacherSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const externalUsername = location.state?.externalUsername;
    const externalRole = location.state?.externalRole;
    const initialIsTutor = externalRole === 'Admin global' ? 'S' : 'N';

    const [formData, setFormData] = useState({
        username: externalUsername || '',
        password: '',
        name: '',
        surname: '',
        email: '',
        is_tutor: initialIsTutor 
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!externalUsername) {
            navigate('/login');
        }
    }, [externalUsername, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.password || !formData.name || !formData.surname || !formData.email) {
            setError("Por favor completa todos los campos obligatorios");
            return;
        }

        setLoading(true);

        try {
            const response = await createUserWithRole('profesor', {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                is_tutor: formData.is_tutor,
                status: 1
            });

            console.log("Registro exitoso:", response);

            const sessionData = {
                idUser: response.idUser, 
                username: response.username,
                role: 'profesor',
                status: 1
            };

            localStorage.setItem("user", JSON.stringify(sessionData));

            navigate("/hackathon/evaluationday");

        } catch (err) {
            console.error("Error en registro:", err);
            setError("Error al registrar los datos. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!externalUsername) return null; 

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card" style={{ maxWidth: '500px' }}> 

                    <div className="login-header">
                        <div className="login-icon">📝</div>
                        <h1>Finalizar Configuración</h1>
                        <p>Detectamos tu cuenta de Administrador. <br/>Completa tu perfil de profesor para continuar.</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        
                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Usuario (Vinculado al Dashboard)</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                disabled={true} 
                                className="bg-gray-100 cursor-not-allowed opacity-70"
                            />
                        </div>

                        <div className="flex gap-4" style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group flex-1">
                                <label htmlFor="name">Nombre</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Tu nombre"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label htmlFor="surname">Apellido</label>
                                <input
                                    id="surname"
                                    type="text"
                                    name="surname"
                                    placeholder="Tu apellido"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Correo Institucional</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="ejemplo@universidad.edu"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Crear Contraseña Local</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Contraseña para este sistema"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <small style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', display:'block' }}>
                                Esta contraseña es independiente a la del Dashboard.
                            </small>
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${loading ? "loading" : ""}`}
                            disabled={loading}
                            style={{ marginTop: '1rem' }}
                        >
                            {loading ? "Registrando..." : "Registrar y Acceder"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeacherSetup;