import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import api from '../services/api';
import { TrendingUp, Home, AlertCircle, FileText } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [resumen, setResumen] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ejecutando, setEjecutando] = useState(false);
    const [motorMsg, setMotorMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRes, pagosRes] = await Promise.all([
                    api.get('/dashboard/resumen'),
                    api.get('/pagos')
                ]);
                setResumen(resRes.data);
                setPagos(pagosRes.data);
            } catch (error) {
                console.error('Error al cargar dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const ejecutarMotor = async () => {
        setEjecutando(true);
        setMotorMsg('');
        try {
            const res = await api.post('/admin/ejecutar-motor');
            setMotorMsg('✅ ' + res.data.mensaje);
            // Recargar datos
            const [resRes, pagosRes] = await Promise.all([
                api.get('/dashboard/resumen'),
                api.get('/pagos')
            ]);
            setResumen(resRes.data);
            setPagos(pagosRes.data);
        } catch (error) {
            setMotorMsg('❌ Error al ejecutar motor');
        } finally {
            setEjecutando(false);
        }
    };

    if (loading) return <div className="loading">Cargando dashboard...</div>;

    // Gráfico de barras — ingresos por mes
    const pagosPorMes = {};
    pagos.forEach(p => {
        if (p.estado === 2) {
            const mes = new Date(p.mes_correspondiente).toLocaleString('es-CO', { month: 'short', year: '2-digit' });
            pagosPorMes[mes] = (pagosPorMes[mes] || 0) + parseFloat(p.monto_total || 0);
        }
    });
    const meses = Object.keys(pagosPorMes).slice(-6);
    const montos = meses.map(m => pagosPorMes[m]);

    const barData = {
        labels: meses.length > 0 ? meses : ['Sin datos'],
        datasets: [{
            label: 'Ingresos ($)',
            data: montos.length > 0 ? montos : [0],
            backgroundColor: 'rgba(37, 99, 235, 0.75)',
            borderColor: '#2563eb',
            borderWidth: 2,
            borderRadius: 6,
        }]
    };

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: val => '$' + val.toLocaleString() }
            }
        }
    };

    // Gráfico de dona — estado de pagos
    const pagados   = pagos.filter(p => p.estado === 2).length;
    const pendientes = pagos.filter(p => p.estado === 1).length;
    const mora      = pagos.filter(p => p.estado === 3).length;

    const donutData = {
        labels: ['Pagados', 'Pendientes', 'En Mora'],
        datasets: [{
            data: [pagados, pendientes, mora],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderWidth: 2,
        }]
    };

    const kpis = [
        { label: 'Ingresos Totales',     value: '$' + parseFloat(resumen?.ingresos_totales || 0).toLocaleString(), icon: <TrendingUp size={22} color="#22c55e" />, bg: '#dcfce7' },
        { label: 'Contratos Activos',    value: resumen?.contratos?.activos ?? 0,                                  icon: <FileText size={22} color="#2563eb" />,   bg: '#dbeafe' },
        { label: 'Inmuebles Arrendados', value: resumen?.inmuebles?.arrendados ?? 0,                               icon: <Home size={22} color="#7c3aed" />,       bg: '#ede9fe' },
        { label: 'Pagos Pendientes',     value: resumen?.pagos_pendientes ?? 0,                                    icon: <AlertCircle size={22} color="#ef4444" />, bg: '#fee2e2' },
    ];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>Dashboard</h2>
                    <p style={{ color: '#64748b' }}>Resumen general de tus arrendamientos.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <button
                        onClick={ejecutarMotor}
                        disabled={ejecutando}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {ejecutando ? '⏳ Ejecutando...' : '⚡ Ejecutar Motor Financiero'}
                    </button>
                    {motorMsg && <span style={{ fontSize: '0.8rem', color: motorMsg.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{motorMsg}</span>}
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {kpis.map((k, i) => (
                    <div key={i} className="card" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span className="stat-label">{k.label}</span>
                            <div style={{ background: k.bg, padding: '0.5rem', borderRadius: '0.5rem' }}>
                                {k.icon}
                            </div>
                        </div>
                        <div className="stat-value">{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Gráficos */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ margin: 0 }}>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Ingresos por Mes</h4>
                    <Bar data={barData} options={barOptions} height={100} />
                </div>
                <div className="card" style={{ margin: 0 }}>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Estado de Pagos</h4>
                    {(pagados + pendientes + mora) > 0
                        ? <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                        : <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>Sin pagos registrados</div>
                    }
                </div>
            </div>

            {/* Alerta mora */}
            {mora > 0 && (
                <div className="card" style={{ margin: 0, borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ color: '#ef4444', marginBottom: '0.25rem' }}>⚠️ Pagos en Mora ({mora})</h4>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Hay {mora} pago(s) vencido(s). Revisa el módulo de Pagos.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
