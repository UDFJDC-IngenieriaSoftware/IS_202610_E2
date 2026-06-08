import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Download, History, X, Receipt } from 'lucide-react';

const Pagos = () => {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [selectedPago, setSelectedPago] = useState(null);
    const [abonos, setAbonos] = useState([]);
    const [showAbonosModal, setShowAbonosModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [payFormData, setPayFormData] = useState({
        monto_pagado: '',
        tipo_transaccion: 'Transferencia Bancaria',
        observaciones: ''
    });

    useEffect(() => {
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        try {
            const response = await api.get('/pagos');
            setPagos(response.data);
        } catch (error) {
            console.error('Error al cargar pagos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAbonos = async (id_pago) => {
        try {
            const response = await api.get(`/pagos/${id_pago}/abonos`);
            setAbonos(response.data);
            setShowAbonosModal(true);
        } catch (error) {
            alert('Error al cargar historial de abonos');
        }
    };

    const handleRegistrarPago = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/pagos/${selectedPago.id_pago}/pagar`, payFormData);
            setShowPayModal(false);
            setPayFormData({ monto_pagado: '', tipo_transaccion: 'Transferencia Bancaria', observaciones: '' });
            fetchPagos();
            alert('Pago/Abono registrado correctamente');
        } catch (error) {
            alert('Error: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const getStatusInfo = (estado) => {
        switch (estado) {
            case 1: return { label: 'Pendiente', class: 'badge-pending', icon: <Clock size={14} /> };
            case 2: return { label: 'Pagado', class: 'badge-success', icon: <CheckCircle size={14} /> };
            case 3: return { label: 'En Mora', class: 'badge-error', icon: <AlertTriangle size={14} /> };
            case 4: return { label: 'Pago Parcial', class: 'badge-warning', icon: <Clock size={14} /> };
            default: return { label: 'Desconocido', class: '', icon: null };
        }
    };

    if (loading) return <div className="loading">Cargando gestión financiera...</div>;

    const pagosFiltrados = pagos.filter(p => {
        const matchTexto = !filtro || (() => {
            const q = filtro.toLowerCase();
            const direccion = p.Contrato?.Inmueble?.direccion?.toLowerCase() || '';
            const inquilino = (p.Contrato?.id_inquilino || '').toLowerCase();
            const contrato = String(p.id_contrato);
            return direccion.includes(q) || inquilino.includes(q) || contrato.includes(q);
        })();
        const matchEstado = filtroEstado === 'todos'
            || (filtroEstado === 'pendiente' && p.estado === 1)
            || (filtroEstado === 'pagado'    && p.estado === 2)
            || (filtroEstado === 'mora'      && p.estado === 3)
            || (filtroEstado === 'parcial'   && p.estado === 4);
        return matchTexto && matchEstado;
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>Gestión de Pagos</h2>
                    <p style={{ color: '#64748b' }}>Control de cánones de arrendamiento y abonos.</p>
                </div>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Búsqueda por texto */}
                <div className="card" style={{ flex: 1, minWidth: '250px', padding: '0.75rem 1rem', margin: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: '#94a3b8' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por dirección, cédula o # contrato..."
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.9rem', background: 'transparent' }}
                        />
                        {filtro && <button onClick={() => setFiltro('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>}
                    </div>
                </div>

                {/* Tabs de estado */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                        { key: 'todos',     label: 'Todos',      color: '#475569', bg: '#f1f5f9' },
                        { key: 'pendiente', label: 'Pendientes', color: '#854d0e', bg: '#fef9c3' },
                        { key: 'pagado',    label: 'Pagados',    color: '#166534', bg: '#dcfce7' },
                        { key: 'mora',      label: 'En Mora',    color: '#991b1b', bg: '#fee2e2' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFiltroEstado(tab.key)}
                            style={{
                                padding: '0.45rem 0.9rem',
                                borderRadius: '999px',
                                border: filtroEstado === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                                background: filtroEstado === tab.key ? tab.bg : '#f8fafc',
                                color: filtroEstado === tab.key ? tab.color : '#64748b',
                                fontWeight: filtroEstado === tab.key ? '600' : '400',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.15s'
                            }}
                        >
                            {tab.label}
                            <span style={{ marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                                ({pagos.filter(p =>
                                    tab.key === 'todos' ? true :
                                    tab.key === 'pendiente' ? p.estado === 1 :
                                    tab.key === 'pagado'    ? p.estado === 2 :
                                    p.estado === 3
                                ).length})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Mes de Cobro</th>
                            <th style={{ padding: '1rem' }}>Inmueble</th>
                            <th style={{ padding: '1rem' }}>Arrendatario</th>
                            <th style={{ padding: '1rem' }}>Monto Total</th>
                            <th style={{ padding: '1rem' }}>Saldo</th>
                            <th style={{ padding: '1rem' }}>Estado</th>
                            <th style={{ padding: '1rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.length === 0 && (
                            <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No se encontraron resultados.</td></tr>
                        )}
                        {pagosFiltrados.map(pago => {
                            const status = getStatusInfo(pago.estado);
                            return (
                                <tr key={pago.id_pago} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                                        {new Date(pago.mes_correspondiente).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{pago.Contrato?.Inmueble?.direccion || `#${pago.id_contrato}`}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{pago.Contrato?.Inmueble?.municipio}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                        {pago.Contrato?.id_inquilino || '--'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>${parseFloat(pago.monto_total).toLocaleString()}</td>
                                    <td style={{ padding: '1rem', color: parseFloat(pago.saldo_pendiente) > 0 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                                        ${parseFloat(pago.saldo_pendiente).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${status.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {status.icon} {status.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {pago.estado !== 2 && (
                                                <button 
                                                    className="btn btn-primary" 
                                                    onClick={() => { setSelectedPago(pago); setShowPayModal(true); }} 
                                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    Registrar Pago
                                                </button>
                                            )}
                                            <button 
                                                className="btn-icon-subtle" 
                                                title="Historial de abonos"
                                                onClick={() => { setSelectedPago(pago); fetchAbonos(pago.id_pago); }}
                                            >
                                                <History size={18} />
                                            </button>
                                            <button 
                                                className="btn-icon-subtle" 
                                                title="Descargar Recibo Mensual"
                                                onClick={() => window.open(`http://localhost:3001/api/pagos/${pago.id_pago}/recibo`)}
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal para Registrar Pago/Abono */}
            {showPayModal && (
                <div className="modal-overlay">
                    <div className="card modal-content" style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h4>Registrar Abono</h4>
                            <button className="btn-icon" onClick={() => setShowPayModal(false)}><X size={20} /></button>
                        </div>
                        <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                            Saldo pendiente: <strong>${parseFloat(selectedPago?.saldo_pendiente).toLocaleString()}</strong>
                        </p>
                        <form onSubmit={handleRegistrarPago}>
                            <label className="form-label">Monto a Pagar</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={payFormData.monto_pagado}
                                onChange={(e) => setPayFormData({...payFormData, monto_pagado: e.target.value})}
                                max={selectedPago?.saldo_pendiente}
                                required 
                            />
                            
                            <label className="form-label" style={{ marginTop: '1rem' }}>Método de Pago</label>
                            <select 
                                className="form-control"
                                value={payFormData.tipo_transaccion}
                                onChange={(e) => setPayFormData({...payFormData, tipo_transaccion: e.target.value})}
                            >
                                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Consignación">Consignación</option>
                            </select>

                            <label className="form-label" style={{ marginTop: '1rem' }}>Observaciones</label>
                            <textarea 
                                className="form-control"
                                value={payFormData.observaciones}
                                onChange={(e) => setPayFormData({...payFormData, observaciones: e.target.value})}
                            ></textarea>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                                Confirmar Transacción
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Historial de Abonos */}
            {showAbonosModal && (
                <div className="modal-overlay">
                    <div className="card modal-content" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h4>Historial de Abonos - Pago #{selectedPago?.id_pago}</h4>
                            <button className="btn-icon" onClick={() => setShowAbonosModal(false)}><X size={20} /></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {abonos.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay abonos registrados para este mes.</p>
                            ) : (
                                abonos.map(abono => (
                                    <div key={abono.id_abono} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: '600' }}>${parseFloat(abono.monto).toLocaleString()}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(abono.fecha_abono).toLocaleString()}</p>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{abono.tipo_transaccion}</p>
                                        </div>
                                        <button 
                                            className="btn-icon-subtle" 
                                            title="Descargar Comprobante"
                                            onClick={() => window.open(`http://localhost:3001/api/pagos/abono/${abono.id_abono}`)}
                                        >
                                            <Receipt size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pagos;