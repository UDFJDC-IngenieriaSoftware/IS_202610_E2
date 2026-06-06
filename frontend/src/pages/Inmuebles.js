import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Home as HomeIcon, X } from 'lucide-react';

const Inmuebles = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        direccion: '',
        municipio: '',
        barrio: '',
        tipo_inmueble: 'Apartamento',
        estrato: 3,
        habitaciones: 2,
        banos: 1,
        precio: '',
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inmuebles', formData);
            setShowModal(false);
            setFormData({
                direccion: '', municipio: '', barrio: '', tipo_inmueble: 'Apartamento',
                estrato: 3, habitaciones: 2, banos: 1, precio: '', estado_ocupacion: 'disponible'
            });
            fetchInmuebles();
        } catch (error) {
            alert('Error al crear el inmueble: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    if (loading) return <div>Cargando inmuebles...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Mis Inmuebles</h3>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Nuevo Inmueble
                </button>
            </div>

            <div className="grid">
                {inmuebles.map((inmueble) => (
                    <div key={inmueble.id_inmueble} className="card">
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                            <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                <HomeIcon size={24} color="#2563eb" />
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{inmueble.direccion}</h4>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{inmueble.municipio}, {inmueble.barrio}</p>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <span className={`badge ${inmueble.estado_ocupacion === 'disponible' ? 'badge-success' : 'badge-pending'}`}>
                                        {inmueble.estado_ocupacion}
                                    </span>
                                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                        Estrato {inmueble.estrato}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Nuevo Inmueble */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4>Registrar Nuevo Inmueble</h4>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label>Dirección</label>
                                    <input name="direccion" value={formData.direccion} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Municipio</label>
                                    <input name="municipio" value={formData.municipio} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Barrio</label>
                                    <input name="barrio" value={formData.barrio} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Tipo</label>
                                    <select name="tipo_inmueble" value={formData.tipo_inmueble} onChange={handleChange}>
                                        <option value="Apartamento">Apartamento</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Local">Local</option>
                                        <option value="Finca">Finca</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Estrato</label>
                                    <input type="number" name="estrato" value={formData.estrato} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Habitaciones</label>
                                    <input type="number" name="habitaciones" min="0" value={formData.habitaciones} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Baños</label>
                                    <input type="number" name="banos" min="0" value={formData.banos} onChange={handleChange} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label>Precio Mensual Sugerido ($)</label>
                                    <input type="number" name="precio" min="0" value={formData.precio} onChange={handleChange} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                                Guardar Inmueble
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inmuebles;