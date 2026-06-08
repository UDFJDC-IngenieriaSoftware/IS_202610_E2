import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Home as HomeIcon, X, MapPin, Pencil, Trash2 } from 'lucide-react';
import { colombiaData } from '../data/colombia';

const FORM_VACIO = {
    direccion: '', departamento: '', municipio: '', barrio: '',
    tipo_inmueble: 'Apartamento', area_m2: '', estrato: 3,
    habitaciones: 2, banos: 1, deposito: 0, parqueaderos: 0,
    precio: '', estado_ocupacion: 'disponible'
};

const Inmuebles = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(null); // ID del inmueble en edición
    const [formData, setFormData] = useState(FORM_VACIO);

    const fetchInmuebles = async () => {
        try {
            const response = await api.get('/inmuebles');
            setInmuebles(response.data);
        } catch (error) {
            console.error('Error al cargar inmuebles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInmuebles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si cambia el departamento, resetear el municipio
        if (name === 'departamento') {
            setFormData({ ...formData, [name]: value, municipio: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await api.put(`/inmuebles/${editando}`, formData);
            } else {
                await api.post('/inmuebles', formData);
            }
            setShowModal(false);
            setEditando(null);
            setFormData(FORM_VACIO);
            fetchInmuebles();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const handleEditar = (inmueble) => {
        setEditando(inmueble.id_inmueble);
        setFormData({
            direccion: inmueble.direccion || '',
            departamento: inmueble.departamento || '',
            municipio: inmueble.municipio || '',
            barrio: inmueble.barrio || '',
            tipo_inmueble: inmueble.tipo_inmueble || 'Apartamento',
            area_m2: inmueble.area_m2 || '',
            estrato: inmueble.estrato || 3,
            habitaciones: inmueble.habitaciones || 2,
            banos: inmueble.banos || 1,
            deposito: inmueble.deposito || 0,
            parqueaderos: inmueble.parqueaderos || 0,
            precio: '',
            estado_ocupacion: inmueble.estado_ocupacion || 'disponible'
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este inmueble?')) return;
        try {
            await api.delete(`/inmuebles/${id}`);
            fetchInmuebles();
        } catch (error) {
            alert('Error al eliminar: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const resetForm = () => {
        setEditando(null);
        setFormData(FORM_VACIO);
    };

    if (loading) return <div className="loading">Cargando tus inmuebles...</div>;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>Mis Inmuebles</h2>
                    <p style={{ color: '#64748b' }}>Gestiona tus propiedades registradas.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                    <Plus size={18} /> Registrar Propiedad
                </button>
            </div>

            {inmuebles.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <HomeIcon size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#64748b' }}>No tienes inmuebles registrados todavía.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {inmuebles.map((inmueble) => {
                        const disponible = inmueble.estado_ocupacion === 'disponible';
                        return (
                            <div key={inmueble.id_inmueble} style={{
                                background: '#fff',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
                                transition: 'box-shadow 0.2s, transform 0.2s',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {/* Cabecera con color según estado — Von Restorff */}
                                <div style={{
                                    background: disponible ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem', borderRadius: '0.6rem' }}>
                                            <HomeIcon size={22} color="#fff" />
                                        </div>
                                        <div>
                                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                                                {inmueble.tipo_inmueble || 'Inmueble'}
                                            </p>
                                            <p style={{ color: '#fff', fontWeight: '700', fontSize: '1rem', lineHeight: 1.2 }}>
                                                {inmueble.direccion}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Estado destacado — Von Restorff */}
                                    <span style={{
                                        background: disponible ? '#22c55e' : '#f59e0b',
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '999px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {disponible ? 'Disponible' : 'Arrendado'}
                                    </span>
                                </div>

                                {/* Cuerpo — Proximidad: datos agrupados */}
                                <div style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
                                    {/* Ubicación */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                        <MapPin size={14} color="#94a3b8" />
                                        {[inmueble.barrio, inmueble.municipio].filter(Boolean).join(', ')}
                                        {inmueble.estrato && <span style={{ marginLeft: 'auto', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>E{inmueble.estrato}</span>}
                                    </div>

                                    {/* Specs — Región común: separados del resto */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0',
                                        background: '#f8fafc',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        border: '1px solid #f1f5f9',
                                    }}>
                                        {[
                                            { label: 'Hab.', value: inmueble.habitaciones ?? '--' },
                                            { label: 'Baños', value: inmueble.banos ?? '--' },
                                            inmueble.area_m2 ? { label: 'Área', value: `${inmueble.area_m2}m²` } : null,
                                        ].filter(Boolean).map((spec, i, arr) => (
                                            <div key={i} style={{
                                                flex: 1,
                                                textAlign: 'center',
                                                padding: '0.6rem 0.5rem',
                                                borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                                            }}>
                                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.15rem' }}>{spec.label}</span>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer — Ley de Fitts: botones grandes y separados */}
                                <div style={{
                                    display: 'flex',
                                    borderTop: '1px solid #f1f5f9',
                                }}>
                                    <button
                                        onClick={() => handleEditar(inmueble)}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: '0.4rem', padding: '0.75rem', border: 'none',
                                            background: 'transparent', color: '#2563eb', cursor: 'pointer',
                                            fontSize: '0.85rem', fontWeight: '500',
                                            borderRight: '1px solid #f1f5f9',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Pencil size={15} /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(inmueble.id_inmueble)}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: '0.4rem', padding: '0.75rem', border: 'none',
                                            background: 'transparent', color: '#ef4444', cursor: 'pointer',
                                            fontSize: '0.85rem', fontWeight: '500',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Trash2 size={15} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Nuevo Inmueble */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="card modal-content" style={{ width: '95%', maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{editando ? 'Editar Propiedad' : 'Registrar Nueva Propiedad'}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Completa los datos técnicos del inmueble.</p>
                            </div>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Dirección Exacta</label>
                                    <input 
                                        className="form-control"
                                        name="direccion" 
                                        placeholder="Ej: Calle 10 # 45-20"
                                        value={formData.direccion} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Departamento</label>
                                    <select 
                                        className="form-control"
                                        name="departamento" 
                                        value={formData.departamento} 
                                        onChange={handleChange} 
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {Object.keys(colombiaData).sort().map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Municipio</label>
                                    <select 
                                        className="form-control"
                                        name="municipio" 
                                        value={formData.municipio} 
                                        onChange={handleChange} 
                                        required
                                        disabled={!formData.departamento}
                                    >
                                        <option value="">Seleccione...</option>
                                        {formData.departamento && colombiaData[formData.departamento].sort().map(muni => (
                                            <option key={muni} value={muni}>{muni}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Barrio</label>
                                    <input className="form-control" name="barrio" value={formData.barrio} onChange={handleChange} required />
                                </div>

                                <div>
                                    <label className="form-label">Tipo de Inmueble</label>
                                    <select className="form-control" name="tipo_inmueble" value={formData.tipo_inmueble} onChange={handleChange}>
                                        <option value="Apartamento">Apartamento</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Local">Local</option>
                                        <option value="Oficina">Oficina</option>
                                        <option value="Bodega">Bodega</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Área (m²)</label>
                                    <input className="form-control" type="number" name="area_m2" value={formData.area_m2} onChange={handleChange} required />
                                </div>

                                <div>
                                    <label className="form-label">Estrato</label>
                                    <select className="form-control" name="estrato" value={formData.estrato} onChange={handleChange}>
                                        {[1,2,3,4,5,6].map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Habitaciones</label>
                                    <input className="form-control" type="number" name="habitaciones" min="0" value={formData.habitaciones} onChange={handleChange} />
                                </div>

                                <div>
                                    <label className="form-label">Baños</label>
                                    <input className="form-control" type="number" name="banos" min="0" value={formData.banos} onChange={handleChange} />
                                </div>
                                
                                <div style={{ gridColumn: 'span 2' }}>
                                    <hr style={{ margin: '0.5rem 0', border: '0', borderTop: '1px solid #f1f5f9' }} />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                        Registrar Propiedad
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inmuebles;