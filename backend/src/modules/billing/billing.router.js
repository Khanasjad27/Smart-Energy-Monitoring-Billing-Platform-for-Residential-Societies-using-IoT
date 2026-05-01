const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const roleMiddleware = require('../../middleware/role.middleware.js');

const { generateBillByFlat,  getBillingHistory} = require('./billing.service.js');


router.get('/history/:flatId', authMiddleware, roleMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getBillingHistory);
router.get('/:flatId', authMiddleware, roleMiddleware('SOCIETY_ADMIN', 'USER', 'BUILDER_ADMIN'), generateBillByFlat);

module.exports = router;