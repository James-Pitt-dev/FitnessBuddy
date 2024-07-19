//install supertest by npm install supertest --save-dev
const request = require("supertest");
const currApp = require("../app.js");

describe("Integration testing of exercise routes such as POST and GET", () => {
  it("GET:should respond with a 200 status code", async () => {
    const response = await request(currApp).get("/exercises/");

    expect(response.status).toBe(200);
    expect(response.error).toBe(false);
  });

  it("GET:should respond with bad code as 404 status code once give worng parameter", async () => {
    const response = await request(currApp).get("/exercise/");
    expect(response.status).toBe(404);
  });

  it("GET:Retrun status code 200 while given the ID to filter the exercises list to show one", async () => {
    const response = await request(currApp).get("/exercises/0003");
    expect(response.status).toBe(200);
  });

  it("GET: should respond with bad code as 500 status code once give worng parameter", async () => {
    const response = await request(currApp).get("/exercises/3333");
    expect(response.status).toBe(500);
  });

  it("POST: Retrun status code 200 while search keyword on exercises list to show one or ones", async () => {
    const response = await request(currApp).post("/exercises/search").send("search=bike").set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.text).toBe('bike');
  });
});
