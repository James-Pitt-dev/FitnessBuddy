
const ExpressError = require('./utils/ExpressError.js');

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
        console.log('session:', req.session.returnTo);
        res.locals.returnTo = req.session.returnTo;
        console.log('local:', res.locals.returnTo);
    }
    next();
}
