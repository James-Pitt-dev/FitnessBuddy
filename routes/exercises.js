const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { storeReturnTo } = require("../middleware");
const Exercise = require("../models/exercise");
//API reload
//const reloadAPI= require('../seeds/exerciseDB')//process this if needed to reload exercises api
// routes for exercises

// GET route to show all exercises from the database
router.get(
  "/",
  catchAsync(async (req, res) => {
    let workouts = await Exercise.find({});
    res.render("exercises/index", { workouts });
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const workout = await Exercise.findOne({ id: id });
    // const workout = await workoutAPI(`/exercise/${id}`);
    res.render("exercises/show", { workout });
  })
);

// POET route to search by keyword to show relevant exercises from the database BY NAME
router.post(
  "/search",
  catchAsync(async (req, res) => {
    const search = req.body.search;
    try {
      let workouts = await Exercise.find({ name: { $regex: search, $options: "i" } });
      console.log(workouts);
      return res.render("exercises/index", { workouts });
    } catch (error) {
      console.error("Error searching Exercises:", error);
      throw error;
    }
  })
);

module.exports = router;
