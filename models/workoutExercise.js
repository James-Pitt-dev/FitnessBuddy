const mongoose = require('mongoose');
const { Schema } = mongoose;

const workoutExerciseSchema = new Schema({
    exercise: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    sets: Number,
    reps: Number,
    weight: Number,
    previousWeight: Number
});

module.exports = workoutExerciseSchema;