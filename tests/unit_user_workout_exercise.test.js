//need three npm packages to begin writing tests: jest, supertest, and cross-env
//npm install --save-dev @shelf/jest-mongodb
//npm update --latest @testing-library/jest-dom
//npm i jest supertest cross-env
//Open your package.json file and add the test script to the scripts.
/*
"scripts": {
    "test": "cross-env NODE_ENV=test jest --testTimeout=6000",
    "start": "node server.js",
    "dev": "nodemon server.js"
},*/
//insert "preset": "@shelf/jest-mongodb" to package.json as below
//{
//    "preset": "@shelf/jest-mongodb"
//}
// npm run test
const User = require("../models/user.js");
const Workout = require("../models/workout.js");
const Exercise = require("../models/exercise.js");
const WorkoutExercise = require("../models/workoutExercise.js");
const mongoose = require("mongoose"); // Used as ODM and mongdoDB interaction
const users = require("../controllers/users.js");
const request = require("supertest");
const app = require("./test_app.js");
const passport = require("passport");
const exercisesRoute = require("../routes/exercises.js");
const { beforeAll, afterAll } = require('@jest/globals');




/*afterAll("Testing Finished", async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});
*/
//testing for user profile
describe("Jest for User Profile Operations", () => {
  test("Testing Database connecting by check the length of user list", async () => {
    let currDatalenght = 0;
    await User.find({}).then(function (users) {
      currDatalenght = users.length;
    });
    expect(currDatalenght).toBeGreaterThan(11);
  });

  test("testing passport authenticate for login ", async () => {
    // call passport authenticate method, using the local or google or whatever strategy,
    user_id = "667ccd047aceba108c25fc10";
    username = "will";
    password = "will";
    email = "will@gmail.com";
    const authenticate_curr = await User.authenticate();
    return authenticate_curr(username, password, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        //console.log("authentication successfully");
        //The email of attribute is unique, so compare it
        expect(result.email).toBe(email);
      }
    });
  });

  test("Testing register by creating a new user", async () => {
    const testUser = new User();
    testUser.email = "test@fitnessbuddy.ca";
    testUser.username = "test";
    const registeredUser = await User.register(testUser, "testPassword");
    //find user hwo username is test in database
    expect(registeredUser.username).toBe("test");
  });

  afterAll(async () => {
    //delete the user of test
    await User.deleteOne({ username: "test" });
  });
});

//testing for exercise
describe("Jest for Exercise Operations", () => {
  test("Testing Database connecting by check the lenght of exercise list", async () => {
    let currDatalenght = 0;
    await Exercise.find({}).then(function (exercises) {
      currDatalenght = exercises.length;
    });
    expect(currDatalenght).toBe(1324);
  });

  test("Testing for finding one exercise to show", async () => {
    let testExerciseName = "air bike";
    const testingExercise = await Exercise.findOne({ name: testExerciseName });
    //find exercise which name is air bike in database
    expect(testingExercise.name).toBe("air bike");
    expect(testingExercise.target).toBe("abs");
  });
});

//testing for workout plan
describe("Jest for WorkoutPlan Operations", () => {
  beforeEach(async () => {
    //create a new workout plan for testing
    const testWorkout = new Workout();
    testWorkout.title = "testing";
    testWorkout.notes = "testing";
    testWorkout.timer = 60;
    testWorkout.author = "667ccd047aceba108c25fc10";
    await testWorkout.save();
  });

  afterEach(async () => {
    //delete the workout plan of test to end the testing session
    await Workout.findOneAndDelete({ title: "testing" });
  });

  test("Testing Database connecting by check the lenght of existed workout plan list", async () => {
    let currDatalenght = 0;
    await Workout.find({}).then(function (workouts) {
      currDatalenght = workouts.length;
    });
    expect(currDatalenght).toBeGreaterThan(55);
  });

  test("testing for updating current workout plan ", async () => {
    // find one workout plan by title and update it.
    let Currtitle = "testing";
    const workoutPlan_curr = await Workout.findOne({
      title: Currtitle,
    }).populate({
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });
    await Workout.findByIdAndUpdate(workoutPlan_curr._id, {
      notes: "updated notes for testing",
    });
    const updatedWorkoutPlan = await Workout.findById(workoutPlan_curr._id);
    expect(updatedWorkoutPlan.notes).toBe("updated notes for testing");
  });

  test("Testing for finding one workout plan to show", async () => {
    //find a workout plan which title is testing in database
    let Currtitle = "testing";
    const currentWorkoutPlan = await Workout.findOne({
      title: Currtitle,
    }).populate({
      path: "exercises",
      populate: {
        path: "exercise", // populate the `exercise` field inside `workoutExercise`
        model: "Exercise",
      },
    });
    //console.log(currentWorkoutPlan);
    expect(currentWorkoutPlan.author.toString()).toBe(
      "667ccd047aceba108c25fc10"
    );
  });
});
