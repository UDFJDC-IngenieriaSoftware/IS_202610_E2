const express = require('express');
const router = express.Router();
const { 
    obtenerTodos, 
    obtenerPorId, 
    crear, 
    actualizar, 
    finalizar 
} = require('../controllers/contrato.controller');
const { verificarToken, esPropietario } = require('../middlewares/auth.middleware');

// Todas las rutas de contratos requieren autenticación
router.use(verificarToken);

// GET /api/contratos
router.get('/', obtenerTodos);

// GET /api/contratos/:id
router.get('/:id', obtenerPorId);

// Rutas exclusivas para propietarios
router.post('/', esPropietario, crear);
router.put('/:id', esPropietario, actualizar);
router.put('/:id/finalizar', esPropietario, finalizar);

module.exports = router;