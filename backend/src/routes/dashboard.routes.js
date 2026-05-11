const express = require('express');
const router = express.Router();
const { 
    obtenerIngresos, 
    obtenerMora, 
    obtenerContratosActivos, 
    obtenerResumen 
} = require('../controllers/dashboard.controller');

// GET /api/dashboard/ingresos
router.get('/ingresos', obtenerIngresos);

// GET /api/dashboard/mora
router.get('/mora', obtenerMora);

// GET /api/dashboard/contratos-activos
router.get('/contratos-activos', obtenerContratosActivos);

// GET /api/dashboard/resumen
router.get('/resumen', obtenerResumen);

module.exports = router;