const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    bodyPart: String,
    equipment: String,
    gifUrl: String,
    id: String,
    name: String,
    target: String,
    secondaryMuscles: [String],
    instructions: [String]
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;