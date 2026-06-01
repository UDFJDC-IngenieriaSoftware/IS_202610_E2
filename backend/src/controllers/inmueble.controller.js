const Inmueble = require('../models/Inmueble');
const Propietario = require('../models/Propietario');

// Obtener todos los inmuebles
const obtenerTodos = async (req, res) => {
    try {
        const inmuebles = await Inmueble.findAll({
            include: [{ model: Propietario }]
        });
        res.json(inmuebles);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener inmuebles', error: error.message });
    }
};

// Obtener un inmueble por ID
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const inmueble = await Inmueble.findByPk(id, {
            include: [{ model: Propietario }]
        });
        
        if (!inmueble) {
            return res.status(404).json({ mensaje: 'Inmueble no encontrado' });
        }
        
        res.json(inmueble);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener inmueble', error: error.message });
    }
};

// Crear inmueble
const crear = async (req, res) => {
    try {
        const nuevoInmueble = await Inmueble.create(req.body);
        res.status(201).json({ 
            mensaje: 'Inmueble creado exitosamente', 
            inmueble: nuevoInmueble 
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear inmueble', error: error.message });
    }
};

// Actualizar inmueble
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const inmueble = await Inmueble.findByPk(id);
        
        if (!inmueble) {
            return res.status(404).json({ mensaje: 'Inmueble no encontrado' });
        }
        
        await inmueble.update(req.body);
        res.json({ mensaje: 'Inmueble actualizado', inmueble });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar inmueble', error: error.message });
    }
};

// Eliminar inmueble
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const inmueble = await Inmueble.findByPk(id);
        
        if (!inmueble) {
            return res.status(404).json({ mensaje: 'Inmueble no encontrado' });
        }
        
        await inmueble.destroy();
        res.json({ mensaje: 'Inmueble eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar inmueble', error: error.message });
    }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };