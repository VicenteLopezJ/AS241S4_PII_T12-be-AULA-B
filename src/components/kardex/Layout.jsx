import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaPills,
  FaUserTie,
  FaHome,
  FaBoxes,
  FaHamburger,
  FaShoppingCart,
  FaSignOutAlt,
  FaUserMd
} from "react-icons/fa";

import "../../styles/kardex/Layout.css";


const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const links = [
    { to: "/", name: "Inicio", icon: <FaHome /> },
    { to: "/attention", name: "Atenciones", icon: <FaUserMd /> },
    { to: "/medicamentos", name: "Medicamentos", icon: <FaPills /> },
    { to: "/proveedor", name: "Proveedor", icon: <FaUserTie /> },
    { to: "/inventario", name: "Inventario", icon: <FaBoxes /> },
    { to: "/lonchera", name: "Lonchera", icon: <FaHamburger /> },
    { to: "/compras", name: "Compras", icon: <FaShoppingCart /> },
  ];

  return (
    <div className="layout-container-new">
      
      <aside className="sidebar-new">

        {/* LOGO */}
        <div className="sidebar-logo-new">
          <span className="logo-title-new">Tópico Valle Grande</span>
        </div>

        {/* NAV */}
        <nav className="nav-links-new">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item-new ${
                location.pathname === item.to ? "active-new" : ""
              }`}
            >
              <span className="nav-icon-new">{item.icon}</span>
              <span className="nav-text-new">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="logout-container-new">
          <button className="logout-btn-new" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Salir</span>
          </button>
        </div>

      </aside>

      {/* CONTENIDO */}
      <main className="main-content-new">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
