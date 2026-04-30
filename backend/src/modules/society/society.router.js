const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');

const { getAllSocieties, createSociety, updateSociety, deleteSociety } = require('./society.service.js');

router.get('/', authMiddleware, getAllSocieties);
router.post('/', authMiddleware, createSociety);
router.put('/:id', authMiddleware, updateSociety);
router.delete('/:id', authMiddleware, deleteSociety);

module.exports = router;