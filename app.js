if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express = require('express');
const app = express(); // use to set up server and listen
const mongoose = require('mongoose'); // Used as ODM and mongdoDB interaction
const path = require('path'); //Helps with file paths
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); // lets you listen for PUT/DELETE requests on POST Reqs
const ejsMate = require('ejs-mate'); // lets you use body templates
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const checkForUpdate = require('./seeds/updateGifUrl.js');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
// routes
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const exerciseRoutes = require('./routes/exercises');
const aiTrainerRoutes = require('./routes/aiTrainer.js');

const User = require('./models/user.js');

const apiKey = process.env.API_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;


mongoose.connect(dbPassword, {})
    .then(() => {
        console.log(`Connected to DB: ${mongoose.connection.db.databaseName}`);
        checkForUpdate();
        
    })
    .catch((err) => {
        console.log(`Mongoose Error: ${err}`);
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// APP SETTINGS
app.engine('ejs', ejsMate); //tell express we want to use ejs-mate as engine
app.set('view engine', 'ejs');
app.set('path', path.join(__dirname, 'views'));

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended: true})); // To parse req.body
app.use(methodOverride('_method')); // To enable PUT/PATCH requests. Pass in string pattern we want app to watch for.
// app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'public')));  //
const sessionConfig = { //initialize session with some options
    name: 'session',
    secret: 'test',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({mongoUrl: dbPassword})
    //store: mongodb
}
// rate limiter to help prevent abuse since its on open internet
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit to 100 requests per windowMs
    message: "Too many requests. Please try again later."
  });

app.use(session(sessionConfig));
app.use(limiter);
app.use(passport.initialize()); //initialize it and use session for persistent log in
app.use(passport.session());
app.use(mongoSanitize());
passport.use(new LocalStrategy(User.authenticate())); // tell it to use local strat and use user model auth
passport.serializeUser(User.serializeUser()); //how d we store a user in session?
passport.deserializeUser(User.deserializeUser());

app.use(flash()); //make another middleware to store flash(key, values) for global access rather than passing to each route
app.use((req, res, next) => { 
    //the flash global middleware. On every req, takes the defined key:value stored in req, then appends it to the locals object 
    // that all views have access to by default.   
    res.locals.currentUser = req.user; //add a global curUser object so log in status can be checked across pages.                        
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error'); // if no req(error) exists, it does nothing. Predefine your flash msgs
    next();
})


// Routing
app.use('/', userRoutes);
app.use('/workouts', workoutRoutes);
app.use('/exercises', exerciseRoutes); //reroutes incoming urls that match '/exercises/*' to route handler
app.use('/ai-trainer', aiTrainerRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = 'Oh No, Something Went Wrong!';
    }
    res.status(statusCode).render('errors', {err});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App Connected: ${PORT}`);
});

// exports for integration testing
module.exports = app;