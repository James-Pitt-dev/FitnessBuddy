const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const Exercise = require('../models/exercise');
const Workout = require('../models/workout');
const WorkoutExercise = require('../models/workoutExercise');
const EXERCISEDB_API_KEY = process.env.EXERCISEDB_API_KEY;
// WILL WIPE AND REWRITE EXERCISE COLLECTION IN DATABASE IF RAN, CAUTION!!


mongoose.connect(DATABASE_PASSWORD, {})
    .then(() => {
        console.log(`Connected to DB: ${mongoose.connection.db.databaseName}`);
    })
    .catch((err) => {
        console.log(`Mongoose Error: ${err}`);
    });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const workoutAPI = async function(){ //function to fetch API exercises
    // /exercises/exercise/{id}
        const url = `https://exercisedb.p.rapidapi.com/exercises?limit=1324`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': EXERCISEDB_API_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        };
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error);
        }
     }

const seedDB = async () => {
    console.log('Fetching API...');
    const exerciseAPI = await workoutAPI();
    console.log('Deleting Exercises DB...');
    await Exercise.deleteMany({}); //empty exercise collection
    console.log('Deleting Workout DB...');
    await Workout.deleteMany({});
    console.log('Deleting WorkoutExercise DB...');
    await WorkoutExercise.deleteMany({});

    console.log('Writing new exercises to DB...cd .');
    for(let e of exerciseAPI){
        const exercise = new Exercise({...e}); 
        await exercise.save();
    }
}

seedDB().then(() => mongoose.connection.close()).catch(e => {console.log(e)});
