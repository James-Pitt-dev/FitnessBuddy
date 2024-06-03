const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { storeReturnTo } = require('../middleware');


// routes for exercises

const workoutAPI = async function(filter){
// /exercises/exercise/{id}
    const url = `https://exercisedb.p.rapidapi.com/exercises${filter}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'a34bd91f76mshd066cdaa2775237p1f279djsn703a2c619030',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
    };
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error(error);
    }
 }

// GET route to show all exercises from the database
router.get('/', catchAsync(async (req, res) => {
    // const exercises = await Exercise.find({});
    // res.render('exercises/index', { exercises });
const workouts = await workoutAPI('?limit=1000');
res.render('exercises/index', {workouts});
}));

router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const workout = await workoutAPI(`/exercise/${id}`);
    res.render('exercises/show', {workout});
}));

module.exports = router;