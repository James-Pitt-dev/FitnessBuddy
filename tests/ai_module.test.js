const request = require('supertest');
const app = require('../app.js');
const mongoose = require('mongoose');

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

// sendPrompt function

// describe("Testing OPENAI chatCompletions API with superprompt context", () => {

// });


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
    expect(response.body).toHaveProperty('userMessage', postData.AI.userChat);
    expect(response.body).toHaveProperty('trainerMessage');
  }, 10000); // Increase timeout to 10 seconds to allow for the AI response to be generated
});

// Clean up after tests
afterAll(async () => {
  global.console.log.mockRestore(); // Restore console.log
  await mongoose.connection.close(); 
});