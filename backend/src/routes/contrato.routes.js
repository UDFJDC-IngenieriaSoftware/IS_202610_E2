const express = require('express');
const router = express.Router();
const { 
    obtenerTodos, 
    obtenerPorId, 
    crear, 
    actualizar, 
    finalizar 
} = require('../controllers/contrato.controller');

// GET /api/contratos
router.get('/', obtenerTodos);

// GET /api/contratos/:id
router.get('/:id', obtenerPorId);

// POST /api/contratos
router.post('/', crear);

// PUT /api/contratos/:id
router.put('/:id', actualizar);

// PUT /api/contratos/:id/finalizar
router.put('/:id/finalizar', finalizar);

module.exports = router;