const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const roleMiddleware = require('../../middleware/role.middleware.js');

const { getFlatSummary, getMonthlyUsage, getDailyUsage, getTodayUsage, getUsageBreakdown } = require('./dashboard.service.js');

router.get('/monthly/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getMonthlyUsage);
router.get('/daily/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getDailyUsage);
router.get('/today/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getTodayUsage);
router.get('/breakdown/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getUsageBreakdown);
router.get('/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getFlatSummary);


module.exports = router;

