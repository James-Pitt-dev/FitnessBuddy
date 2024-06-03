const express = require('express');
const router = express.Router();

//npm uninstall node-fetch
//npm install node-fetch@2
const fetch = require('node-fetch');
const exerciseCatalog = require('../seeds/exerciseCatalogData')

router.get('/viewAllExercise', async function (req, res) {
  const json_file = exerciseCatalog.exerciseCatalogList
  if (json_file.length == 0) {
    const url = 'https://exercisedb.p.rapidapi.com/exercises?limit=20&offset=0';
    const bodyParturl = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '955929d1b2msh162f5c1d94afdf3p19c01fjsndb67889a007f',
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      const exerciseList = result
      res.render('../views/workouts/index', { exerciseList });

    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("DATA ALREADY EXISTED")
    console.log(json_file)
    const exerciseList = json_file
    res.render('../views/workouts/index', { exerciseList });

  }
});


// export the router
module.exports = router;