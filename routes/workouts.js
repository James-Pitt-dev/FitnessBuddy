const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const WorkoutExercise = require('../models/workoutExercise');
const Exercise = require('../models/exercise');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');

// Ensure user is logged in
router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
  const exercises = await Exercise.find({});
  res.render('workouts/new', { exercises });
}));

router.post('/new', isLoggedIn, catchAsync(async (req, res) => {
  const { workout } = req.body;
  const newWorkout = new Workout({
    title: workout.title,
    notes: workout.notes,
    timer: workout.timer,
    author: req.user._id
  });

  for (let exerciseIndex in workout.exercises) {
    const exerciseData = workout.exercises[exerciseIndex];
    const workoutExercise = new WorkoutExercise({
      exercise: exerciseData.exercise,
      workout: newWorkout._id,
      sets: exerciseData.sets.map(set => ({
        reps: set.reps,
        weight: set.weight,
        previousWeight: set.previousWeight
      }))
    });

    await workoutExercise.save();
    newWorkout.exercises.push(workoutExercise);
  }

  await newWorkout.save();
  console.log(newWorkout);
  req.flash('success', 'Successfully created a new workout!');
  res.redirect('/workouts/index');
}));

router.get('/index', catchAsync(async (req, res) => {

  const workouts = await Workout.find({}).populate({
    path: 'exercises',
    populate: {
        path: 'exercise', // populate the `exercise` field inside `workoutExercise`
        model: 'Exercise'
    }
});
  res.render('workouts/index', {workouts});
  // res.render('workouts/index');
}));

module.exports = router;
