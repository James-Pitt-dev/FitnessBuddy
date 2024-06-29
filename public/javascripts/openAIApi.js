const OpenAI = require("openai");
require('dotenv').config();
const {rolePrompt} = require('./AIContext');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Function to send a prompt to the OpenAI API
async function sendPrompt(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: rolePrompt },
        { role: "user", content: prompt }
      ]
    });

    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error sending prompt to OpenAI:", error);
    throw error;
  }
}

module.exports = sendPrompt;