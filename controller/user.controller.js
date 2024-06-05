const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkUserUniqueness = require('../utils/checkUserUniquess');
const User = require('../models/usersModel');
const validateEmail = require('../utils/validateEmail');
const config = require('../config');


const userValidate = async(req,res) => {
    try {
        const { field, value } = req.body;
    const { error, isUnique } = await checkUserUniqueness(field, value);

    if (isUnique) {
        res.json({ success: 'success' });
    } else {
        res.json({ error });
    }
    } catch (error) {
        res.status(400).json({error})
    }
}
const userLogin = async (req, res) => {
    try {
        const username = req.body.username || '';
    const password = req.body.password || '';

    let errors = {};

    if (username === '') {
        errors = { ...errors, username: 'This field is required' };
    }
    if (password === '') {
        errors = { ...errors, password: 'This field is required' };
    }

    if (Object.keys(errors).length > 0) {
        res.json({ errors });
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (err) throw err;
            if (Boolean(user)) {
                // Match Password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) return err;
                    if (isMatch) {
                        const token = jwt.sign({
                            id: user._id,
                            username: user.username
                        }, config.jwtSecret);
                        res.json({ token, success: 'success' })
                    } else {
                        res.json({ errors: { invalidCredentials: 'Invalid Username or Password' } });
                    }
                });
            } else {
                res.json({ errors: { invalidCredentials: 'Invalid Username or Password' } });
            }
        });
    }
    } catch (error) {
        res.status(400).json({error})
    }
}


const userSignup = async (req, res) => {
    try {
        const name = req.body.name || '';
    const username = req.body.username || '';
    const email = req.body.email || '';
    const password = req.body.password || '';
    const confirmPassword = req.body.confirmPassword || '';

    const reqBody = { name, username, email, password, confirmPassword };

    let errors = {};
    Object.keys(reqBody).forEach(async field => {
        if (reqBody[field] === '') {
            errors = { ...errors, [field]: 'This field is required' }
        }
        if (field === 'username' || field === 'email') {
            const value = reqBody[field];
            const { error, isUnique } = await checkUserUniqueness(field, value);
            if (!isUnique) {
                errors = { ...errors, ...error };
            }
        }
        if (field === 'email' && !validateEmail(reqBody[field])) {
            errors = { ...errors, [field]: 'Not a valid Email' }
        }
        if (field === 'password' && password !== '' && password < 4) {
            errors = { ...errors, [field]: 'Password too short' }
        }
        if (field === 'confirmPassword' && confirmPassword !== password) {
            errors = { ...errors, [field]: 'Passwords do not match' }
        }
    });

    if (Object.keys(errors).length > 0) {
        res.json({ errors });
    } else {
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password
        });

        // Generate the Salt
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return err;
            // Create the hashed password
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) return err;
                newUser.password = hash;
                // Save the User
                newUser.save(function (err) {
                    if (err) return err
                    res.json({ success: 'success' });
                });
            });
        });
    }
    } catch (error) {
        res.status(400).json({error})
    }
}


module.exports = {
    userLogin,
    userSignup,
    userValidate
}