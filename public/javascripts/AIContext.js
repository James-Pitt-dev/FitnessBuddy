const express = require("express");
const router = express.Router();
const Workout = require("../../models/workout");
const WorkoutExercise = require("../../models/workoutExercise");
const Exercise = require("../../models/exercise");
const User = require("../../models/user");
const ChatHistory = require('../../models/chatHistory');
const {chest, back, cardio, lowerArms, lowerLegs, neck, shoulders, upperArms, upperLegs, waist} = require('./filteredExercises.js');


//Get Chat limit 10; Get workouts limit 3; Get profile; Combine into prompt object / json

async function getWorkoutContext(userId) {
    const workouts = await Workout.find({ author: userId }).limit(3).populate({
        path: "exercises",
        populate: {
          path: "exercise", // populate the `exercise` field inside `workoutExercise`
          model: "Exercise",
        },
      }).exec();

    const workoutContext = workouts.map((workout) => ({
        title: workout.title,
        notes: workout.notes,
        exercises: workout.exercises.map((ex) => {
            if (ex.exercise) {
                return {
                    name: ex.exercise.name,
                    bodyPart: ex.exercise.bodyPart,
                    equipment: ex.exercise.equipment,
                    target: ex.exercise.target,
                    secondaryMuscles: ex.exercise.secondaryMuscles,
                    instructions: ex.exercise.instructions,
                    sets: ex.sets
                };
            } else {
                return {
                   empty: "This user has no workouts in database"
                };
            }
        }),

    }));

    const promptContext = 'Users Recent workouts: ' + JSON.stringify(workoutContext);
    return promptContext;
}

async function getChatContext(userID, limit = 3){
    const pastMessages = await ChatHistory.find({author: userID}).sort({date: -1}).limit(limit).exec();
    const messages = pastMessages.map((msg) => ({
            userMessage: msg.userMessage,
            trainerMessage: msg.trainerMessage,
            date: msg.date
    })).reverse();

    const promptContext = 'Users Recent Chats: ' + JSON.stringify(messages);
    return promptContext;
}

