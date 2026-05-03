const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const { loginUser, registerUser, getMe, updateMe } = require('./auth.service');

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.put("/update", authMiddleware, updateMe);

module.exports = router;