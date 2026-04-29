const express = require('express');
const router = express.Router();
const { getAllBuilders, createBuilder, updateBuilder, deleteBuilder } = require('./builder.service.js');

router.get('/', getAllBuilders);
router.post('/', createBuilder);
router.put('/:id', updateBuilder);
router.delete('/:id', deleteBuilder);

module.exports = router;
