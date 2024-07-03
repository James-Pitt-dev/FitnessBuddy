const mongoose = require('mongoose');
const { Schema } = mongoose;

// This is to store time data and help schedule auto updates for the exercise gifURL updates.

const ExerciseDateSchema = new mongoose.Schema({
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const ExerciseDate = mongoose.model('ExerciseDate', ExerciseDateSchema);
module.exports = ExerciseDate;