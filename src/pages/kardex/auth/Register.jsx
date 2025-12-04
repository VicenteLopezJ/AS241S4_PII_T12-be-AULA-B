import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../../services/kardex/authService"; 
import "../../../styles/kardex/Register.css"; 

export default function Register() {
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    confirmPassword: "",
    email: "",
    rol: "user"
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    try {
      await register(formData);
      setSuccess("Usuario registrado exitosamente. Redirigiendo al login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al registrar usuario");
    }
  };
  
  return (
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Rol</label>
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <button type="submit">Registrarse</button>
        
        <p className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar Sesión</Link>
        </p>
      </form>
    </div>
  );
}