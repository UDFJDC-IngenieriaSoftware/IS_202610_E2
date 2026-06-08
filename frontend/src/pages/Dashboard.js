import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import api from '../services/api';
import {
    TrendingUp, Home, AlertCircle, FileText,
    MapPin, ArrowRight, Zap, Calendar, X,
    ChevronRight, User, CheckCircle, Clock
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const navigate = useNavigate();
    const [resumen, setResumen]       = useState(null);
    const [pagos, setPagos]           = useState([]);
    const [contratos, setContratos]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [ejecutando, setEjecutando] = useState(false);
    const [motorMsg, setMotorMsg]     = useState('');
    const [panelRow, setPanelRow]     = useState(null); // fila seleccionada del rent roll

    const fetchData = async () => {
        try {
            const [resRes, pagosRes, contratosRes] = await Promise.all([
                api.get('/dashboard/resumen'),
                api.get('/pagos'),
                api.get('/contratos'),
            ]);
            setResumen(resRes.data);
            setPagos(pagosRes.data);
            setContratos(contratosRes.data);
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const ejecutarMotor = async () => {
        setEjecutando(true);
        setMotorMsg('');
        try {
            const res = await api.post('/admin/ejecutar-motor');
            setMotorMsg('✅ ' + res.data.mensaje);
            await fetchData();
        } catch {
            setMotorMsg('❌ Error al ejecutar motor');
        } finally {
            setEjecutando(false);
        }
    };

    if (loading) return <div className="loading">Cargando dashboard...</div>;

    // ── Gráfico barras ──
    const pagosPorMes = {};
    pagos.forEach(p => {
        if (p.estado === 2) {
            const mes = new Date(p.mes_correspondiente).toLocaleString('es-CO', { month: 'short', year: '2-digit' });
            pagosPorMes[mes] = (pagosPorMes[mes] || 0) + parseFloat(p.monto_total || 0);
        }
    });
    const meses = Object.keys(pagosPorMes).slice(-6);
    const barData = {
        labels: meses.length > 0 ? meses : ['Sin datos'],
        datasets: [{ label: 'Ingresos ($)', data: meses.map(m => pagosPorMes[m]), backgroundColor: 'rgba(37,99,235,0.75)', borderColor: '#2563eb', borderWidth: 2, borderRadius: 6 }]
    };
    const barOptions = {
        responsive: true, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } } }
    };

    // ── Dona ──
    const pagados    = pagos.filter(p => p.estado === 2).length;
    const pendientes = pagos.filter(p => p.estado === 1 || p.estado === 4).length;
    const mora       = pagos.filter(p => p.estado === 3).length;
    const donutData  = {
        labels: ['Pagados', 'Pendientes', 'En Mora'],
        datasets: [{ data: [pagados, pendientes, mora], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 2 }]
    };

    // ── Requieren atención ──
    const requierenAtencion = pagos
        .filter(p => p.estado === 1 || p.estado === 3 || p.estado === 4)
        .sort((a, b) => { const o = { 3: 0, 4: 1, 1: 2 }; return (o[a.estado] ?? 3) - (o[b.estado] ?? 3); })
        .slice(0, 5);

    const kpis = [
        { label: 'Ingresos Totales',     value: '$' + parseFloat(resumen?.ingresos_totales || 0).toLocaleString(), icon: <TrendingUp size={20} color="#22c55e" />, bg: '#dcfce7' },
        { label: 'Contratos Activos',    value: resumen?.contratos?.activos ?? 0,                                  icon: <FileText size={20} color="#2563eb" />,    bg: '#dbeafe' },
        { label: 'Inmuebles Arrendados', value: resumen?.inmuebles?.arrendados ?? 0,                               icon: <Home size={20} color="#7c3aed" />,        bg: '#ede9fe' },
        { label: 'Pagos Pendientes',     value: resumen?.pagos_pendientes ?? 0,                                    icon: <AlertCircle size={20} color="#ef4444" />, bg: '#fee2e2', alert: (resumen?.pagos_pendientes ?? 0) > 0 },
    ];

    const getEstadoConfig = (estado) => ({
        3: { label: 'En Mora',      bg: '#fef2f2', border: '#fca5a5', badge: '#fee2e2', badgeText: '#b91c1c', dot: '#ef4444' },
        4: { label: 'Pago Parcial', bg: '#fffbeb', border: '#fcd34d', badge: '#fef9c3', badgeText: '#a16207', dot: '#f59e0b' },
        2: { label: 'Pagado',       bg: '#f0fdf4', border: '#bbf7d0', badge: '#dcfce7', badgeText: '#15803d', dot: '#22c55e' },
        1: { label: 'Pendiente',    bg: '#f8fafc', border: '#e2e8f0', badge: '#f1f5f9', badgeText: '#475569', dot: '#94a3b8' },
    }[estado] || { label: '—', bg: '#f8fafc', border: '#e2e8f0', badge: '#f1f5f9', badgeText: '#475569', dot: '#cbd5e1' });

    // ── Rent Roll: cruzar contratos con el último pago de cada uno ──
    const rentRoll = contratos
        .filter(c => c.estado === 1)
        .map(c => {
            const pagosContrato = pagos
                .filter(p => p.id_contrato === c.id_contrato)
                .sort((a, b) => new Date(b.mes_correspondiente) - new Date(a.mes_correspondiente));
            const ultimoPago = pagosContrato[0];
            return { contrato: c, ultimoPago };
        });

    // Historial de pagos para el panel lateral
    const historialPanel = panelRow
        ? pagos
            .filter(p => p.id_contrato === panelRow.contrato.id_contrato)
            .sort((a, b) => new Date(b.mes_correspondiente) - new Date(a.mes_correspondiente))
            .slice(0, 6)
        : [];

    return (
        <div className="fade-in">

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Dashboard</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Resumen de tus arrendamientos en tiempo real.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    <button onClick={ejecutarMotor} disabled={ejecutando} className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={16} /> {ejecutando ? 'Ejecutando...' : 'Motor Financiero'}
                    </button>
                    {motorMsg && <span style={{ fontSize: '0.78rem', color: motorMsg.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{motorMsg}</span>}
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
                {kpis.map((k, i) => (
                    <div key={i} className="card" style={{ margin: 0, position: 'relative', overflow: 'hidden', ...(k.alert ? { borderColor: '#fca5a5', boxShadow: '0 0 0 2px rgba(239,68,68,0.1)' } : {}) }}>
                        {k.alert && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#ef4444,#f97316)' }} />}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span className="stat-label">{k.label}</span>
                            <div style={{ background: k.bg, padding: '0.45rem', borderRadius: '0.5rem' }}>{k.icon}</div>
                        </div>
                        <div className="stat-value" style={{ fontSize: '1.75rem' }}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Gráficos */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div className="card" style={{ margin: 0 }}>
                    <h4 style={{ marginBottom: '1rem', color: '#0f172a', fontWeight: '700' }}>Ingresos por Mes</h4>
                    <Bar data={barData} options={barOptions} height={100} />
                </div>
                <div className="card" style={{ margin: 0 }}>
                    <h4 style={{ marginBottom: '1rem', color: '#0f172a', fontWeight: '700' }}>Estado de Pagos</h4>
                    {(pagados + pendientes + mora) > 0
                        ? <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                        : <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0', fontSize: '0.9rem' }}>Sin pagos registrados</div>
                    }
                </div>
            </div>

            {/* Requieren atención */}
            {requierenAtencion.length > 0 && (
                <div className="card" style={{ margin: '0 0 1.75rem 0', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: mora > 0 ? '#ef4444' : '#f59e0b', boxShadow: `0 0 0 3px ${mora > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }} />
                            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                                Requieren atención
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: '600', background: mora > 0 ? '#fee2e2' : '#fef9c3', color: mora > 0 ? '#b91c1c' : '#a16207', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                                    {requierenAtencion.length} cobro{requierenAtencion.length > 1 ? 's' : ''}
                                </span>
                            </h4>
                        </div>
                        <button onClick={() => navigate('/pagos')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.875rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                            Ver todos <ArrowRight size={14} />
                        </button>
                    </div>
                    {requierenAtencion.map((pago, idx) => {
                        const cfg = getEstadoConfig(pago.estado);
                        const esMora = pago.estado === 3;
                        return (
                            <div key={pago.id_pago} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', background: cfg.bg, borderBottom: idx < requierenAtencion.length - 1 ? `1px solid ${cfg.border}` : 'none' }}>
                                <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: cfg.dot, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <MapPin size={13} color="#94a3b8" />
                                        <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {pago.Contrato?.Inmueble?.direccion || `Contrato #${pago.id_contrato}`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            <Calendar size={11} /> {new Date(pago.mes_correspondiente).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Arrendatario: {pago.Contrato?.id_inquilino || '--'}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: esMora ? '#b91c1c' : '#0f172a' }}>${parseFloat(pago.saldo_pendiente).toLocaleString()}</div>
                                    <span style={{ fontSize: '0.7rem', background: cfg.badge, color: cfg.badgeText, padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: '700' }}>{cfg.label}</span>
                                </div>
                                <button onClick={() => navigate('/pagos')} className="btn btn-primary"
                                    style={{ flexShrink: 0, padding: '0.5rem 1rem', fontSize: '0.82rem', background: esMora ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : undefined }}>
                                    Registrar Pago →
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── RENT ROLL ── */}
            {rentRoll.length > 0 && (
                <div className="card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                        <div>
                            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                                📋 Rent Roll
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: '600', background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                                    {rentRoll.length} propiedad{rentRoll.length > 1 ? 'es' : ''}
                                </span>
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>Haz clic en una fila para ver el detalle</p>
                        </div>
                        <button onClick={() => navigate('/contratos')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.875rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                            Ver contratos <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Tabla */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inmueble</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inquilino</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vigencia</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Canon/mes</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Último Cobro</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentRoll.map(({ contrato, ultimoPago }, idx) => {
                                const cfg = getEstadoConfig(ultimoPago?.estado ?? null);
                                const selected = panelRow?.contrato.id_contrato === contrato.id_contrato;
                                return (
                                    <tr key={contrato.id_contrato}
                                        onClick={() => setPanelRow(selected ? null : { contrato, ultimoPago })}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                            background: selected ? '#eff6ff' : 'transparent',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>

                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '3px', height: '32px', borderRadius: '2px', background: cfg.dot, flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#0f172a' }}>{contrato.Inmueble?.direccion}</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{contrato.Inmueble?.municipio} · {contrato.Inmueble?.tipo_inmueble}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <User size={13} color="#94a3b8" />
                                                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{contrato.id_inquilino}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                                            {new Date(contrato.fecha_inicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            {' – '}
                                            {new Date(contrato.fecha_fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                                            ${parseFloat(contrato.valor_mensual).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                                            {ultimoPago
                                                ? new Date(ultimoPago.mes_correspondiente).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.72rem', fontWeight: '700', background: cfg.badge, color: cfg.badgeText, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                                                    {ultimoPago ? cfg.label : 'Sin cobros'}
                                                </span>
                                                <ChevronRight size={16} color={selected ? '#2563eb' : '#cbd5e1'} style={{ transform: selected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Panel de detalle deslizable */}
                    {panelRow && (
                        <div style={{
                            borderTop: '2px solid #2563eb',
                            background: '#fff',
                            padding: '1.5rem',
                            animation: 'slideUp 0.2s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <MapPin size={16} color="#2563eb" />
                                        <h4 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{panelRow.contrato.Inmueble?.direccion}</h4>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {panelRow.contrato.Inmueble?.municipio} · {panelRow.contrato.Inmueble?.tipo_inmueble} · Estrato {panelRow.contrato.Inmueble?.estrato}
                                    </p>
                                </div>
                                <button onClick={() => setPanelRow(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', padding: '0.35rem', cursor: 'pointer' }}>
                                    <X size={18} color="#475569" />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {/* Info contrato */}
                                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Contrato Activo</p>
                                    {[
                                        { icon: <User size={14} />,      label: 'Inquilino',   value: panelRow.contrato.id_inquilino },
                                        { icon: <Calendar size={14} />,  label: 'Inicio',      value: new Date(panelRow.contrato.fecha_inicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                        { icon: <Calendar size={14} />,  label: 'Vencimiento', value: new Date(panelRow.contrato.fecha_fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                        { icon: <TrendingUp size={14} />, label: 'Canon/mes',   value: '$' + parseFloat(panelRow.contrato.valor_mensual).toLocaleString() },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{item.icon}{item.label}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Historial de pagos */}
                                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Últimos Cobros</p>
                                    {historialPanel.length === 0
                                        ? <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Sin cobros registrados</p>
                                        : historialPanel.map(p => {
                                            const c = getEstadoConfig(p.estado);
                                            return (
                                                <div key={p.id_pago} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        {p.estado === 2 ? <CheckCircle size={13} color="#22c55e" /> : <Clock size={13} color={c.dot} />}
                                                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                            {new Date(p.mes_correspondiente).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>${parseFloat(p.monto_total).toLocaleString()}</span>
                                                        <span style={{ fontSize: '0.68rem', fontWeight: '700', background: c.badge, color: c.badgeText, padding: '0.1rem 0.4rem', borderRadius: '999px' }}>{c.label}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => navigate('/pagos')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Gestionar pagos <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Todo al día */}
            {requierenAtencion.length === 0 && pagos.length > 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: '1rem', border: '1px solid #bbf7d0', marginTop: '1.75rem' }}>
                    <p style={{ fontWeight: '700', color: '#15803d' }}>🎉 ¡Todo al día! No hay cobros pendientes.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
