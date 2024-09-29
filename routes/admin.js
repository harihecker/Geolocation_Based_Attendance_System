const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/login', adminController.getLogin);

router.post('/login-submit', adminController.postLogin);

module.exports = router;