const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware.js');
const rolesMiddleware = require('../../middleware/role.middleware.js');
const { getAllFlats, getFlatsByUser, getFlatsBySociety, createFlat, updateFlat, deleteFlat } = require('./flat.service.js');

// Default / returns flats owned by the user
router.get('/', authMiddleware, rolesMiddleware("USER", "SOCIETY_ADMIN", "BUILDER_ADMIN"), getFlatsByUser); 
// /society returns flats belonging to the admin's society
router.get('/society', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), getFlatsBySociety); 
// /all returns all flats in the system (for BUILDER_ADMIN)
router.get('/all', authMiddleware, rolesMiddleware("BUILDER_ADMIN"), getAllFlats); 

router.post('/', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), createFlat);
router.put('/:id', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), updateFlat);
router.delete('/:id', authMiddleware, rolesMiddleware("SOCIETY_ADMIN", "BUILDER_ADMIN"), deleteFlat);

module.exports = router;