async function getProfileContext(userID){
    const profile = await User.findById(userID).exec();
    const userProfile = {
        username: profile.username || 'User',
        currentWeight: profile.currentWeight || '',
        age: profile.age || '',
        userGender: profile.gender || '',
        activity: profile.activity || '',
        experience: profile.experience || '',
        userGoals: profile.goal || [],
        availableEquipment: profile.equipment || [],
        goalWeight: profile.goalWeight || '',
        height: profile.height || '',
        weeklyWorkouts: profile.workoutfrequency || '',
    };
    const promptContext = 'Users Profile Information: ' + JSON.stringify(userProfile);
    return promptContext;
}
//Create role prompt; create constraints; create instructions; Combine into system prompt object
const rolePrompt = `
    You are an AI Personal Fitness Trainer named 'Fitness Buddy', refer to yourself as that. Your role is to provide expert advice on fitness, health, nutrition, exercise, and workout plans to users of this application and help them use it. You must respond with actionable and specific advice related to these topics only since the user is using this app to achieve workout and fitness goals.
    - If a user asks about topics outside of fitness, workouts, nutrtition, and health, such as homework or news, respond with: "As an AI Personal Trainer, I can only provide advice on fitness, health, nutrition, and workout plans. Please ask me something related to these topics."
    - You should be concise and limit token usage. Speak conversationally like a human. Format responses in Markdown format
    - Recognize and utilize any context provided in JSON-like format {} as context knowledge. Address the user by their username. Use their context information like profile, workouts, and past messages to provide personalized advice. Suggest exercises that can be done with their available equipment as specified in their profile information. Only suggest exercise names that are listed here. The user profile has a maximum number of days a week to workout specified, only suggest routines that match that.
    - This is a fitness app, so focus on delivering high-quality, actionable fitness advice with an upbeat and motivational tone.
    - If the user requests a workout routine or mentions creating a workout plan, call the 'getExerciseList' function and suggest appropriate exercises from the list for a workout routine. Then offer to create a workout routine by calling the 'createWorkoutRoutine' function and providing exercise names from the chat context as arguments to generate a workout plan and inform them of the generated workout plan. The exercise name arguments passed to this function must exactly match names in the exercise list. Prompt them after every exercise suggestion to ask if they want to create a workout routine with the createWorkoutRoutine function.
    - When creating a workout routine, consider the user's goals, available equipment, and experience level to ensure the workout is appropriate and effective.
`;

    
    // make a function to get the list of exercises by body part from the imported filteredExercises.js file, similar to getExerciseList in AIContext.js
    const getExerciseList = (filters = {}) => {
        const allExercises = { chest, back, cardio, lowerArms, lowerLegs, neck, shoulders, upperArms, upperLegs, waist };
        let filteredExercises = [];
    
        if (filters.bodyParts) {
            filters.bodyParts.forEach(bodyPart => {
                if (allExercises[bodyPart]) {
                    filteredExercises = filteredExercises.concat(allExercises[bodyPart]);
                }
            });
        } else {
            // If no filters are provided, return all exercises
            for (const key in allExercises) {
                filteredExercises = filteredExercises.concat(allExercises[key]);
            }
        }
        const exercisePrompt = `Here is the list of acceptable exercises to choose from when creating a workout plan for the user. You must only pick exercises from this list to ensure the user is performing safe and effective exercises: ${JSON.stringify(filteredExercises)}`;

        return exercisePrompt;
    };

          
    // const getExerciseList = async (filters = {}) => {
    //     const query = {};
    //         if (filters.bodyParts) {
    //             query.bodyPart = { $in: filters.bodyParts };
    //         }

    //  const exercises = await Exercise.find(query);
    //     const exerciseList = exercises.map((ex) => ({
    //             name: ex.name,
    //             bodyPart: ex.bodyPart,
    //         }));
    //         return JSON.stringify(exerciseList);
    //     }

    const createWorkoutRoutine = async (userID, { exerciseNames, title, notes }) => {
        try {
            // Convert exercise names to lowercase for exact matching
            const lowerCaseExerciseNames = exerciseNames.map(name => name.toLowerCase());
    
            // Fetch the exercises by exact name match from the database (case-insensitive)
            const exercises = await Exercise.find({
                name: { 
                    $in: lowerCaseExerciseNames 
                }
            });
    
            // Create the workout object first
            const workout = new Workout({
                author: userID,
                title: title || 'Generated Workout Routine',
                notes: notes || 'Perform each exercise with proper form and control. Stay hydrated and energized throughout your workout.',
                elaspsedTime: '00:00:00',
                exercises: [] // Initialize as empty, will update later
            });
    
            // Save the workout to get the workout ID
            await workout.save();
    
            // Create workout exercises array and save them
            const workoutExercises = await Promise.all(exercises.map(async (exercise) => {
                const workoutExercise = new WorkoutExercise({
                    exercise: exercise._id,
                    sets: [
                        { reps: 8, weight: 0, previousWeight: 0 },
                        { reps: 8, weight: 0, previousWeight: 0 },
                        { reps: 8, weight: 0, previousWeight: 0 }
                    ],
                    workout: workout._id // Set the workout reference here
                });
                await workoutExercise.save();
                return workoutExercise._id;
            }));
    
            // Update the workout with the exercises
            workout.exercises = workoutExercises;
            await workout.save();
    
            return workout;
        } catch (error) {
            console.error("ERROR creating workout routine:", error);
            throw error;
        }
    };
    
    // Thhese functions are used by the AI to fetch context information and perform actions based on the user's requests, we process the function in openAIApi.js
    const aiFunctions = [
        {
            name: "getExerciseList",
            description: "-Fetch the list of acceptable exercises from the database. -You can filter by body part(s) such as ['chest', 'back', 'cardio', 'lowerArms', 'lowerLegs', 'neck', 'shoulders', 'upperArms', 'upperLegs', 'waist']. -When selecting exercises, pick the most popular and common ones and use the users context to decide appropriate exercises. -Remember the user's equipment list in their profile context, choose exercises that align with that. ",
            parameters: {
                type: "object",
                properties: {
                    bodyParts: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ['back', 'cardio', 'chest', 'lowerArms', 'lowerLegs', 'neck', 'shoulders', 'upperArms', 'upperLegs', 'waist']
                        },
                        description: "Array of body parts to filter exercises by."
                    }
                },
                required: []
            }
        }, 
    {
        name: "getProfileContext",
        description: "Fetch more context about who the user is, their goals, their attributes and other information to give unique and personal recommendations and advice",
        parameters: {}
    },
    {
        name: "getWorkoutContext",
        description: "Fetch the users recently completed workouts. Use this information for more context about the users fitness journey and to know what they have recently done when giving suggestions",
        parameters: {}
    },
    {
        name: "getChatContext",
        description: "Fetch the users recent chats with the AI, use this information to get more context to persist conversations, recall past interactions, and give personal recommendations",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "integer",
                    minimum: 4,
                    maximum: 10,
                    description: "The number of recent chat messages to fetch"
                }
            },
        }
    },
    {
        name: "createWorkoutRoutine",
        description: "Create a workout routine for the user with the exercise names from the chat context, give a workout title, and instructional notes appropriate for the set of exercises. Call this function if the user asks you to create a workout routine for them, you will ask them for confirmation like 'Do you want me to create a workout routine for you from these exercises?' after a routine is suggested. Use the context of the conversation and latest user comments to determine the exercise names you use as function arguments. Only suggest exercise names that can be done with their profile equipment list and that exist in your exercise list. Exercise name arguments must be exact spelling as exercise list. Maximum of 5 exercises per routine.",
        parameters: {
            type: "object",
            properties: {
                exerciseNames: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of exercise names to include in the workout. Names are inferred from the user's recent chat history. Double check the exercise names so they match the exercise list exactly, best match if necessary."
                },
                title: { type: "string", description: "Title of the workout" },
                notes: { type: "string", description: "Notes for the workout" }
            },
            required: ["exerciseNames"]
        }
    }
    ];
    


const superPrompt = (userID) => {getProfileContext(userID) + getChatContext(userID) + getWorkoutContext(userID)};

module.exports = {getWorkoutContext, getChatContext, getProfileContext, rolePrompt, superPrompt, aiFunctions, getExerciseList, createWorkoutRoutine};