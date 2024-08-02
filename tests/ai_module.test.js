const request = require('supertest');
const app = require('../app.js');
const mongoose = require('mongoose');
const {getWorkoutContext, getChatContext, getProfileContext, rolePrompt, superPrompt, aiFunctions, getExerciseList, createWorkoutRoutine} = require('../public/javascripts/AIContext.js');
const {chest, back, cardio, lowerArms, lowerLegs, neck, shoulders, upperArms, upperLegs, waist} = require('../public/javascripts/filteredExercises.js');

let agent; // create a variable to store the logged in user session

// first need to simulate a logged in user, sub in any user that exists in the database
beforeAll(async () => {
  agent = request.agent(app);

    // Mock console.log to suppress logs during tests
    global.console = {
      ...global.console,
      log: jest.fn()
    };

  const loginResponse = await agent
    .post('/login')
    .send({ username: 'Elon', password: 'Elon' })
    .expect(302);

    expect(loginResponse.headers['set-cookie']).toBeDefined();
});

//Unit Tests, testing key individual functions

// createWorkoutRoutine function

describe("POST /createWorkoutRoutine", () => {
  const exercises = [
    { name: 'kettlebell front squat' },
    { name: 'cable shoulder press' },
    { name: 'ankle circles' },
    { name: 'band reverse wrist curl' }
  ];

  // const userID = new ObjectId('669c15ae962147df3510a835');
  const userID = new mongoose.Types.ObjectId('669c15ae962147df3510a835');

  it("should create a workout routine with the specified exercises", async () => {
    const exerciseNames = ["kettlebell front squat", "cable shoulder press", "ankle circles", "band reverse wrist curl"];
    const title = "Test Workout Routine";
    const notes = "Test Notes for the Workout Routine";

    const workout = await createWorkoutRoutine(userID, { exerciseNames, title, notes });

    expect(workout).toHaveProperty('author', userID);
    expect(workout).toHaveProperty('title', title);
    expect(workout).toHaveProperty('notes', notes);
    expect(workout).toHaveProperty('exercises');
    expect(workout.exercises.length).toBe(4);
  }, 5000);
});

// getChatContext function
describe("Unit Test for getChatContext Function", () => {
  const userID = new mongoose.Types.ObjectId('669c15ae962147df3510a835');

  it("should return at least 3 chat messages", async () => {
    const limit = 3;
    const chatContext = await getChatContext(userID, limit);

    const parsedContext = JSON.parse(chatContext.replace('Users Recent Chats: ', ''));

    expect(parsedContext.length).toBeGreaterThanOrEqual(limit);
  }, 5000);

  it("should return error with invalid user ID", async () => {
    const invalidUserID = 'invalidUserID';
    await expect(getChatContext(invalidUserID, 3)).rejects.toThrow(mongoose.CastError);
  });
});

// Test for getExerciseList function
describe("Unit Test for getExerciseList Function", () => {
  it("should return all exercises when no filters are provided", () => {
    const exerciseList = getExerciseList();
    const allExercises = { chest, back, cardio, lowerArms, lowerLegs, neck, shoulders, upperArms, upperLegs, waist };

    let allExerciseNames = [];
    for (const key in allExercises) {
      allExerciseNames = allExerciseNames.concat(allExercises[key]);
    }

    const expectedExerciseList = `Here is the list of acceptable exercises to choose from when creating a workout plan for the user. You must only pick exercises from this list to ensure the user is performing safe and effective exercises: ${JSON.stringify(allExerciseNames)}`;

    expect(exerciseList).toBe(expectedExerciseList);
  });

  it("should return filtered exercises based on body parts", () => {
    const filters = { bodyParts: ['chest', 'back'] };
    const exerciseList = getExerciseList(filters);
    const expectedExerciseList = `Here is the list of acceptable exercises to choose from when creating a workout plan for the user. You must only pick exercises from this list to ensure the user is performing safe and effective exercises: ${JSON.stringify([...chest, ...back])}`;

    expect(exerciseList).toBe(expectedExerciseList);
  });

  it("should return an empty list if no matching body parts are found", () => {
    const filters = { bodyParts: ['nonexistentBodyPart'] };
    const exerciseList = getExerciseList(filters);
    const expectedExerciseList = `Here is the list of acceptable exercises to choose from when creating a workout plan for the user. You must only pick exercises from this list to ensure the user is performing safe and effective exercises: []`;

    expect(exerciseList).toBe(expectedExerciseList);
  });
});

// getProfileContext function
describe("Unit Test for getProfileContext Function", () => {
  const userID = new mongoose.Types.ObjectId('669c15ae962147df3510a835');

  it("should return the user's profile information", async () => {
    const profileContext = await getProfileContext(userID);
    const parsedContext = JSON.parse(profileContext.replace('Users Profile Information: ', ''));

    expect(parsedContext).toHaveProperty('username', 'Elon');
    expect(parsedContext).toHaveProperty('currentWeight');
    expect(parsedContext).toHaveProperty('age');
    expect(parsedContext).toHaveProperty('userGender');
    expect(parsedContext).toHaveProperty('activity');
    expect(parsedContext).toHaveProperty('experience');
    expect(parsedContext).toHaveProperty('userGoals');
    expect(parsedContext).toHaveProperty('availableEquipment');
    expect(parsedContext).toHaveProperty('goalWeight');
    expect(parsedContext).toHaveProperty('height');
    expect(parsedContext).toHaveProperty('weeklyWorkouts');
  });

  it("should return error with invalid user ID", async () => {
    const invalidUserID = 'invalidUserID';
    await expect(getProfileContext(invalidUserID)).rejects.toThrow(mongoose.CastError);
  });
});

//***************** */
// Integration Tests, multiple systems working together.
describe("GET /chat", () => {
  it("should respond with a 200 status code", async () => {
    const response = await agent
      .get("/ai-trainer/chat")
      .expect(200);

    expect(response.status).toBe(200); // Check if the status code is 200 to confirm endpoint is working
    expect(response.text).toContain('<!DOCTYPE html>');  // Check if the response contains the html tag to confirm rendered view
  });
});

describe("POST /chat", () => { // test endpoint and simulate a chat conversation
  it("should respond with a 200 status code, make API calls, and return chat response", async () => {
    const postData = {
      AI: {
        userChat: "Hello, how can you help me?"
      }
    };

    const response = await agent
      .post("/ai-trainer/chat")
      .send(postData)
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('author');
    expect(response.body).toHaveProperty('userMessage', '<p>Hello, how can you help me?</p>\n');
    expect(response.body).toHaveProperty('trainerMessage');
  }, 10000); // Increase timeout to 10 seconds to allow for the AI response to be generated
});

// Clean up after tests
afterAll(async () => {
  global.console.log.mockRestore(); // Restore console.log
  await mongoose.connection.close(); 
});