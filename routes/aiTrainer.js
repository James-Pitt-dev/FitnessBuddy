const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const WorkoutExercise = require("../models/workoutExercise");
const Exercise = require("../models/exercise");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const sendPrompt = require('../openAIApi');
const ChatHistory = require('../models/chatHistory');

// GET Chat Interface
router.get('/chat', isLoggedIn, catchAsync(async (req, res) => {
    // TODO: fetch past convos to pass to view; put isLoggedIn middleware; 
  
        const id = req.user._id
        const pastMessages = await ChatHistory.find({author: id}).populate('author').exec();
        res.render('aiTrainer/chat', {pastMessages});
}));

router.post('/chat', isLoggedIn, async (req, res) => {
    const {userChat} = req.body.AI;
    const data = await sendPrompt(userChat);
    
    const chatHistory = new ChatHistory({
        author: req.user._id,
        userMessage: userChat,
        trainerMessage: data
    });

    await chatHistory.save();
    console.log(chatHistory);
    res.json(chatHistory);
});

module.exports = router;