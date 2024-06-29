const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const WorkoutExercise = require("../models/workoutExercise");
const Exercise = require("../models/exercise");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const sendPrompt = require('../public/javascripts/openAIApi');
const ChatHistory = require('../models/chatHistory');
const {getUserContext, getChatContext, getProfileContext} = require('../public/javascripts/AIContext');

// GET Chat Interface
router.get('/chat', isLoggedIn, catchAsync(async (req, res) => {
        const id = req.user._id
        const pastMessages = await ChatHistory.find({author: id}).populate('author').exec();
        res.render('aiTrainer/chat', {pastMessages});
}));

router.post('/chat', isLoggedIn, catchAsync(async (req, res) => {
    const {userChat} = req.body.AI;
    const userID = req.user._id;
    const workoutHistory = await getUserContext(userID);
    const messageHistory = await getChatContext(userID);
    const userProfile = await getProfileContext(userID);
    const superPrompt = `
    User's Workout History: ${JSON.stringify(workoutHistory)}
    User's Message History: ${JSON.stringify(messageHistory)}
    User's Profile: ${userProfile}
    User's Message: ${userChat}
`;
    console.log(superPrompt);
    const data = await sendPrompt(superPrompt);
    
    const chatHistory = new ChatHistory({
        author: req.user._id,
        userMessage: userChat,
        trainerMessage: data
    });

    await chatHistory.save();
    console.log(chatHistory);
    res.json(chatHistory);
}));

module.exports = router;