const express = require('express');
const router = express.Router();
const { 
    obtenerTodos, 
    obtenerPorContrato, 
    crear, 
    registrarPago, 
    obtenerPendientes 
} = require('../controllers/pago.controller');
const { verificarToken, esPropietario } = require('../middlewares/auth.middleware');

// Todas las rutas de pagos requieren autenticación
router.use(verificarToken);

// GET /api/pagos
router.get('/', obtenerTodos);

// GET /api/pagos/pendientes
router.get('/pendientes', obtenerPendientes);

// GET /api/pagos/contrato/:id_contrato
router.get('/contrato/:id_contrato', obtenerPorContrato);

// POST /api/pagos
router.post('/', esPropietario, crear);

// PUT /api/pagos/:id/pagar
router.put('/:id/pagar', registrarPago);

module.exports = router;