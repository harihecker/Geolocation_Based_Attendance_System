const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const adminController = require('../controllers/admin');

const router = express.Router();

router.use(bodyParser.json());

router.get('/login', adminController.getLogin);

router.post('/login-submit', adminController.postLogin);

router.post('/location', adminController.postLocation);

router.get('/getlocation', adminController.getLocation);

router.get('/showLocation',adminController.showLocation);

router.get('/addUser',adminController.addUser);

router.get('/getDashboard',adminController.getDashboard);

router.post('/postSignUp',adminController.postSignUp);

router.get('/addCompany',adminController.addCompany);

router.post('/postAddCompany',adminController.postAddCompany);

// router.get('/getCompanyDetails'.adminController.getCompanyDetails);

module.exports = router;