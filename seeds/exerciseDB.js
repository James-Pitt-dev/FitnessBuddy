const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const dbPassword = process.env.DATABASE_PASSWORD;
const Exercise = require('../models/exercise');
const Workout = require('../models/workout');
const WorkoutExercise = require('../models/workoutExercise');
const apiKey = process.env.EXERCISE_API_KEY;
// WILL WIPE AND REWRITE EXERCISE COLLECTION IN DATABASE IF RAN, CAUTION!!


mongoose.connect('mongodb+srv://jamespitt1:cTiHNKFp4QSL9x6B@cluster0.eimml8f.mongodb.net/FitnessBuddy?retryWrites=true&w=majority', {})
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
        const url = `https://exercisedb.p.rapidapi.com/exercises?limit=300`;
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
