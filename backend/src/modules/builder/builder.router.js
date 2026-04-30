const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const { getAllBuilders, createBuilder, updateBuilder, deleteBuilder } = require('./builder.service.js');

router.get('/', authMiddleware, getAllBuilders);
router.post('/', authMiddleware, createBuilder);
router.put('/:id', authMiddleware, updateBuilder);
router.delete('/:id', authMiddleware, deleteBuilder);

module.exports = router;
