const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const rolesMiddleware = require('../../middleware/role.middleware.js');
const { getAllFlats, createFlat, updateFlat, deleteFlat } = require('./flat.service.js');

router.get('/', authMiddleware, rolesMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getAllFlats); // USER ka only read access hai, isliye create, update, delete ke liye USER role ko hata diya hai, aur sirf SOCIETY_ADMIN aur BUILDER_ADMIN ko access diya hai
router.post('/', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), createFlat);
router.put('/:id', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), updateFlat);
router.delete('/:id', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), deleteFlat);

module.exports = router;