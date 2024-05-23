const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
// const { userSchema } = require('../schemas.js');
const users = require('../controllers/users');

router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.registerUser));

router.get('/login', users.renderLogin);

// call passport authenticate method, using the local or google or whatever strategy, 
router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(users.login));

router.get('/logout', users.logout); 

router.get('/createProfile', (req, res) => {
    console.log(req.user);
    res.render('users/createProfile');
});

router.post('/createProfile', async (req, res) => {
    const {experience, height, currentWeight, goalWeight, workoutNum} = req.body;
    const user = await User.findById(req.user._id);
    if(!user){
        req.flash('error', 'Cannot find user');
        return res.redirect('/login');
    }
    user.experience = experience;
    user.height = height;
    user.currentWeight = currentWeight;
    user.goalWeight = goalWeight;
    user.workoutNum = workoutNum;
    await user.save();
    console.log(user);
    res.redirect('/');
});


// if (!req.isAuthenticated()){
//     req.flash('error', 'Logout Failed: You Are Not Logged In');
//    return res.redirect('/campgrounds');
// }

module.exports = router;