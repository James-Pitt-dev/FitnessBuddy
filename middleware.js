
const ExpressError = require('./utils/ExpressError.js');
const {workoutSchema, userSchema} = require('./schemaValidations.js');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){//we check if req has authentication object appended to it by passport
        req.session.returnTo = req.originalUrl;
       // console.log('session:', req.session);
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}
// store originalURL in session, then pass that into locals variables. This is a workaround for passport deleting OriginalURL
// when isAuthenticated() is called.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// we use the joi library to make sure incoming data models follow the defined schema constraints
module.exports.validateWorkout = (req, res, next) => { // Joi: Server-side validation middleware
    const {error} = workoutSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateUser = (req, res, next) => { // Joi: Server-side validation middleware
    const {error} = userSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

