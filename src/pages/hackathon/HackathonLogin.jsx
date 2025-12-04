import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/hackathon/userService'; 
import '../../styles/hackathon/Login.css';

const HackathonLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError("Por favor completa todos los campos");
            return;
        }
        setLoading(true);

        try {
            const response = await login({
                username: username,
                password: password
            });

            console.log("Login response:", response);

            if (!response || !response.role) {
                setError("Credenciales incorrectas");
                setLoading(false);
                return;
            }

            localStorage.setItem("user", JSON.stringify(response));

            if (response.role === "profesor") {
                navigate("/hackathon/evaluationday");
            } else if (response.role === "estudiante") {
                navigate("/hackathon/student");
            } else {
                setError("Rol no reconocido por el sistema");
            }

        } catch (err) {
            console.error("Login error:", err);
            setError("Error al iniciar sesión. Verifica tus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">

                    <div className="login-header">
                        <div className="login-icon">🎓</div>
                        <h1>Sistema de Hackathon</h1>
                        <p>Ingresa tus credenciales para continuar</p>
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        
                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`login-button ${loading ? "loading" : ""}`}
                            disabled={loading}
                        >
                            {loading ? "" : "Iniciar Sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HackathonLogin;
