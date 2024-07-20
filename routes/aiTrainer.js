const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const WorkoutExercise = require("../models/workoutExercise");
const Exercise = require("../models/exercise");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const sendPrompt = require('../public/javascripts/openAIApi');
const ChatHistory = require('../models/chatHistory');
const {getWorkoutContext, getChatContext, getProfileContext, rolePrompt} = require('../public/javascripts/AIContext');
const {chest, back, cardio, lowerArms, lowerLegs, neck, shoulders, upperArms, upperLegs, waist} = require('../public/javascripts/filteredExercises');

// GET Chat Interface. Display chat interface with past messages
router.get('/chat', isLoggedIn, catchAsync(async (req, res) => {
        const id = req.user._id
        const getMessages = await ChatHistory.find({author: id}).populate('author').exec();
        // Limit the number of messages displayed to the user to last 5 messages in ascending order
        const pastMessages = getMessages.slice(Math.max(getMessages.length - 7, 0));
        res.render('aiTrainer/chat', {pastMessages});
}));

// POST Chat Interface. Send user message to AI with context and get response, save to database, and return response to user
router.post('/chat', isLoggedIn, catchAsync(async (req, res) => {
    const {userChat} = req.body.AI;
    const userID = req.user._id;
    const workoutHistory = await getWorkoutContext(userID);
    const messageHistory = await getChatContext(userID, 5);
    const userProfile = await getProfileContext(userID);
    const allExercises = { chest, back, cardio, lowerArms, lowerLegs, neck, shoulders, upperArms, upperLegs, waist };
    const superPrompt = `
    This is context about the User talking to you and your role in the system, use it to inform your responses and provide personalized advice to their queries. Also occasionally inform the user what services and functions you can do like workout creation and fetching exercises: ${rolePrompt} - EXERCISES FOR SUGGESTION AND WORKOUT CREATION CALLING, YOU MUST USE THESE NAMES ONLY WHEN SUGGESTING EXERCISES AND WORKOUTS, THEY MUST BE EXACT NAMES: ${JSON.stringify(allExercises)}- USER CONTEXT = ${userProfile} - ${workoutHistory} - ${messageHistory}
`;
    const data = await sendPrompt(userChat, superPrompt, req.user._id);
    const chatHistory = new ChatHistory({
        author: req.user._id,
        userMessage: userChat,
        trainerMessage: data
    });
    await chatHistory.save();
    res.json(chatHistory);
}));

module.exports = router;