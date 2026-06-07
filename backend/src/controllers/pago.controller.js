const { Sequelize } = require('sequelize');
const Pago = require('../models/Pago');
const Contrato = require('../models/Contrato');
const Inmueble = require('../models/Inmueble');

// Obtener todos los pagos
const obtenerTodos = async (req, res) => {
    try {
        const { rol, id_perfil } = req.usuario;
        let whereContrato = {};
        let whereInmueble = {};

        if (rol === 'propietario') {
            whereInmueble.id_propietario = id_perfil;
        } else if (rol === 'inquilino') {
            whereContrato.id_inquilino = id_perfil;
        }

        const pagos = await Pago.findAll({
            include: [{ 
                model: Contrato,
                where: Object.keys(whereContrato).length > 0 ? whereContrato : undefined,
                include: [{
                    model: Inmueble,
                    where: Object.keys(whereInmueble).length > 0 ? whereInmueble : undefined
                }]
            }]
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
        const { id_perfil } = req.usuario;

        // Verificar que el usuario tenga acceso al contrato
        const contrato = await Contrato.findOne({
            where: { id_contrato },
            include: [{ model: Inmueble }]
        });

        if (!contrato) {
            return res.status(404).json({ mensaje: 'Contrato no encontrado' });
        }

        const esDuenio = contrato.Inmueble.id_propietario === id_perfil;
        const esInquilino = contrato.id_inquilino === id_perfil;

        if (!esDuenio && !esInquilino) {
            return res.status(403).json({ mensaje: 'No tienes permisos para ver los pagos de este contrato' });
        }

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
        const { id_perfil } = req.usuario;
        const { id_contrato, monto_total } = req.body;

        // Verificar que el contrato pertenece a un inmueble del propietario
        const contrato = await Contrato.findOne({
            where: { id_contrato },
            include: [{
                model: Inmueble,
                where: { id_propietario: id_perfil }
            }]
        });

        if (!contrato) {
            return res.status(403).json({ mensaje: 'No tienes permisos sobre este contrato' });
        }

        const nuevoPago = await Pago.create({
            ...req.body,
            saldo_pendiente: monto_total
        });
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
        const { id_perfil } = req.usuario;
        const { monto_pagado, tipo_transaccion, observaciones } = req.body;
        
        const pago = await Pago.findByPk(id, {
            include: [{
                model: Contrato,
                include: [Inmueble]
            }]
        });
        
        if (!pago) {
            return res.status(404).json({ mensaje: 'Pago no encontrado' });
        }

        // Verificar permisos: Propietario del inmueble o el Inquilino del contrato
        const esDuenio = pago.Contrato.Inmueble.id_propietario === id_perfil;
        const esInquilino = pago.Contrato.id_inquilino === id_perfil;

        if (!esDuenio && !esInquilino) {
            return res.status(403).json({ mensaje: 'No tienes permisos para registrar este pago' });
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
        const { rol, id_perfil } = req.usuario;
        let whereContrato = {};
        let whereInmueble = {};

        if (rol === 'propietario') {
            whereInmueble.id_propietario = id_perfil;
        } else if (rol === 'inquilino') {
            whereContrato.id_inquilino = id_perfil;
        }

        const pagos = await Pago.findAll({
            where: { estado: 1 }, // 1 = Pendiente
            include: [{ 
                model: Contrato,
                where: Object.keys(whereContrato).length > 0 ? whereContrato : undefined,
                include: [{
                    model: Inmueble,
                    where: Object.keys(whereInmueble).length > 0 ? whereInmueble : undefined
                }]
            }],
            order: [['mes_correspondiente', 'ASC']]
        });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pagos pendientes', error: error.message });
    }
};

// Motor de cálculo de mora: Verifica y actualiza pagos vencidos
const verificarMora = async (req, res) => {
    try {
        const { id_perfil } = req.usuario;
        const hoy = new Date();
        
        // Buscar pagos pendientes cuya fecha correspondiente ya pasó Y pertenecen al propietario
        const pagosVencidos = await Pago.findAll({
            where: {
                estado: 1, // Pendiente
                mes_correspondiente: { [Sequelize.Op.lt]: hoy }
            },
            include: [{
                model: Contrato,
                include: [{
                    model: Inmueble,
                    where: { id_propietario: id_perfil }
                }]
            }]
        });

        let actualizados = 0;
        for (const pago of pagosVencidos) {
            await pago.update({ estado: 3 }); // 3 = Vencido/En Mora
            actualizados++;
        }

        res.json({ 
            mensaje: 'Proceso de verificación de mora completado', 
            pagos_actualizados: actualizados 
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al verificar mora', error: error.message });
    }
};

// Generar recibo de pago (simulado para este MVP)
const generarRecibo = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_perfil } = req.usuario;

        const pago = await Pago.findByPk(id, {
            include: [{ model: Contrato, include: [Inmueble] }]
        });

        if (!pago) {
            return res.status(404).json({ mensaje: 'Pago no encontrado' });
        }

        // Validar permisos
        const esDuenio = pago.Contrato.Inmueble.id_propietario === id_perfil;
        const esInquilino = pago.Contrato.id_inquilino === id_perfil;

        if (!esDuenio && !esInquilino) {
            return res.status(403).json({ mensaje: 'No tienes permisos para ver este recibo' });
        }

        // Aquí se podría generar un PDF real, por ahora retornamos los datos formateados para el recibo
        const recibo = {
            numero_recibo: `REC-${pago.id_pago}-${Date.now()}`,
            fecha_emision: new Date(),
            cliente: pago.Contrato.id_inquilino,
            concepto: `Arriendo mes ${pago.mes_correspondiente}`,
            monto: pago.monto_total,
            estado: pago.estado === 2 ? 'PAGADO' : 'PENDIENTE',
            inmueble: pago.Contrato.Inmueble.direccion
        };

        res.json(recibo);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al generar recibo', error: error.message });
    }
};

module.exports = { 
    obtenerTodos, 
    obtenerPorContrato, 
    crear, 
    registrarPago, 
    obtenerPendientes,
    verificarMora,
    generarRecibo
};