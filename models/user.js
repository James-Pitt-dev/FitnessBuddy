
const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');
const ChatHistory = require('./chatHistory');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
        
    },
    experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    age : { type: Number},
    currentWeight: { type: Number},
    goalWeight: { type: Number},
    height: { type: Number},
    workoutNum: { type: Number},
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    goal: {
        type: [String]
    },
    activity: {
        type: String,
        enum: ['sedentary', 'lightly active', 'moderately active', 'very active', 'extremely active']
    },
    equipment: {
        type: [String],
        enum: ['full-gym', 'barbells', 'dumbbells', 'kettlebells', 'machines', 'bodyweight']
    },
    workoutfrequency: {
        type: String,
        enum: ['2days', '3days', '4days', '5days', '6days', '7days']
    },
    dashboardExercises:
    [{ type:Schema.Types.ObjectId, ref: 'Exercise' }] ,
    date: {
        type: Date,
        default: Date.now
    
    }
})

UserSchema.plugin(passportLocalMongoose); 
// put in the passport plug in and it will handle missing columns in UserSchema like name/password. And include useful methods
// + username, hash and salt. Has user.register(user, pw).

UserSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await ChatHistory.deleteMany({ author: doc._id });
    }
});


//Compile the model for export
module.exports = mongoose.model('User', UserSchema);