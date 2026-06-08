const { Sequelize, Op } = require('sequelize');
const Pago = require('../models/Pago');
const Contrato = require('../models/Contrato');
const Inmueble = require('../models/Inmueble');
const Abono = require('../models/Abono');

// Obtener todos los pagos (Filtrados por propiedad/perfil)
const obtenerTodos = async (req, res) => {
    try {
        const { rol, id_perfil } = req.usuario;
        
        const filter = {
            include: [{ 
                model: Contrato,
                required: true,
                include: [{
                    model: Inmueble,
                    required: true
                }]
            }]
        };

        if (rol === 'propietario') {
            filter.include[0].include[0].where = { id_propietario: id_perfil };
        } else if (rol === 'inquilino') {
            filter.include[0].where = { id_inquilino: id_perfil };
        }

        const pagos = await Pago.findAll(filter);
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

        const contrato = await Contrato.findOne({
            where: { id_contrato },
            include: [{ model: Inmueble }]
        });

        if (!contrato) return res.status(404).json({ mensaje: 'Contrato no encontrado' });

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

        const contrato = await Contrato.findOne({
            where: { id_contrato },
            include: [{ model: Inmueble, where: { id_propietario: id_perfil } }]
        });

        if (!contrato) return res.status(403).json({ mensaje: 'No tienes permisos sobre este contrato' });

        const nuevoPago = await Pago.create({ ...req.body, saldo_pendiente: monto_total });
        res.status(201).json({ mensaje: 'Pago registrado exitosamente', pago: nuevoPago });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear pago', error: error.message });
    }
};

// Registrar abono - RF-17
const registrarPago = async (req, res) => {
    const { id } = req.params;
    const { id_perfil } = req.usuario;
    const { monto_pagado, tipo_transaccion, observaciones } = req.body;
    const t = await Pago.sequelize.transaction();
    try {
        const pago = await Pago.findByPk(id, { include: [{ model: Contrato, include: [Inmueble] }], transaction: t });
        if (!pago) { await t.rollback(); return res.status(404).json({ mensaje: 'Pago no encontrado' }); }

        if (parseFloat(monto_pagado) <= 0 || parseFloat(monto_pagado) > parseFloat(pago.saldo_pendiente)) {
            await t.rollback(); return res.status(400).json({ mensaje: 'Sobrepago no permitido. Monto inválido o superior al saldo' });
        }

        const esDuenio = pago.Contrato.Inmueble.id_propietario === id_perfil;
        const esInquilino = pago.Contrato.id_inquilino === id_perfil;
        if (!esDuenio && !esInquilino) { await t.rollback(); return res.status(403).json({ mensaje: 'No autorizado' }); }
        
        const nuevoSaldo = parseFloat(pago.saldo_pendiente) - parseFloat(monto_pagado);
        const nuevoAbono = await Abono.create({ id_pago: pago.id_pago, monto: monto_pagado, tipo_transaccion, observaciones, saldo_restante_momento: nuevoSaldo }, { transaction: t });

        // Reglas de transición de estados (RF-17)
        let nuevoEstado = nuevoSaldo === 0 ? 2 : (pago.estado === 3 ? 3 : 4); 
        // 2 = Pagado, 3 = En Mora (se mantiene si ya estaba en mora), 4 = Pago Parcial
        
        await pago.update({ fecha_pago: new Date(), saldo_pendiente: nuevoSaldo, estado: nuevoEstado, tipo_transaccion, observaciones }, { transaction: t });
        
        await t.commit();
        res.json({ mensaje: nuevoSaldo === 0 ? 'Pago completado exitosamente' : 'Abono registrado exitosamente', pago, abono: nuevoAbono });
    } catch (error) { await t.rollback(); res.status(500).json({ mensaje: 'Error', error: error.message }); }
};

// Obtener historial global de abonos
const obtenerHistorialGlobalAbonos = async (req, res) => {
    try {
        const { rol, id_perfil } = req.usuario;
        
        const filter = {
            include: [{
                model: Pago,
                required: true,
                include: [{
                    model: Contrato,
                    required: true,
                    include: [{
                        model: Inmueble,
                        required: true
                    }]
                }]
            }],
            order: [['fecha_abono', 'DESC']]
        };

        if (rol === 'propietario') {
            filter.include[0].include[0].include[0].where = { id_propietario: id_perfil };
        } else if (rol === 'inquilino') {
            filter.include[0].include[0].where = { id_inquilino: id_perfil };
        }

        const abonos = await Abono.findAll(filter);
        res.json(abonos);
    } catch (error) { res.status(500).json({ mensaje: 'Error al obtener historial global', error: error.message }); }
};

