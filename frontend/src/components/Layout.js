import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, FileText, CreditCard, LogOut, Receipt } from 'lucide-react';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esPropietario = usuario.rol === 'propietario';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '0.25rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    Arriendos360
                </div>
                <div style={{ marginBottom: '1.5rem', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {esPropietario ? '🏠 Propietario' : '👤 Inquilino'}
                </div>

                <nav>
                    {esPropietario ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <NavLink to="/contratos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <FileText size={20} /> Mi Contrato
                            </NavLink>
                            <NavLink to="/pagos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <CreditCard size={20} /> Mis Pagos
                            </NavLink>
                        </>
                    )}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                            {usuario.nombres} {usuario.apellidos}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{usuario.correo}</p>
                    </div>
                    <button onClick={handleLogout} className="nav-link"
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <LogOut size={20} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="navbar">
                    <h2>Bienvenido, {usuario.nombres}</h2>
                    <span className={`badge ${esPropietario ? 'badge-success' : 'badge-pending'}`}>
                        {usuario.rol}
                    </span>
                </header>
                {children}
            </main>
        </div>
    );
};

export default Layout;
