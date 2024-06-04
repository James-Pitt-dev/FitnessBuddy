const mongoose = require('mongoose');
const { Schema } = mongoose;

const workoutExerciseSchema = new Schema({
    exercise: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    sets: [{
        reps: { type: Number},
        weight: { type: Number},
        previousWeight: { type: Number}
    }],
    workout: { type: Schema.Types.ObjectId, ref: 'Workout', required: true }
});

module.exports = mongoose.model('WorkoutExercise', workoutExerciseSchema);
