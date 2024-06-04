const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { storeReturnTo } = require('../middleware');
const Exercise = require('../models/exercise');


// routes for exercises

// GET route to show all exercises from the database
router.get('/', catchAsync(async (req, res) => {
    const workouts = await Exercise.find({});
    res.render('exercises/index', {workouts});
}));

router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const workout = await Exercise.findOne({ id: id });
    // const workout = await workoutAPI(`/exercise/${id}`);
    res.render('exercises/show', {workout});
}));

module.exports = router;