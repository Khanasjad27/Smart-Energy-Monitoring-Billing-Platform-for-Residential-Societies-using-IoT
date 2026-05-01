const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const { getAllFlats, createFlat, updateFlat, deleteFlat } = require('./flat.service.js');

router.get('/', authMiddleware, getAllFlats);
router.post('/', authMiddleware, createFlat);
router.put('/:id', authMiddleware, updateFlat);
router.delete('/:id', authMiddleware, deleteFlat);

module.exports = router;