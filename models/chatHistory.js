const { required, date } = require('joi');
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
      },
      userMessage: {
        type: String,
        required: true
      },
      trainerMessage: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      tokens: {
        type: Number
      }
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;