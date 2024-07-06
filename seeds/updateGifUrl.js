require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('../models/exercise');
const ExerciseDate = require('../models/exerciseDate');
const EXERCISEDB_API_KEY = process.env.EXERCISEDB_API_KEY;

const startDate = async () => {
    try{
        const inceptionDate = new ExerciseDate({
            lastUpdated: Date.now()
        });
        await inceptionDate.save();
        console.log('Created new inception date');
    }catch(e){
        console.log('Error creating startDate: ', e);
    }
   
}

const checkForUpdate = async () => {
    const getDBDate = await ExerciseDate.findOne({});
    if(getDBDate){
        const lastUpdated = new Date(getDBDate.lastUpdated).getTime();
        const currentTime = Date.now();
        const twentyFourHours = (60*24*60*1000);
        if(currentTime > lastUpdated + twentyFourHours){
            //run gifurl updater
            console.log('Updating exercise urls...');
            getDBDate.lastUpdated = Date.now();
            replaceUrls();
            await getDBDate.save();
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
                'X-RapidAPI-Key': EXERCISEDB_API_KEY,
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
        console.log('Beginning gifUrl replacement... This takes a 1-2 minutes...');
        for (let i = 0; i < dbExercises.length; i++){
            dbExercises[i].gifUrl = apiExercises[i].gifUrl;
            await dbExercises[i].save();
        }
        console.log('GifURL update Successful!');
    } catch(e){
        console.log(`Error updating URLs: ${e}`);
    }
}

module.exports = checkForUpdate;
