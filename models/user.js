const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
UserSchema.plugin(passportLocalMongoose); 
// put in the passport plug in and it will handle missing columns in UserSchema like name/password. And include useful methods
// + username, hash and salt
//Compile the model for export
module.exports = mongoose.model('User', UserSchema);