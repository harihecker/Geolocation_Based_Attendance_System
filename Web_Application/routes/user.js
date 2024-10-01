const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const userControllers = require('../controllers/user');

const router = express.Router();

router.use(bodyParser.json());

router.post('/postLogin',userControllers.postLogin);

module.exports = router;