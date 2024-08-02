const request = require("supertest");
const { beforeAll, afterAll } = require("@jest/globals");
const currApp = require("./test_app");
const users = require("../controllers/users");
const { storeReturnTo } = require("../middleware");
const passport = require("passport");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const LocalStrategy = require("passport-local");

//POST METHOD sending parameter by send in supertest
//GET METHON sending parameter by query in supertest
describe("POST /users", () => {
  test("GET /login :should respond with a 200 status code", async () => {
    const response = await request(currApp).get("/login", users.renderLogin);
    expect(response.status).toBe(200);
  });

  test("GET: /register :should respond with a 200 status code", async () => {
    const response = await request(currApp).get(
      "/register",
      users.renderRegister
    );
    expect(response.status).toBe(200);
  });

  test("GET: /creatProfile :should respond with a 200 status code", async () => {
    const response = await request(currApp).get("/createProfile");
    expect(response.status).toBe(200);
  });

  test("GET: /deleteProfile/:id :should redirect to / once the id is worng ", async () => {
    const response = await request(currApp)
      .get("/deleteProfile/0000")
      .redirects("/");

    expect(response.status).toBe(200);
  });

  test("POST: /editProfile: should respond with bad code as 500 status code once give worng parameter", async () => {
    const body = { _id: "667ccd047aceba108c25fc10" };
    const response = await request(currApp)
      .post("/editProfile")
      .send(body)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .redirects('"/showProfile"');
    expect(response.status).toBe(200);
  });
});

//Integration Test on exercise routes
describe("Integration testing of exercise routes such as POST and GET", () => {
  it("GET: /exercises/ Should respond with a 200 status code", async () => {
    const response = await request(currApp).get("/exercises/");
    expect(response.status).toBe(200);
    expect(response.error).toBe(false);
  });

  it("GET: /exercisse/ Should respond with bad code as 404 status code once given worng parameter", async () => {
    const response = await request(currApp).get("/exercise/");
    expect(response.status).toBe(404);
  });

  it("GET: /exercises/0003 Retrun status code 200 while given the ID to filter the exercises list to show one", async () => {
    const response = await request(currApp).get("/exercises/0003");
    expect(response.status).toBe(200);
  });

  it("GET: /exercises/3333 Should respond with bad code as 500 status code due to worng parameter", async () => {
    const response = await request(currApp).get("/exercises/3333");
    expect(response.status).toBe(500);
  });

  it("POST /exercises/search Retrun status code 200 while search keyword on exercises list to show one or ones", async () => {
    const response = await request(currApp)
      .post("/exercises/search")
      .send("search=bike")
      .set("Accept", "text/html");
    expect(response.status).toBe(200);
    expect(response.text).toContain("bike");
  });
});

//Integration Test on workout routes
describe("Integration testing of exercise routes such as POST and GET", () => {
  it("GET /new: should respond with a 200 status code", async () => {
    const response = await request(currApp)
      .get("/workouts/new")
      .redirects("workouts/new");
    expect(response.status).toBe(200);
  });

  it("POST /new: should respond with status code as 200 s", async () => {
    const response = await request(currApp)
      .post("/workouts/new")
      .redirects("/workouts/index");
    expect(response.status).toBe(200);
  });

  it("GET /view/:id :Retrun status code 200 while given the ID to filter the exercises list to show one", async () => {
    const response = await request(currApp)
      .get("/workouts/view/66848beb7b2052ed332ce942")
      .redirects("workouts/show");
    expect(response.status).toBe(200);
  });

  it("GET /delete/:id :Redirect to /workouts/index while given a worng ID ", async () => {
    const response = await request(currApp)
      .get("/workouts/delete/000000")
      .redirects("/workouts/index");
    expect(response.status).toBe(200);
  });

  it("POST: /updateWorkout: Retrun status code 200 while search keyword on exercises list to show one or ones", async () => {
    const response = await request(currApp)
      .post("/workouts/updateWorkout")
      .redirects("/workouts/index");
    expect(response.status).toBe(200);
  });
});
