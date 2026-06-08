import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Receipt, Download, Calendar, MapPin, Search } from 'lucide-react';

const Comprobantes = () => {
    const [abonos, setAbonos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const response = await api.get('/pagos/historial-abonos');
                setAbonos(response.data);
            } catch (error) {
                console.error('Error al cargar historial:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, []);

    const abonosFiltrados = abonos.filter(abono => 
        abono.Pago?.Contrato?.Inmueble?.direccion.toLowerCase().includes(filtro.toLowerCase()) ||
        abono.tipo_transaccion.toLowerCase().includes(filtro.toLowerCase())
    );

    if (loading) return <div className="loading">Cargando tu historial de comprobantes...</div>;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>Mis Comprobantes</h2>
                    <p style={{ color: '#64748b' }}>Historial de todos los pagos y abonos realizados.</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Search size={20} color="#94a3b8" />
                    <input 
                        type="text" 
                        placeholder="Buscar por dirección o método de pago..." 
                        style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem' }}
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
            </div>

            {abonosFiltrados.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Receipt size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#64748b' }}>No se encontraron transacciones en tu historial.</p>
                </div>
            ) : (
                <div className="grid">
                    {abonosFiltrados.map((abono) => (
                        <div key={abono.id_abono} className="card property-card" style={{ borderLeft: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Calendar size={16} color="#64748b" />
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                            {new Date(abono.fecha_abono).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>Abono a Canon</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} /> {abono.Pago?.Contrato?.Inmueble?.direccion}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
                                        ${parseFloat(abono.monto).toLocaleString()}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        Saldo restante: ${parseFloat(abono.saldo_restante_momento).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{abono.tipo_transaccion}</span>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => window.open(`http://localhost:3001/api/pagos/abono/${abono.id_abono}`)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <Download size={14} /> Comprobante
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comprobantes;