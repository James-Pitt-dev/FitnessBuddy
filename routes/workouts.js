const express = require('express');
const router = express.Router();

router.get('/new', function(req, res) {
    res.render('workouts/new');
  });
  
  
  // export the router
  module.exports = router;