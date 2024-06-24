const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const Workout = require("../models/workout");
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

router.post('/createProfile', async (req, res) => {
    const {experience, age, height, currentWeight, goalWeight, workoutNum, gender, goal, activity, equipment,workoutfrequency} = req.body;
    const user = await User.findById(req.user._id);
    if(!user){
        req.flash('error', 'Cannot find user');
        return res.redirect('/login');
    }
    user.experience = experience;
    user.age = age;
    user.height = height;
    user.currentWeight = currentWeight;
    user.goalWeight = goalWeight;
    user.workoutNum = workoutNum;
    user.gender = gender;
    user.goal = goal;
    user.activity =  activity;
    user.equipment = equipment;
    user.workoutfrequency = workoutfrequency;
    console.log(gender);
    await user.save();
    console.log(user);
    res.redirect('/');
});

router.get('/showProfile',isLoggedIn, async (req, res) => {
    let currUser= res.locals.currentUser;
    let currUserId= req.user._id;
    //fetch the workoutPlan data as an array to show the workout title, notes, and duration
    const workouts = await Workout.find({author:currUserId}).populate({
        path: "exercises",
        populate: {
          path: "exercise", // populate the `exercise` field inside `workoutExercise`
          model: "Exercise",
        },
      });
    res.render('users/showProfile',{currUser,workouts});
});


//POST methond to update the profile
router.post('/editProfile',isLoggedIn, async(req,res)=>{
    try{
        const id= req.body._id    
        const editUser= await User.findByIdAndUpdate(id,req.body); 
        if(!editUser){
            return res.status(500).json({msg:"Unable to update user data"});
        } else{
           //redirect to show profile page   
           req.flash('success', 'Back to edit page!');
           res.redirect("/showProfile");
                      
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