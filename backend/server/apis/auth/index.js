const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('./controller');

router.post('/register', registerUser);  // POST /api/auth/register
router.post('/login', loginUser);        // POST /api/auth/login

module.exports = router;