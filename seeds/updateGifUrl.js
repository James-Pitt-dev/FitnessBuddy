const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const dbPassword = process.env.DATABASE_PASSWORD;
const Exercise = require('../models/exercise');
const Workout = require('../models/workout');
const WorkoutExercise = require('../models/workoutExercise');
const apiKey = process.env.EXERCISE_API_KEY;

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

// write inceptionDate to a date db
//fetch inception date from date db
// get date.now
// compare if date.now > inception date + 12hours
// if yes, fetch exercises from db: dbExercises; fetch api exercises: apiExercises
// for loop {dbEx[i].gifURL == apiEx[i].gifURL}; when done, rewrite inceptionDate db to date.now to reset timer

const workouts = async function(){ //function to fetch API exercises
    // /exercises/exercise/{id}
        const url = `https://exercisedb.p.rapidapi.com/exercises`;
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