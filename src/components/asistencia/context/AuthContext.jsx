import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔵 AuthContext - Iniciando verificación de sesión...");

    const token = localStorage.getItem("assistanceToken");
    const userData = localStorage.getItem("assistanceUser");

    console.log("🔍 AuthContext - Datos en localStorage:");
    console.log("   - Token:", token ? "✅ EXISTE" : "❌ NO EXISTE");
    console.log("   - UserData:", userData ? "✅ EXISTE" : "❌ NO EXISTE");

    if (
      token &&
      userData &&
      userData !== "undefined" &&
      token !== "undefined" &&
      userData !== "null" &&
      token !== "null"
    ) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("✅ AuthContext - Usuario cargado:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("❌ AuthContext - Error parsing user:", error);
        localStorage.removeItem("assistanceToken");
        localStorage.removeItem("assistanceUser");
      }
    } else {
      console.log("❌ AuthContext - No hay sesión válida");
    }

    setLoading(false);
    console.log("🔵 AuthContext - Verificación completada");
  }, []);

  const login = (userData, token) => {
    console.log("🔐 AuthContext - Login llamado con:", {
      userData,
      token: token?.substring(0, 20) + "...",
    });
    localStorage.setItem("assistanceToken", token);
    localStorage.setItem("assistanceUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.log("🚪 AuthContext - Logout");
    localStorage.removeItem("assistanceToken");
    localStorage.removeItem("assistanceUser");
    setUser(null);
  };

  const isAuthenticated = () => {
    const hasUser = !!user;
    const hasToken = !!localStorage.getItem("assistanceToken");
    return hasUser && hasToken;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const getStudentId = () => {
    if (user?.studentId) return user.studentId;
    const savedUser = localStorage.getItem("assistanceUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.studentId;
      } catch (error) {
        console.error("Error parsing assistanceUser:", error);
      }
    }
    return null;
  };

  const getTeacherId = () => {
    if (user?.teacherId) return user.teacherId;
    const savedUser = localStorage.getItem("assistanceUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.teacherId;
      } catch (error) {
        console.error("Error parsing assistanceUser:", error);
      }
    }
    return null;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading,
    getStudentId,
    getTeacherId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
