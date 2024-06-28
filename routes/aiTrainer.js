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
    const {id} = req.user._id;
    const workoutHistory = await getUserContext(id);
    const messageHistory = await getChatContext(id);
    const userProfile = await getProfileContext(id);
    const superPrompt = workoutHistory + messageHistory + userProfile;
    
    const data = await sendPrompt(userChat);
    
    const chatHistory = new ChatHistory({
        author: req.user._id,
        userMessage: userChat,
        trainerMessage: data
    });

    await chatHistory.save();
    res.json(chatHistory);
}));

module.exports = router;