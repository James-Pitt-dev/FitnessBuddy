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
const mongoose = require("mongoose"); // Used as ODM and mongdoDB interaction
const users = require("../controllers/users.js");
const request = require("supertest");
const app = require("../app.js");
const passport = require("passport");

afterAll(async () => {
  //delete the user of test
  await User.deleteOne({ username: "test" });
  await mongoose.disconnect();
  await mongoose.connection.close(); 
});


test("Testing Database connecting by check list length", async () => {
  let currDatalenght = 0;
  await User.find({}).then(function (users) {
    currDatalenght = users.length;
  });
  expect(currDatalenght).toBe(8);
});

test("testing passport authenticate for login ", async () => {
  // call passport authenticate method, using the local or google or whatever strategy,
  user_id = "6652839663b7c72157e5dabb";
  username = "William";
  password = "wei.shi@student.kpu.ca";
  email = "wei.shi@student.kpu.ca";
  const authenticate_curr = await User.authenticate();
  return authenticate_curr(username, password, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("authentication successfully");
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

