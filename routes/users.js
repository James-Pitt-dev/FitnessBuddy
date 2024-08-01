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
const moment = require('moment');
const Exercise = require("../models/exercise");
const WorkoutExercise = require("../models/workoutExercise");
const {validateUser} = require('../middleware');

router.get('/register', users.renderRegister);

router.post('/register', validateUser, catchAsync(users.registerUser));

router.get('/login', users.renderLogin);

// call passport authenticate method, using the local or google or whatever strategy, 
router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(users.login));

router.get('/logout', users.logout); 

router.get('/createProfile', (req, res) => {
    //console.log(req.user);
    res.render('users/createProfile');
});

router.post('/createProfile', catchAsync(async (req, res) => {
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
    await user.save();
    console.log(user);
    res.redirect('/');
}));

router.get('/showProfile', async (req, res) => {
    let currUser= res.locals.currentUser;   
    let userId= req.user._id; 
    //fetch the workoutPlan data as an array to show the workout title, notes, and duration
    const workouts = await Workout.find({author:userId}).populate({
        path: "exercises",
        populate: {
          path: "exercise", // populate the `exercise` field inside `workoutExercise`
          model: "Exercise",
        },
      });
    res.render('users/showProfile',{currUser,workouts});
});


//POST methond to update the profile
router.post('/editProfile', isLoggedIn,catchAsync(async(req,res)=>{
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
}));

//get methond to delete the profile, and direct to home page, if user wants to access, has to recreate account
router.get('/deleteProfile/:id',isLoggedIn, async(req,res)=>{
    try{
        console.log('we are herer');
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
router.get('/dashboard', isLoggedIn, catchAsync(async (req, res) => {
    const userId = req.user._id.toString();
    
    const user = await User.findById(userId);

    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/');
    }

    const weightDifference = user.goalWeight - user.currentWeight;
    const totalWorkouts = await Workout.countDocuments({ author: userId });

    const workouts = await Workout.find({ author: userId });
    let totalTimeSpent = 0;
    try {
        workouts.forEach(workout => {
            const [hours, minutes, seconds] = workout.elapsedTime.split(':').map(Number);
            totalTimeSpent += (hours * 3600) + (minutes * 60) + seconds;
        });
    
    } catch (error) {console.log("Old user data leads to error. Missing elapsedTime in database. Make new user: " + error)};

     // Group workouts by week
     let workoutStats = {};
     workouts.forEach(workout => {
         const weekNumber= moment(workout.date).week();
         
         if (!workoutStats[weekNumber]) {
             workoutStats[weekNumber] = 0;
         }
         workoutStats[weekNumber] += 1;
     });

     
    // Map the original week numbers to a new sequential numbering
    const sortedWeeks = Object.keys(workoutStats).sort((a, b) => a - b);
    let sequentialWorkoutStats = {};
    sortedWeeks.forEach((originalWeek, index) => {
        sequentialWorkoutStats[index + 1] = workoutStats[originalWeek];
    });
 
    const recentWorkouts = await Workout.find({ author: userId })
        .sort({ date: -1 })
        .limit(3)
        .populate({
            path: 'exercises',
            populate: {
                path: 'exercise',
                model: 'Exercise'
            }
        });
    const averageWorkoutDuration = totalTimeSpent / totalWorkouts;
    const userexercises = await User.findById(userId).populate('dashboardExercises');

    res.render('users/dashboard', {
        name: user.username,
        goalWeight: user.goalWeight,
        currentWeight: user.currentWeight,
        weightDifference: weightDifference,
        totalWorkouts,
        totalTimeSpent,
        averageWorkoutDuration,
        recentWorkouts,
        workoutStats : sequentialWorkoutStats,
        dashboardExercises: userexercises.dashboardExercises
    });
}));
// Add search route
router.get('/searchexercises/:query', isLoggedIn, catchAsync(async (req, res) => {
    const { query } = req.params;
    if (!query) {
      return res.json([]);
    }
    const exercises =  await Exercise.find({ name: { $regex: query, $options: "i" } });
    
    res.json(exercises);
  }));

router.get('/exerciseprogress/:exerciseId', isLoggedIn, catchAsync(async (req, res) => {
    const { exerciseId } = req.params;
    console.log('id',exerciseId);
    const userId = req.user._id.toString();
    
  
    const workouts = await Workout.find({ author: userId })
        .populate({
            path: 'exercises',
            match: { exercise: exerciseId },
            populate: { path: 'exercise', model: 'Exercise' }
        })
        .sort({ date: -1 })
        .limit(5)
        .exec(); 
  
    
    const progressData = workouts.map(workout => {
        const workoutExercise = workout.exercises.find(ex => ex.exercise._id.equals(exerciseId));
        return {
            date: workout.date,
            weight: workoutExercise ? workoutExercise.sets[0].weight : 0
        };
    }).filter(entry => entry.weight > 0).reverse();; // Filter out entries with no weight data


    res.json(progressData);
}));

//add exercise to dashboard
router.post('/addToDashboard', isLoggedIn, catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { exerciseId } = req.body;
  
    const user = await User.findById(userId);
    if (!user.dashboardExercises.includes(exerciseId)) {
      user.dashboardExercises.push(exerciseId);
      await user.save();
    }
  
    res.json({ success: true });
  }));

//remove exercise to dashboard
router.post('/removeFromDashboard', isLoggedIn, catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { exerciseId } = req.body;
  
    const user = await User.findById(userId);
    user.dashboardExercises.pull(exerciseId);
    await user.save();
  
    res.json({ success: true });
  }));

//get the exercise progress for the dashboard
  router.get('/dashboardExerciseProgress', isLoggedIn, catchAsync(async (req, res) => {
    const userId = req.user._id.toString();
    const user = await User.findById(userId).populate('dashboardExercises');

    // Log the dashboard exercises to ensure they are populated correctly
    console.log('Dashboard Exercises:', user.dashboardExercises);

    const exercisesProgress = await Promise.all(user.dashboardExercises.map(async (exercise) => {
        // Log the exercise being processed
        console.log('Processing Exercise:', exercise.name);

        const progressData = await Workout.find({ author: userId })
            .sort({ date: -1 })
            .limit(5)
            .populate({
                path: 'exercises',
                match: { exercise: exercise._id },
                populate: { path: 'exercise', model: 'Exercise' }
            })
            .exec();

        // Log the progress data fetched for the exercise
        console.log('Progress Data for Exercise:', exercise.name, progressData);

        return {
            exercise,
            progressData: progressData.map(workout => {
                const workoutExercise = workout.exercises.find(ex => ex.exercise._id.equals(exercise._id));
                return {
                    date: workout.date,
                    weight: workoutExercise ? workoutExercise.sets[0].weight : 0
                };
            }).filter(entry => entry.weight > 0).reverse()
        };
    }));

    // Log the final exercises progress data to verify the structure
    console.log('Exercises Progress:', exercisesProgress);

    res.json(exercisesProgress);
}));
module.exports = router;