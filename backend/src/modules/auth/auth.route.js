const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('./auth.service');

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;