// Generar comprobante abono - RF-18
const generarComprobanteAbono = async (req, res) => {
    try {
        const { id_abono } = req.params;
        const { id_perfil } = req.usuario;
        const abono = await Abono.findByPk(id_abono, { include: [{ model: Pago, include: [{ model: Contrato, include: [Inmueble] }] }] });
        if (!abono) return res.status(404).json({ mensaje: 'No encontrado' });

        if (abono.Pago.Contrato.Inmueble.id_propietario !== id_perfil && abono.Pago.Contrato.id_inquilino !== id_perfil) {
            return res.status(403).json({ mensaje: 'No autorizado' });
        }

        // Identificador de tipo de pago (RF-18)
        const tipoComprobante = parseFloat(abono.saldo_restante_momento) === 0 ? 'Pago Total' : 'Abono Parcial';

        res.json({
            titulo: 'COMPROBANTE DE PAGO',
            tipo_comprobante: tipoComprobante,
            id_transaccion: abono.id_abono,
            fecha_hora: abono.fecha_abono,
            monto_pagado: abono.monto,
            saldo_restante: abono.saldo_restante_momento,
            inmueble: abono.Pago.Contrato.Inmueble.direccion,
            concepto: 'Canon de arrendamiento'
        });
    } catch (error) { res.status(500).json({ mensaje: 'Error al generar comprobante', error: error.message }); }
};

// Restantes métodos
const obtenerPendientes = async (req, res) => {
    try {
        const { rol, id_perfil } = req.usuario;
        
        const filter = {
            where: { estado: { [Op.in]: [1, 4] } },
            include: [{ 
                model: Contrato,
                required: true,
                include: [{
                    model: Inmueble,
                    required: true
                }]
            }],
            order: [['mes_correspondiente', 'ASC']]
        };

        if (rol === 'propietario') {
            filter.include[0].include[0].where = { id_propietario: id_perfil };
        } else if (rol === 'inquilino') {
            filter.include[0].where = { id_inquilino: id_perfil };
        }

        const pagos = await Pago.findAll(filter);
        res.json(pagos);
    } catch (error) { res.status(500).json({ mensaje: 'Error al obtener pagos pendientes', error: error.message }); }
};

const verificarMora = async (req, res) => {
    try {
        const { id_perfil } = req.usuario;
        const hoy = new Date();
        const pagosVencidos = await Pago.findAll({
            where: { estado: { [Op.in]: [1, 4] }, mes_correspondiente: { [Op.lt]: hoy } },
            include: [{ model: Contrato, required: true, include: [{ model: Inmueble, required: true, where: { id_propietario: id_perfil } }] }]
        });
        for (const pago of pagosVencidos) { await pago.update({ estado: 3 }); }
        res.json({ mensaje: 'Mora verificada', pagos_actualizados: pagosVencidos.length });
    } catch (error) { res.status(500).json({ mensaje: 'Error al verificar mora', error: error.message }); }
};

const generarRecibo = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_perfil } = req.usuario;
        const pago = await Pago.findByPk(id, { include: [{ model: Contrato, include: [Inmueble] }] });
        if (!pago) return res.status(404).json({ mensaje: 'No encontrado' });
        if (pago.Contrato.Inmueble.id_propietario !== id_perfil && pago.Contrato.id_inquilino !== id_perfil) return res.status(403).json({ mensaje: 'No autorizado' });
        res.json({ numero_recibo: `REC-${pago.id_pago}`, cliente: pago.Contrato.id_inquilino, monto_total: pago.monto_total, saldo_pendiente: pago.saldo_pendiente, estado: pago.estado, inmueble: pago.Contrato.Inmueble.direccion });
    } catch (error) { res.status(500).json({ mensaje: 'Error', error: error.message }); }
};

const obtenerAbonos = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_perfil } = req.usuario;
        const pago = await Pago.findByPk(id, { include: [{ model: Contrato, include: [Inmueble] }] });
        if (!pago) return res.status(404).json({ mensaje: 'No encontrado' });
        if (pago.Contrato.Inmueble.id_propietario !== id_perfil && pago.Contrato.id_inquilino !== id_perfil) return res.status(403).json({ mensaje: 'No autorizado' });
        const abonos = await Abono.findAll({ where: { id_pago: id }, order: [['fecha_abono', 'DESC']] });
        res.json(abonos);
    } catch (error) { res.status(500).json({ mensaje: 'Error al obtener abonos', error: error.message }); }
};

module.exports = { 
    obtenerTodos, obtenerPorContrato, crear, registrarPago, obtenerPendientes,
    verificarMora, generarRecibo, obtenerAbonos, generarComprobanteAbono, obtenerHistorialGlobalAbonos
};