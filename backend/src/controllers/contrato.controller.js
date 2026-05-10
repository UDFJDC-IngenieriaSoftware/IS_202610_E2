const Contrato = require('../models/Contrato');
const Inmueble = require('../models/Inmueble');
const Inquilino = require('../models/Inquilino');

// Obtener todos los contratos
const obtenerTodos = async (req, res) => {
    try {
        const contratos = await Contrato.findAll({
            include: [
                { model: Inmueble },
                { model: Inquilino }
            ]
        });
        res.json(contratos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener contratos', error: error.message });
    }
};

// Obtener contrato por ID
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const contrato = await Contrato.findByPk(id, {
            include: [
                { model: Inmueble },
                { model: Inquilino }
            ]
        });
        
        if (!contrato) {
            return res.status(404).json({ mensaje: 'Contrato no encontrado' });
        }
        
        res.json(contrato);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener contrato', error: error.message });
    }
};

// Crear contrato
const crear = async (req, res) => {
    try {
        const nuevoContrato = await Contrato.create(req.body);
        
        // Actualizar estado del inmueble a "arrendado"
        await Inmueble.update(
            { estado_ocupacion: 'arrendado' },
            { where: { id_inmueble: req.body.id_inmueble } }
        );
        
        res.status(201).json({ 
            mensaje: 'Contrato creado exitosamente', 
            contrato: nuevoContrato 
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear contrato', error: error.message });
    }
};

// Actualizar contrato
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const contrato = await Contrato.findByPk(id);
        
        if (!contrato) {
            return res.status(404).json({ mensaje: 'Contrato no encontrado' });
        }
        
        await contrato.update(req.body);
        res.json({ mensaje: 'Contrato actualizado', contrato });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar contrato', error: error.message });
    }
};

// Finalizar contrato
const finalizar = async (req, res) => {
    try {
        const { id } = req.params;
        const contrato = await Contrato.findByPk(id);
        
        if (!contrato) {
            return res.status(404).json({ mensaje: 'Contrato no encontrado' });
        }
        
        // Cambiar estado a finalizado (2)
        await contrato.update({ estado: 2 });
        
        // Liberar inmueble
        await Inmueble.update(
            { estado_ocupacion: 'disponible' },
            { where: { id_inmueble: contrato.id_inmueble } }
        );
        
        res.json({ mensaje: 'Contrato finalizado', contrato });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al finalizar contrato', error: error.message });
    }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, finalizar };