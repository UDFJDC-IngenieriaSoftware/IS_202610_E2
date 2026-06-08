import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Home as HomeIcon, X, MapPin } from 'lucide-react';
import { colombiaData } from '../data/colombia';

const Inmuebles = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        direccion: '',
        departamento: '',
        municipio: '',
        barrio: '',
        tipo_inmueble: 'Apartamento',
        area_m2: '',
        estrato: 3,
        habitaciones: 2,
        banos: 1,
        deposito: 0,
        parqueaderos: 0,
        precio: '', // Este campo mapea a valor_mensual sugerido o similar si existe
        estado_ocupacion: 'disponible'
    });

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
            // Nota: id_propietario ya no se envía, el backend lo toma del token
            await api.post('/inmuebles', formData);
            setShowModal(false);
            resetForm();
            fetchInmuebles();
        } catch (error) {
            alert('Error al crear el inmueble: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            direccion: '', departamento: '', municipio: '', barrio: '', tipo_inmueble: 'Apartamento',
            area_m2: '', estrato: 3, habitaciones: 2, banos: 1, deposito: 0, parqueaderos: 0,
            precio: '', estado_ocupacion: 'disponible'
        });
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
                    onClick={() => setShowModal(true)}
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
                <div className="grid">
                    {inmuebles.map((inmueble) => (
                        <div key={inmueble.id_inmueble} className="card property-card">
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'start' }}>
                                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.75rem' }}>
                                    <HomeIcon size={28} color="#2563eb" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                            {inmueble.direccion}
                                        </h4>
                                        <span className={`badge ${inmueble.estado_ocupacion === 'disponible' ? 'badge-success' : 'badge-pending'}`}>
                                            {inmueble.estado_ocupacion}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} /> {inmueble.municipio}, {inmueble.departamento}
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>{inmueble.barrio}</p>
                                    
                                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Hab.</span>
                                            <span style={{ fontWeight: '600' }}>{inmueble.habitaciones}</span>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Baños</span>
                                            <span style={{ fontWeight: '600' }}>{inmueble.banos}</span>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Área</span>
                                            <span style={{ fontWeight: '600' }}>{inmueble.area_m2}m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Nuevo Inmueble */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="card modal-content" style={{ width: '95%', maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Registrar Nueva Propiedad</h3>
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