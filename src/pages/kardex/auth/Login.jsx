import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/kardex/authService";
import "../../../styles/kardex/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(user_name, password);

      console.log("Login exitoso:", data);

      navigate("/"); // YA NO DA PANTALLA BLANCA
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    }
  };

  return (
    <div className="login-bg">
      <div className="neon-circle"></div>
      <div className="neon-circle2"></div>

      <div className="login-card glass-effect">
        <h2 className="title">Bienvenido</h2>
        <p className="subtitle">Ingrese sus credenciales</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              placeholder="Ingrese su usuario"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="login-btn neon-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
