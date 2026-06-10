const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const { Usuario, Propietario, Inquilino, Inmueble, Contrato, Pago, Abono } = require('./src/models');

const seedHistory = async () => {
    try {
        await sequelize.authenticate();
        console.log('⏳ Conectado a Neon DB. Iniciando generación de historial...');

        const hash = await bcrypt.hash('password123', 10);

        // 1. EL PROPIETARIO
        const [uProp] = await Usuario.findOrCreate({
            where: { correo: 'propietario@test.com' },
            defaults: { hash_contrasena: hash, rol: 'propietario', nombres: 'Juan', apellidos: 'Pérez', telefono: '3001112233' }
        });
        await Propietario.findOrCreate({ where: { id_propietario: '123456789' }, defaults: { id_usuario: uProp.id_usuario } });

        // 2. TRES INQUILINOS
        const tenants = [];
        for (let i = 1; i <= 3; i++) {
            const [uInq] = await Usuario.findOrCreate({
                where: { correo: `inquilino${i}@test.com` },
                defaults: { hash_contrasena: hash, rol: 'inquilino', nombres: `Inquilino ${i}`, apellidos: 'Test', telefono: `310000000${i}` }
            });
            const [inq] = await Inquilino.findOrCreate({ where: { id_inquilino: `INQ00${i}` }, defaults: { id_usuario: uInq.id_usuario } });
            tenants.push(inq);
        }

        // 3. TRES INMUEBLES (Todos arrendados)
        const addresses = [
            { dir: 'Calle 100 # 15-20', city: 'Bogotá D.C.', dept: 'Bogotá D.C.', val: 2500000 },
            { dir: 'Transversal 5 # 45-10', city: 'Medellín', dept: 'Antioquia', val: 1800000 },
            { dir: 'Carrera 15 # 10-05', city: 'Cali', dept: 'Valle del Cauca', val: 3200000 }
        ];

        for (let i = 0; i < 3; i++) {
            const inm = await Inmueble.create({
                direccion: addresses[i].dir, municipio: addresses[i].city, departamento: addresses[i].dept,
                barrio: 'Zona Residencial', tipo_inmueble: 'Apartamento', area_m2: 80, estrato: 4,
                id_propietario: '123456789', estado_ocupacion: 'arrendado'
            });

            // 4. UN CONTRATO POR INMUEBLE (Iniciado hace 6 meses)
            const fechaInicio = new Date();
            fechaInicio.setMonth(fechaInicio.getMonth() - 6);
            fechaInicio.setDate(15); // Día de corte fijo para el ejemplo

            const con = await Contrato.create({
                id_inmueble: inm.id_inmueble, id_inquilino: tenants[i].id_inquilino,
                fecha_inicio: fechaInicio, fecha_fin: new Date(2025, 11, 31),
                valor_mensual: addresses[i].val, estado: 1
            });

            // 5. SEIS MESES DE PAGOS POR CONTRATO
            for (let m = 0; m < 6; m++) {
                const fechaMensualidad = new Date(fechaInicio);
                fechaMensualidad.setMonth(fechaMensualidad.getMonth() + m);
                
                let estado = 2; // Pagado por defecto
                let saldo = 0;
                
                // Simular variaciones:
                // El último mes (m=5) lo dejamos en MORA
                if (m === 5) {
                    estado = 3;
                    saldo = addresses[i].val;
                } 
                // El penúltimo mes (m=4) lo dejamos como PAGO PARCIAL
                else if (m === 4) {
                    estado = 4;
                    saldo = addresses[i].val * 0.3; // Debe el 30%
                }

                const pago = await Pago.create({
                    id_contrato: con.id_contrato,
                    monto_total: addresses[i].val,
                    saldo_pendiente: saldo,
                    mes_correspondiente: fechaMensualidad,
                    estado: estado
                });

                // Crear los registros de transacción (Abonos) correspondientes
                if (estado === 2) {
                    await Abono.create({
                        id_pago: pago.id_pago, monto: addresses[i].val,
                        tipo_transaccion: 'Transferencia', saldo_restante_momento: 0,
                        fecha_abono: fechaMensualidad
                    });
                } else if (estado === 4) {
                    await Abono.create({
                        id_pago: pago.id_pago, monto: addresses[i].val * 0.7,
                        tipo_transaccion: 'Efectivo', saldo_restante_momento: saldo,
                        fecha_abono: fechaMensualidad
                    });
                }
            }
        }

        console.log('✅ Historial realista generado e insertado en Neon DB.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al generar historial:', error);
        process.exit(1);
    }
};

seedHistory();