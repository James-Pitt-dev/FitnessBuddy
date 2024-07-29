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

//creat a new workout plan by POST
router.post(
  "/new",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { workout } = req.body;
    const newWorkout = new Workout({
      title: workout.title,
      notes: workout.notes,
      timer: workout.timer,
      elapsedTime: workout.elapsedTime,
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
  "/index",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const userId = req.user._id;
    console.log("show user id as author to display workout", userId);

    // Find the last 7 workouts for the user, sorted by date in descending order
    const workouts = await Workout.find({ author: userId })
      .sort({ date: -1 }) // Sort by date in descending order
      .populate({
        path: "exercises",
        populate: {
          path: "exercise", // populate the `exercise` field inside `workoutExercise`
          model: "Exercise",
        },
      });
        // Filter workouts to keep only distinct titles and limit to the last 7
    const distinctWorkouts = [];
    const titles = new Set();
    for (const workout of workouts) {
      if (!titles.has(workout.title)) {
        titles.add(workout.title);
        distinctWorkouts.push(workout);
      }
      if (distinctWorkouts.length >= 8) break;
    }

    res.render("workouts/index", { workouts: distinctWorkouts });
  })
);
router.get(
  "/template/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const workout = await Workout.findById(id).populate({
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json(workout);
  })
);


router.get(
  "/workouthistory",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const userId= req.user._id.toString();
    console.log("show user id as author to display workout",userId);
    const workouts = await Workout.find({author:userId}).sort({ date: -1 }).populate({
      
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });
    res.render("workouts/workouthistory", { workouts });
    // res.render('workouts/index');
  })
);

router.get(
  "/view/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    let { id } = req.params;
    const { json = false } = req.query; // Get the 'json' query parameter and default to false if not provided

    console.log("here is viewing ", id);
    const workout = await Workout.findById(id).populate({
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });

    if (json === 'true') {
      res.json({ workout });
    } else {
      req.flash("success", "Welcome to view the workout!");
      res.render("workouts/show", { workout });
    }
  })
);


router.get(
  "/delete/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    let { id } = req.params;
    let curr_workout = await Workout.findById(id);
    console.log(curr_workout.exercises);
    //before deleting the workout plan, should go to find the workexercise id to delete workoutEexercise
    for (let exerciseIndex in curr_workout.exercises) {
      //one by one, delete the workExercises
      let delete_workoutExercise = await WorkoutExercise.findByIdAndDelete(
        curr_workout.exercises[exerciseIndex]
      );
    }
    //ane then delete the workout plan
    const delete_workout = await Workout.findByIdAndDelete(id);
    res.redirect("/workouts/workouthistory");
  })
);

//update the workout plan by POST
router.post(
  "/updateWorkout",
  isLoggedIn,
  catchAsync(async (req, res) => {
    //first of all, update the workout attributes such as title,notes, and timer
    let workoutId = req.body["workoutId"];
    const { workout } = req.body;
    const editWorkout = await Workout.findByIdAndUpdate(workoutId, {
      title: workout.title,
      notes: workout.notes,
      timer: workout.timer,
      elapsedTime: workout.elapsedTime,
    });

    if (!editWorkout) {
      return res.status(500).json({ msg: "Unable to update workout data" });
    } else {
      //find id of workoutExercise, and process the loop to update the sets of workoutExercise by mapping
      for (let i = 0; i < editWorkout.exercises.length; i++) {
        console.log(i, req.body["workout"]["exercises"][i]["_id"]);
        const exerciseData = workout.exercises[i];
        let workoutExerciseId = req.body["workout"]["exercises"][i]["_id"];
        const eidtWorkExercise = await WorkoutExercise.findByIdAndUpdate(
          workoutExerciseId,
          {
            sets: exerciseData.sets.map((set) => ({
              reps: set.reps,
              weight: set.weight,
              previousWeight: set.previousWeight,
            })),
          }
        );
        console.log(eidtWorkExercise);
      }
    }

    req.flash("success", "Successfully update current workout!");
    res.redirect("/workouts/index");
  })
);


router.get('/previousWeight/:exerciseId', isLoggedIn, catchAsync(async (req, res) => {
  const { exerciseId } = req.params;
  const userId = req.user._id.toString(); 
  
  
  // Find the latest WorkoutExercise for the given exerciseId and userId
  const lastWorkoutExercise = await WorkoutExercise.findOne({ 
    exercise: exerciseId 
  })
  .populate({
    path: 'workout',
    match: { author: userId },
  })
  .sort({ 'sets._id': -1 })  // Sorting by the sets' ObjectId to get the latest one
  .exec();

  if (lastWorkoutExercise && lastWorkoutExercise.workout) {
    // If a WorkoutExercise is found and it belongs to the current user
    const lastSet = lastWorkoutExercise.sets[lastWorkoutExercise.sets.length - 1];
   
    res.json({ previousWeight: lastSet.weight || 0, previousReps: lastSet.reps || 0 });
  } else {
    res.json({ previousWeight: 0 , previousReps: 0}); // default to 0 if no previous weight is found
  }
}));


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
