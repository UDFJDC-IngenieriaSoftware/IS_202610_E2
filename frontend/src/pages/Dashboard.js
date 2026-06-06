import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, Users, Home, AlertCircle, FileText } from 'lucide-react';

const Dashboard = () => {
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResumen = async () => {
            try {
                const response = await api.get('/dashboard/resumen');
                setResumen(response.data);
            } catch (error) {
                console.error('Error al cargar resumen:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResumen();
    }, []);

    if (loading) return <div>Cargando dashboard...</div>;

    return (
        <div>
            <div className="grid">
                <div className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Ingresos Totales</span>
                        <TrendingUp size={20} color="#22c55e" />
                    </div>
                    <div className="stat-value">${parseFloat(resumen?.ingresos_totales || 0).toLocaleString()}</div>
                </div>
                <div className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Contratos Activos</span>
                        <FileText size={20} color="#2563eb" />
                    </div>
                    <div className="stat-value">{resumen?.contratos?.activos}</div>
                </div>
                <div className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Inmuebles Arrendados</span>
                        <Home size={20} color="#6366f1" />
                    </div>
                    <div className="stat-value">{resumen?.inmuebles?.arrendados}</div>
                </div>
                <div className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Pagos Pendientes</span>
                        <AlertCircle size={20} color="#ef4444" />
                    </div>
                    <div className="stat-value">{resumen?.pagos_pendientes}</div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Salud Financiera</h3>
                <p style={{ color: '#64748b' }}>Resumen del estado actual de tus alquileres.</p>
                {/* Aquí podría ir un gráfico */}
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '0.5rem', marginTop: '1rem' }}>
                    [Gráfico de Ingresos vs Mora]
                </div>
            </div>
        </div>
    );
};

export default Dashboard;