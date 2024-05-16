const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
// const { userSchema } = require('../schemas.js');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res) => {  
    try {
        const {email, username, password, experience} = req.body;
        const user = new User({email, username, experience});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            } else {
                req.flash('success', 'Welcome to Yelp Camp!');
                res.redirect('/campgrounds');
            }    
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
    
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = async (req, res) => {
    //if they make it into this route, we know they were successfully authenticated.
        const redirectURL = res.locals.returnTo || '/campgrounds';
        delete req.session.returnTo;
        req.flash('success', 'Welcome Back!');
        res.redirect(redirectURL);
    };

    module.exports.logout = (req, res, next) => {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Goodbye!');
            res.redirect('/campgrounds');
        });
    };