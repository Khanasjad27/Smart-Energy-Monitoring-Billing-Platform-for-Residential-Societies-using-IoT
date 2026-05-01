const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const roleMiddleware = require('../../middleware/role.middleware.js');

const { getFlatSummary,getMonthlyUsage } = require('./dashboard.service.js');

router.get('/monthly/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getMonthlyUsage);
router.get('/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getFlatSummary);


module.exports = router;

