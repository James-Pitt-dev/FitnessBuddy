const OpenAI = require("openai");
require('dotenv').config();
const {rolePrompt} = require('./AIContext');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const {aiFunctions, getExerciseList} = require('./AIContext');
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Function to send a prompt to the OpenAI API
async function sendPrompt(userMessage, superPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: superPrompt },
        { role: "user", content: userMessage }
      ],
      functions: aiFunctions,
      function_call: "auto"
    });
    console.log(response.choices[0].message.function_call);
    const message = response.choices[0].message;
    //Two paths, if a function call is appended to api response, need to handle it. Else if no function call, return the text message and do a normal back and forth AI conversation use case
    if (message.function_call){
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      let functionResult; // identify function, call it, save result
      if(functionName === 'getExerciseList'){
        functionResult = await getExerciseList();
      }
      const functionResponse = { // make an object for the next API call with updated function results
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResult)
      }
    
      // Make another api call, this time with function response and message attached to it, openAI expects this
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-2024-04-09",
        messages: [
          {role: "system", content: superPrompt},
          {role: "user", content: userMessage},
          message,
          functionResponse
        ],
      });
      
      return finalResponse.choices[0].message.content;
    }
    else {
      return message.content; //normal convo path
    }
    
  } catch (error) {
    console.error("Error sending prompt to OpenAI:", error);
    throw error;
  }
}

module.exports = sendPrompt;