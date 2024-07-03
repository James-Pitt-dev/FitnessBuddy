const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const dbPassword = process.env.DATABASE_PASSWORD;
const Exercise = require('../models/exercise');
const ExerciseDate = require('../models/exerciseDate');
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

const startDate = async () => {
    try{
        const inceptionDate = new ExerciseDate({
            lastUpdated: Date.now()
        });
        await inceptionDate.save();
        console.log('Created new inception date');
    }catch(e){
        console.log('Error creating startDate', e);
    }
   
}

const checkForUpdate = async () => {
    const getDBDate = await ExerciseDate.findOne({});
    console.log('Fetching system time: ', getDBDate.lastUpdated);
    if(getDBDate){
        const lastUpdated = new Date(getDBDate.lastUpdated).getTime();
        const currentTime = Date.now();
        const twelveHours = (60*12*60*1000);
        console.log(`${lastUpdated} -- ${currentTime}`)
        if(currentTime > lastUpdated + twelveHours){
            //run gifurl updater
            console.log('Updating exercise urls...');
            getDBDate.lastUpdated = Date.now();
            await getDBDate.save();
            replaceUrls();
        }
        else {
            console.log('GifURL up to date');
        }
    }
}

// write inceptionDate to a date db
//fetch inception date from date db
// get date.now
// compare if date.now > inception date + 12hours
// if yes, fetch exercises from db: dbExercises; fetch api exercises: apiExercises
// for loop {dbEx[i].gifURL == apiEx[i].gifURL}; when done, rewrite inceptionDate db to date.now to reset timer

const exerciseAPI = async function(){ //function to fetch API exercises
    // /exercises/exercise/{id}
        const url = `https://exercisedb.p.rapidapi.com/exercises?limit=1324`;
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
            console.log('API fetch successful');
            return result;
        } catch (error) {
            console.error(error);
        }
     }

const DBexercises = async function(){
    try{
        const exercises = await Exercise.find({});
        return exercises;
    }catch(e){
        console.log('Error fetching database exercises:', e);
    }
}

const replaceUrls = async function(){
    try{
        const dbExercises = await DBexercises();
        const apiExercises = await exerciseAPI();
        console.log('API Size:', apiExercises.length);
        console.log('DB Size: ', dbExercises.length);

        if(apiExercises.length != dbExercises.length){
            throw new Error('The number of exercises in the database and API fetch do not match');
        }
        console.log('Beginning gifUrl replacement... This takes a 1-2 minutes');
        for (let i = 0; i < dbExercises.length; i++){
            dbExercises[i].gifUrl = apiExercises[i].gifUrl;
            await dbExercises[i].save();
        }
        console.log('GifURL update Successful!');
    } catch(e){
        console.log(`Error updating URLs: ${e}`);
    }
}

checkForUpdate();