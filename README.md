# Fitness Buddy
#### https://fitness-buddy1-4eb0d11ae1b9.herokuapp.com/
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
- Jest 

## Architecture
MVC (Model-View-Controller) architectural pattern. It's a functional programming application where each part of the code has its own job. The model represents the data, the view displays the data, and the controller handles the input.

- **Model:** Mongoose is used as an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward, schema-based solution to model your application data.
- **View:** EJS (Embedded JavaScript) is used as the templating engine to generate HTML markup with plain JavaScript.
- **Controller:** Express.js is used to handle HTTP requests and responses.

## Database
The database is hosted on MongoDB, a source-available cross-platform document-oriented database program. It uses JSON-like documents with optional schemas.

## SDLC Highlights

### Summary
The app has fitness tracking and workout planner paired with a personalized AI trainer. The AI trainer will provide personalized advice and recommendations to the users to support and assist them with their wellness goals based on their health data and interactions. The app gives users easy to follow workouts with the ability to adjust the difficulty level. The overall goal is to create a user friendly and accessible application for achieving health and fitness goals. Target user group is anyone who is a fitness enthusiast or wants to be one.   

- ● First Aim: Providing a user friendly and accessible application for achieving health and fitness goals.
- ● Second Aim: Integrating AI to bring affordable personal training and health advice.
- ● Third Aim: Creating a framework for effective prompting and persisting context in general purpose LLM’s 

Application user would be able to: 
- • Create an account.
- • Enter their health data.
- • Create a workout plan themselves.
- • Get a workout plan using AI agent.
- • Get advice / suggestions from AI agent. 

### System Model (High Level)
Our users will interface with our application through a front end UI, the Fitness Buddy app will track and manage fitness data, workouts, user info, and facilitate our AI Trainer chat application. These components are helped with databases and API interactions as detailed in the model.

![diagram](https://github.com/user-attachments/assets/0077821c-96f9-4572-8f5a-ae60f04c8f2f)

### AI Trainer Model Diagram 
This system will take a users relevant history and past conversations to craft a system prompt to be attached to their message. The LLM provider receives it and the header prompt, enabling persistence and context. The LLM response is then processed, parsed for relevant workout data, saved to Memory DB, then ultimately sent to the user for the appearance of a personalized trainer.

![image](https://github.com/user-attachments/assets/0d30664e-f71e-43e7-9551-89c600046d9a)

### Use Case
![image](https://github.com/user-attachments/assets/e48880ca-89e4-4aaa-aaa9-8a748e3d5e4b)

### AI Trainer Sequence Diagram 
A user will chat with our Trainer Agent, the chat request is handled through our middleware system that will add context and system prompts before sending the chat to the LLM provider. These data objects will be saved in database.

![Seqdiagram](https://github.com/user-attachments/assets/97302907-6a02-49e8-8360-d5ffa21327f1)

### Data Flow Diagram

![image](https://github.com/user-attachments/assets/47897563-d949-46a2-b1c3-ff0d974d41eb)

### Wireframe
We start at the profile page, click on the workout icon, to create a workout by selecting exercises and to view exercises and we end with a conversation with our AI fitness trainer specific to the user. 
Notice the feedback mechanism on our chatbot informing the user that this is AI generated and to check for accuracy and provide feedback to incorporate in our model improvement.

![image](https://github.com/user-attachments/assets/b035ba3d-474f-406e-8a98-10b1da6b8576)

### Testing Plan

- Unit Testing: Testing of functions that are core to the application and ensure they do as expected. For example, user authentication, profile edit, and API fetch can be main units to test. 
- Integration Testing: Testing the integration of components and subsystems like database connections, ensuring they interact correctly and the system functions as a whole.
- System Testing: Test the entire system to validate that it meets the functional and non-functional requirements specified earlier. 
- Client Acceptance Testing: End users will run the software in a real-world environment to validate its usability, functionality, and performance.
- After the coding, testing,and feedback collection, our team will build up the documentation throughout the development process, and also debug and fix all the issues which have been identified during testing phases. The next phase should be deployment of our Fitness Buddy application in the production environment which involves database manipulating, AWS setting, and host configuring.


