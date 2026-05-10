const Pago = require('../models/Pago');
const Contrato = require('../models/Contrato');

// Obtener todos los pagos
const obtenerTodos = async (req, res) => {
    try {
        const pagos = await Pago.findAll({
            include: [{ model: Contrato }]
        });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pagos', error: error.message });
    }
};

// Obtener pagos por contrato
const obtenerPorContrato = async (req, res) => {
    try {
        const { id_contrato } = req.params;
        const pagos = await Pago.findAll({
            where: { id_contrato },
            order: [['mes_correspondiente', 'ASC']]
        });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pagos', error: error.message });
    }
};

// Crear pago
const crear = async (req, res) => {
    try {
        const nuevoPago = await Pago.create(req.body);
        res.status(201).json({ 
            mensaje: 'Pago registrado exitosamente', 
            pago: nuevoPago 
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear pago', error: error.message });
    }
};

// Registrar pago (marcar como pagado)
const registrarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto_pagado, tipo_transaccion, observaciones } = req.body;
        
        const pago = await Pago.findByPk(id);
        
        if (!pago) {
            return res.status(404).json({ mensaje: 'Pago no encontrado' });
        }
        
        const nuevoSaldo = pago.saldo_pendiente - monto_pagado;
        
        await pago.update({
            fecha_pago: new Date(),
            saldo_pendiente: nuevoSaldo,
            estado: nuevoSaldo <= 0 ? 2 : 1, // 2 = Pagado, 1 = Pendiente
            tipo_transaccion,
            observaciones
        });
        
        res.json({ mensaje: 'Pago registrado', pago });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar pago', error: error.message });
    }
};

// Obtener pagos pendientes
const obtenerPendientes = async (req, res) => {
    try {
        const pagos = await Pago.findAll({
            where: { estado: 1 }, // 1 = Pendiente
            include: [{ model: Contrato }],
            order: [['mes_correspondiente', 'ASC']]
        });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pagos pendientes', error: error.message });
    }
};

module.exports = { obtenerTodos, obtenerPorContrato, crear, registrarPago, obtenerPendientes };