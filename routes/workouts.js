const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const WorkoutExercise = require("../models/workoutExercise");
const Exercise = require("../models/exercise");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");

// Ensure user is logged in
router.get(
  "/new",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const exercises = await Exercise.find({});
    res.render("workouts/new", { exercises });
  })
);

router.post(
  "/new",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { workout } = req.body;
    const newWorkout = new Workout({
      title: workout.title,
      notes: workout.notes,
      timer: workout.timer,
      author: req.user._id,
    });

    for (let exerciseIndex in workout.exercises) {
      const exerciseData = workout.exercises[exerciseIndex];
      const workoutExercise = new WorkoutExercise({
        exercise: exerciseData.exercise,
        workout: newWorkout._id,
        sets: exerciseData.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          previousWeight: set.previousWeight,
        })),
      });

      await workoutExercise.save();
      newWorkout.exercises.push(workoutExercise);
    }

    await newWorkout.save();
    console.log(newWorkout);
    req.flash("success", "Successfully created a new workout!");
    res.redirect("/workouts/index");
  })
);

router.get(
  "/index",isLoggedIn,
  catchAsync(async (req, res) => {
    const workouts = await Workout.find({}).populate({
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });
    res.render("workouts/index", { workouts });
    // res.render('workouts/index');
  })
);

router.get(
  "/view/:id",isLoggedIn,
  catchAsync(async (req, res) => {
    let {id} = req.params;
    console.log("here is viewing ",id);
    const workout = await Workout.findById(id).populate({
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });
    req.flash("success", "Welcom to view the workout!");
    res.render("workouts/show", { workout });
    // res.render('workouts/index');*/
  })
);

router.get(
  "/delete/:id",isLoggedIn,
  catchAsync(async (req, res) => {
    let {id} = req.params;
    let curr_workout= await Workout.findById(id)
    console.log(curr_workout.exercises)
    //before deleting the workout plan, should go to find the workexercise id to delete workoutEexercise
    for (let exerciseIndex in curr_workout.exercises) {
       //one by one, delete the workExercises
       let delete_workoutExercise= await WorkoutExercise.findByIdAndDelete(curr_workout.exercises[exerciseIndex])  
      }
      //ane then delete the workout plan
    const delete_workout = await Workout.findByIdAndDelete(id);
    res.redirect("/workouts/index");
  })
);

module.exports = router;

// const fetch = require('node-fetch');
// const exerciseCatalog = require('../seeds/exerciseCatalogData')

// router.get('/viewAllExercise', async function (req, res) {
//   const json_file = exerciseCatalog.exerciseCatalogList
//   if (json_file.length == 0) {
//     const url = 'https://exercisedb.p.rapidapi.com/exercises?limit=20&offset=0';
//     const bodyParturl = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList';
//     const options = {
//       method: 'GET',
//       headers: {
//         'x-rapidapi-key': '955929d1b2msh162f5c1d94afdf3p19c01fjsndb67889a007f',
//         'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
//       }
//     };

//     try {
//       const response = await fetch(url, options);
//       const result = await response.json();
//       console.log(result);
//       const exerciseList = result
//       res.render('../views/workouts/index', { exerciseList });

//     } catch (error) {
//       console.error(error);
//     }
//   } else {
//     console.log("DATA ALREADY EXISTED")
//     console.log(json_file)
//     const exerciseList = json_file
//     res.render('../views/workouts/index', { exerciseList });

//   }
// });
