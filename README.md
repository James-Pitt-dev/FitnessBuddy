# YelpCamp
![JavaScript](https://img.shields.io/badge/-JavaScript-black?style=flat-square&logo=javascript)
![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3)
![Nodejs](https://img.shields.io/badge/-Nodejs-black?style=flat-square&logo=Node.js)
![Express.js](https://img.shields.io/badge/-Express.js-black?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/-MongoDB-black?style=flat-square&logo=mongodb)
![Mongoose](https://img.shields.io/badge/-Mongoose-black?style=flat-square&logo=mongoose)
![EJS](https://img.shields.io/badge/-EJS-black?style=flat-square&logo=ejs)
![Bootstrap](https://img.shields.io/badge/-Bootstrap-563D7C?style=flat-square&logo=bootstrap)


## Tech Stack
- **Languages:** JS, HTML, CSS, Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- Bootstrap

## Architecture
MVC (Model-View-Controller) architectural pattern. It's a functional programming application where each part of the code has its own job. The model represents the data, the view displays the data, and the controller handles the input.

- **Model:** Mongoose is used as an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward, schema-based solution to model your application data.
- **View:** EJS (Embedded JavaScript) is used as the templating engine to generate HTML markup with plain JavaScript.
- **Controller:** Express.js is used to handle HTTP requests and responses.

## Database
The database is hosted on MongoDB, a source-available cross-platform document-oriented database program. It uses JSON-like documents with optional schemas.

## Workflows

### Getting started
- //navigate to a project dir, git clone will make a fitnessbuddy dir there //

    git clone https://github.com/James-Pitt-dev/Yelp-Camp.git
    cd .\fitnessbuddy\
    npm install

// to start the server on http://127.0.0.1:3000

    node app.js   

//this starts the server and lets it listen for incoming url requests, which we make routes in code for it to run and serve view pages and do logic


### git
- Update to latest code: be in master/main branch, then git pull origin to get the latest code from repo
- develop new features in a separate branch and change as little other code as possible to reduce merge conflicts. git checkout -b featureBranch --> do code, when done something functional --> git push origin featureBranch
- We want to make things as modular and isolated as possible or the code becomes a mess
