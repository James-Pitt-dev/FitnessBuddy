const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const WorkoutExercise = require("../models/workoutExercise");
const Exercise = require("../models/exercise");
const markdown = require('markdown-it');
const md = new markdown();
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

        // map the messages throughh md to render markdown
        pastMessages.map(message => {
            message.userMessage = md.render(message.userMessage);
            message.trainerMessage = md.render(message.trainerMessage);
        });

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

    chatHistory.userMessage = md.render(chatHistory.userMessage);
    chatHistory.trainerMessage = md.render(chatHistory.trainerMessage);
    res.json(chatHistory);
}));

// Ensure user is logged in
router.get('/chathistory', isLoggedIn, catchAsync(async (req, res) => {
    const userId = req.user._id;
  
    // Get the current date
    const now = new Date();
    const currentWeekEnd = new Date(now);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // Get the earliest chat date for the user
    const earliestChat = await ChatHistory.findOne({ author: userId }).sort({ date: 1 });

    if (!earliestChat) {
      return res.render('aiTrainer/history', { weeks: [] });
    }
  
    
    const earliestDate = earliestChat.date;
  
    // Calculate the total number of weeks between the earliest chat date and now
    const totalWeeks = Math.ceil((currentWeekEnd - earliestDate) / (7 * 24 * 60 * 60 * 1000));
  
    // Create week ranges
    const weeks = [];
    for (let i = 0; i < totalWeeks; i++) {
      const weekEnd = new Date(currentWeekEnd);
      weekEnd.setDate(currentWeekEnd.getDate() - (i * 7));
  
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
  
      weeks.push({ startDate: weekStart, endDate: weekEnd });
    }
  
    res.render('aiTrainer/history', { weeks });
  }));
  
  router.get('/week/:weekId', isLoggedIn, catchAsync(async (req, res) => {
    const userId = req.user._id;
    const weekIndex = parseInt(req.params.weekId);
  
    // Get the current date
    const now = new Date();
    const currentWeekEnd = new Date(now);
    currentWeekEnd.setHours(23, 59, 59, 999);
  
    // Calculate the start and end date for the specified week
    const weekEnd = new Date(currentWeekEnd);
    weekEnd.setDate(currentWeekEnd.getDate() - (weekIndex * 7));
  
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
  
    // Get all chat messages for the user within the specified week
    const chats = await ChatHistory.find({
      author: userId,
      date: { $gte: weekStart, $lte: weekEnd }
    }).sort({ date: -1 });
res.json({ chats, startDate: weekStart, endDate: weekEnd });
  }));

module.exports = router;