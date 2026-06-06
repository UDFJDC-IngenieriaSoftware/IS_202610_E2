import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

const Pagos = () => {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleRegistrarPago = async (id) => {
        try {
            const monto_pagado = prompt('Ingrese el monto pagado:');
            if (!monto_pagado) return;

            await api.put(`/pagos/${id}/pagar`, {
                monto_pagado: parseFloat(monto_pagado),
                tipo_transaccion: 'Transferencia',
                observaciones: 'Pago registrado desde el panel'
            });
            fetchPagos();
        } catch (error) {
            alert('Error al registrar pago');
        }
    };

    const handleVerificarMora = async () => {
        try {
            await api.post('/pagos/verificar-mora');
            fetchPagos();
            alert('Cálculo de mora completado');
        } catch (error) {
            alert('Error al verificar mora');
        }
    };

    if (loading) return <div>Cargando pagos...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Gestión Financiera</h3>
                <button className="btn btn-primary" onClick={handleVerificarMora}>
                    Ejecutar Motor de Mora
                </button>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Mes</th>
                            <th style={{ padding: '1rem' }}>Contrato</th>
                            <th style={{ padding: '1rem' }}>Monto</th>
                            <th style={{ padding: '1rem' }}>Saldo</th>
                            <th style={{ padding: '1rem' }}>Estado</th>
                            <th style={{ padding: '1rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagos.map(pago => (
                            <tr key={pago.id_pago} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>{new Date(pago.mes_correspondiente).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</td>
                                <td style={{ padding: '1rem' }}>#{pago.id_contrato}</td>
                                <td style={{ padding: '1rem' }}>${parseFloat(pago.monto_total).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>${parseFloat(pago.saldo_pendiente).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${pago.estado === 2 ? 'badge-success' : pago.estado === 3 ? 'badge-error' : 'badge-pending'}`}>
                                        {pago.estado === 2 ? 'Pagado' : pago.estado === 3 ? 'En Mora' : 'Pendiente'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    {pago.estado !== 2 && (
                                        <button className="btn btn-primary" onClick={() => handleRegistrarPago(pago.id_pago)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            Pagar
                                        </button>
                                    )}
                                    <button className="btn" style={{ padding: 0 }} onClick={() => window.open(`http://localhost:3001/api/pagos/${pago.id_pago}/recibo`)}>
                                        <Download size={18} color="#64748b" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Pagos;