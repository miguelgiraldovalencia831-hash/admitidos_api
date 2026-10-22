const express = require('express');
const router = express.Router();
const controller = require('./facultades.controller');

router.get('/', controller.obtenerTodas);

module.exports = router;
