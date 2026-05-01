const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const roleMiddleware = require('../../middleware/role.middleware.js');
const { getAllBuilders, createBuilder, updateBuilder, deleteBuilder } = require('./builder.service.js');

router.get('/', authMiddleware, roleMiddleware("BUILDER_ADMIN"), getAllBuilders);
router.post('/', authMiddleware, roleMiddleware("BUILDER_ADMIN"), createBuilder);
router.put('/:id', authMiddleware, roleMiddleware("BUILDER_ADMIN"), updateBuilder);
router.delete('/:id', authMiddleware, roleMiddleware("BUILDER_ADMIN"), deleteBuilder);

module.exports = router;
