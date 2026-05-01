const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware.js");
const roleMiddleware = require("../../middleware/role.middleware.js");

const { createMeterReading, getMeterReadingsByFlat } = require("./reading.service.js");

router.post("/", authMiddleware, roleMiddleware("USER"), createMeterReading);
router.get("/:flatId", authMiddleware, roleMiddleware("USER", "BUILDER_ADMIN", "SOCIETY_ADMIN"), getMeterReadingsByFlat);

module.exports = router;