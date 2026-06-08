import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, FileText, CreditCard, LogOut, Receipt } from 'lucide-react';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    Arriendos360
                </div>
                <nav>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/inmuebles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Home size={20} /> Inmuebles
                    </NavLink>
                    <NavLink to="/contratos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FileText size={20} /> Contratos
                    </NavLink>
                    <NavLink to="/pagos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <CreditCard size={20} /> Pagos
                    </NavLink>
                    <NavLink to="/comprobantes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Receipt size={20} /> Comprobantes
                    </NavLink>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <LogOut size={20} /> Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <header className="navbar">
                    <h2>Bienvenido, {usuario.nombres}</h2>
                    <div className="badge badge-success">{usuario.rol}</div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default Layout;