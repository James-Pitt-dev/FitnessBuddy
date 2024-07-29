const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// // Define the schema for an Exercise
// const exerciseSchema = new Schema({
//   name: { 
//     type: String, 
//     required: true },  // Name of the exercise, e.g., 'Squat (Barbell)'
//   sets: [
//     {
//       setNumber: { type: Number, required: true }, // Set number
//       previousWeight: { type: Number },           // Previous weight used
//       weight: { type: Number, required: true },   // Weight for this set
//       reps: { type: Number, required: true }      // Reps for this set
//     }
//   ],
//   notes: { type: String }  // Optional notes for the exercise
// }, { _id: false });

// Define the schema for a Workout
// const workoutSchema = new Schema({
//   name: { 
//     type: String, 
//     required: true },   // Name of the workout, e.g., 'Strong 5x5 - Workout B'
//   date: { 
//     type: Date, 
//     default: Date.now },  // Date of the workout
//   duration: { 
//     type: String },               // Duration of the workout, e.g., '2:16'
//   exercises: [exerciseSchema],              // List of exercises in the workout
//   user: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'User', required: true } // Reference to the user
// });

// const Workout = mongoose.model('Workout', workoutSchema);

// module.exports = Workout;

const workoutExerciseSchema = require('./workoutExercise'); 

const workoutSchema = new Schema({
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true
    },
    title: String,
    notes: String,
    timer: Number,
    elapsedTime: String,
    date: {
      type: Date,
      default: Date.now
    },
    exercises: [{ type: Schema.Types.ObjectId, ref: 'WorkoutExercise'}]
});

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;