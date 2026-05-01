const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const roleMiddleware = require('../../middleware/role.middleware.js')

const { getAllSocieties, createSociety, updateSociety, deleteSociety } = require('./society.service.js');

router.get('/', authMiddleware, roleMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), getAllSocieties);
router.post('/', authMiddleware, roleMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), createSociety);
router.put('/:id', authMiddleware, roleMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), updateSociety);
router.delete('/:id', authMiddleware, roleMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), deleteSociety);

module.exports = router;