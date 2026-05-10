const express = require('express');
const router = express.Router();
const { 
    obtenerTodos, 
    obtenerPorId, 
    crear, 
    actualizar, 
    eliminar 
} = require('../controllers/inmueble.controller');

// GET /api/inmuebles
router.get('/', obtenerTodos);

// GET /api/inmuebles/:id
router.get('/:id', obtenerPorId);

// POST /api/inmuebles
router.post('/', crear);

// PUT /api/inmuebles/:id
router.put('/:id', actualizar);

// DELETE /api/inmuebles/:id
router.delete('/:id', eliminar);

module.exports = router;