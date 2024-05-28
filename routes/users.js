const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
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

router.get('/showProfile', (req, res) => {
    let currUser= res.locals.currentUser;
    res.render('users/showProfile',{currUser});
});


//POST methond to update the profile
router.post('/editProfile', async(req,res)=>{
    try{
        const id= req.body._id    
        const editUser= await User.findByIdAndUpdate(id,req.body); 
        if(!editUser){
            return res.status(500).json({msg:"Unable to update user data"});
        } else{
           const updatedUser= await User.findById(id);  
           req.flash('success', 'Back to edit page!');
           let currUser= updatedUser;
           res.render('users/showProfile', {currUser});               
        }                  
    }catch(error){     
        return res.status(500).json({msg:"Unable to update user data"});
    }
});

// if (!req.isAuthenticated()){
//     req.flash('error', 'Logout Failed: You Are Not Logged In');
//    return res.redirect('/campgrounds');
// }

module.exports = router;