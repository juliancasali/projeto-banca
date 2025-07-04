const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const auth  = require("../middlewares/authMiddleware");

router.post('/login', userController.login)
router.post('/logout', auth , userController.logout)
router.get('/me', auth, userController.getCurrentUser)

module.exports = router;