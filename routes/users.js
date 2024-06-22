const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');
const { isLoggedIn } = require("../middleware");

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

router.post('/createProfile',isLoggedIn, async (req, res) => {
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

router.get('/showProfile',isLoggedIn, (req, res) => {
    let currUser= res.locals.currentUser;
    res.render('users/showProfile',{currUser});
});


//POST methond to update the profile
router.post('/editProfile',isLoggedIn, async(req,res)=>{
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

//get methond to delete the profile, and direct to home page, if user wants to access, has to recreate account
router.get('/deleteProfile/:id',isLoggedIn, async(req,res)=>{
    try{
        let {id} = req.params;
        console.log(id)
        const delUser= await User.findByIdAndDelete(id); 
        if(!delUser){
            return res.status(500).json({msg:"Unable to delete user data"});
        } else{
            //return to home pape and user needs to recreate new account to login
           
           res.redirect('/');               
        }                  
    }catch(error){     
        return res.status(500).json({msg:"Unable to delete user data"});
    }
});

// if (!req.isAuthenticated()){
//     req.flash('error', 'Logout Failed: You Are Not Logged In');
//    return res.redirect('/campgrounds');
// }

module.exports = router;