const express = require("express");
const router = express.Router();
const Workout = require("../../models/workout");
const WorkoutExercise = require("../../models/workoutExercise");
const Exercise = require("../../models/exercise");
const User = require("../../models/user");
const ChatHistory = require('../../models/chatHistory');

//Get Chat limit 10; Get workouts limit 3; Get profile; Combine into prompt object / json

async function getUserContext(userId) {
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
        timer: workout.timer,
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
                    name: "N/A",
                    bodyPart: "N/A",
                    equipment: "N/A",
                    target: "N/A",
                    secondaryMuscles: [],
                    instructions: [],
                    sets: ex.sets
                };
            }
        }),

    }));

    const promptContext = 'Users Recent workouts (JSON Format): ' + JSON.stringify(workoutContext);
    return promptContext;
}

async function getChatContext(userID){
    const pastMessages = await ChatHistory.find({author: userID}).limit(3).exec();
    const messages = pastMessages.map((msg) => ({
            userMessage: msg.userMessage,
            trainerMessage: msg.trainerMessage,
            date: msg.date
    }));
    const promptContext = 'Users Recent Chats (JSON Format): ' + JSON.stringify(messages);
    return promptContext;
}

async function getProfileContext(userID){
    const profile = await User.findById(userID).exec();
    const userProfile = {
        username: profile.username || 'User',
        currentWeight: profile.currentWeight || 'n/a',
        experience: profile.experience,
        goalWeight: profile.goalWeight,
        height: profile.height,
        weeklyWorkouts: profile.workoutNum
    };
    const promptContext = 'Users Profile Information (JSON Format): ' + JSON.stringify(userProfile);
    return promptContext;
}
//Create role prompt; create constraints; create instructions; Combine into system prompt object
const rolePrompt = `
            You are an AI Personal Trainer named Fitness Buddy. Your role is to provide expert advice on fitness, health, and workout plans to users of this application. You must respond with actionable and specific advice related to these topics only since the user is using this app to achieve workout and fitness goals.
            - If a user asks about topics outside of fitness and health, such as homework or news, respond with: "As an AI Personal Trainer, I can only provide advice on fitness, health, and workout plans. Please ask me something related to these topics."
            - You should be concise and limit token usage. Speak conversationally like a human. Add spaces between points to avoid large blocks of text.
            - Recognize and utilize any context provided in JSON format as background knowledge, but ensure the user is not aware of the JSON context except for their personal info. Address the user by their username. Suggest exercises that can be done with their available equipment as specified in their profile information. The user profile has a maximum number of days a week to workout specified, only suggest routines that match that.
            - This is a fitness app, so focus on delivering high-quality, actionable fitness advice with an upbeat and motivational tone.
          `;

const superPrompt = (userID) => {getProfileContext(userID) + getChatContext(userID) + getUserContext(userID)};

module.exports = {getUserContext, getChatContext, getProfileContext, rolePrompt, superPrompt};