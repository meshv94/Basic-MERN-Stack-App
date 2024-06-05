const express = require('express');

const { userValidate, userSignup, userLogin } = require('../controller/user.controller.js');

const router = express.Router();





router.post('/validate', userValidate);

router.post('/signup', userSignup);

router.post('/login', userLogin);

module.exports = router;
