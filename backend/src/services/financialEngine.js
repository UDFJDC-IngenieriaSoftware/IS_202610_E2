const cron = require('node-cron');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Contrato, Inmueble, Pago, Inquilino, Propietario, Usuario } = require('../models');
const { enviarCorreo } = require('../config/mailer');

/**
 * MOTOR FINANCIERO - Arriendos360
 * RF-14, RF-15, RF-16
 */

const iniciarMotorFinanciero = () => {
    // Ejecutar cada día a la medianoche (00:01)
    cron.schedule('1 0 * * *', async () => {
        console.log('⏳ Iniciando proceso diario del Motor Financiero...');
        await procesarContratos();
        await procesarPagos();
    });
    console.log('🚀 Motor Financiero programado (Ejecución diaria)');
};

/**
 * RF-14: Generación Automática de Recibos
 * Regla: 2 días antes de la fecha de corte (aniversario)
 */
const procesarContratos = async () => {
    try {
        const hoy = new Date();
        const pasadoManana = new Date();
        pasadoManana.setDate(hoy.getDate() + 2);
        
        const diaCorte = pasadoManana.getDate();
        
        // Buscar contratos activos
        const contratos = await Contrato.findAll({
            where: {
                estado: 1 // Activo
            },
            include: [
                { 
                    model: Inmueble, 
                    include: [{ model: Propietario, include: [Usuario] }] 
                },
                { 
                    model: Inquilino, 
                    include: [Usuario] 
                }
            ]
        });

        for (const contrato of contratos) {
            const fechaInicio = new Date(contrato.fecha_inicio);
            if (fechaInicio.getDate() === diaCorte) {
                // Verificar si ya se generó el recibo para este mes/año
                const mesActual = pasadoManana.getMonth() + 1; // EXTRACT retorna 1-12
                const anioActual = pasadoManana.getFullYear();
                
                const yaExiste = await Pago.findOne({
                    where: {
                        id_contrato: contrato.id_contrato,
                        [Op.and]: [
                            sequelize.where(sequelize.fn('date_part', 'month', sequelize.col('mes_correspondiente')), mesActual),
                            sequelize.where(sequelize.fn('date_part', 'year', sequelize.col('mes_correspondiente')), anioActual)
                        ]
                    }
                });

                if (!yaExiste) {
                    const nuevoPago = await Pago.create({
                        id_contrato: contrato.id_contrato,
                        monto_total: contrato.valor_mensual,
                        saldo_pendiente: contrato.valor_mensual,
                        mes_correspondiente: new Date(anioActual, mesActual, diaCorte),
                        estado: 1 // Pendiente
                    });

                    console.log(`✅ Recibo generado automáticamente para contrato ${contrato.id_contrato}`);

                    // RF-15: Notificación de Creación (Inquilino)
                    if (contrato.Inquilino && contrato.Inquilino.Usuario) {
                        await enviarCorreo(
                            contrato.Inquilino.Usuario.correo,
                            '🏠 Nuevo recibo de arriendo generado',
                            `Hola ${contrato.Inquilino.Usuario.nombres}, se ha generado tu recibo de arriendo para el corte del ${diaCorte}. Valor: $${contrato.valor_mensual}.`
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en procesarContratos:', error);
    }
};

/**
 * RF-16: Control de Días de Gracia y Cálculo de Mora
 * RF-15: Alertas de Vencimiento y Vencido
 */
const procesarPagos = async () => {
    try {
        const hoy = new Date();
        
        const pagosPendientes = await Pago.findAll({
            where: { estado: { [Op.in]: [1, 3] } }, // Pendiente o En Mora
            include: [
                { 
                    model: Contrato, 
                    include: [
                        { model: Inmueble, include: [{ model: Propietario, include: [Usuario] }] },
                        { model: Inquilino, include: [Usuario] }
                    ] 
                }
            ]
        });

        for (const pago of pagosPendientes) {
            if (!pago.Contrato) continue;
            
            const fechaCorte = new Date(pago.mes_correspondiente);
            const diffTiempo = hoy - fechaCorte;
            const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

            // RF-15: Vencimiento Próximo (1 día antes de que expire el tiempo de gracia)
            if (diffDias === 4 && pago.estado === 1) {
                if (pago.Contrato.Inquilino) {
                    await enviarCorreo(
                        pago.Contrato.Inquilino.Usuario.correo,
                        '⚠️ Aviso: Tu pago vence pronto',
                        `Recuerda que tienes hasta mañana para realizar el pago de tu arriendo sin generar mora.`
                    );
                }
                if (pago.Contrato.Inmueble && pago.Contrato.Inmueble.Propietario) {
                    await enviarCorreo(
                        pago.Contrato.Inmueble.Propietario.Usuario.correo,
                        '📢 Recordatorio de pago próximo a vencer',
                        `El pago del inmueble ${pago.Contrato.Inmueble.direccion} vence mañana.`
                    );
                }
            }

            // RF-16: Cambio a Mora (Al inicio del sexto día)
            if (diffDias >= 6 && pago.estado === 1) {
                await pago.update({ estado: 3 }); // 3 = Vencido/En Mora
                console.log(`🚫 Pago ${pago.id_pago} marcado como EN MORA`);

                // RF-15: Vencido (Al inquilino y propietario)
                if (pago.Contrato.Inquilino) {
                    await enviarCorreo(
                        pago.Contrato.Inquilino.Usuario.correo,
                        '🚨 Pago Vencido - Mora Generada',
                        `Tu pago de arriendo ha superado el periodo de gracia. Por favor regulariza tu situación.`
                    );
                }
                if (pago.Contrato.Inmueble && pago.Contrato.Inmueble.Propietario) {
                    await enviarCorreo(
                        pago.Contrato.Inmueble.Propietario.Usuario.correo,
                        '🔴 Notificación de Inquilino en Mora',
                        `El inquilino del inmueble ${pago.Contrato.Inmueble.direccion} ha entrado en mora.`
                    );
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en procesarPagos:', error);
    }
};

module.exports = { iniciarMotorFinanciero, procesarContratos, procesarPagos };
