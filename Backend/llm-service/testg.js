require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

<<<<<<< Updated upstream
async function listModels() {
  console.log('\n--- Listing Available Gemini Models ---\n');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const models = await genAI.listModels();
    
    console.log('Available models that support generateContent:');
    console.log('');
    
    for (const model of models) {
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log('Model name:', model.name);
        console.log('Display name:', model.displayName);
        console.log('---');
      }
    }
    
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
=======
async function simpleTest() {
  console.log('Starting simple Gemini test...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('GoogleGenerativeAI initialized');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Model created: gemini-1.5-flash');
    console.log('Sending request...\n');
    
    const result = await model.generateContent('Say hi in 3 words');
    console.log('Got response!');
    
    const response = await result.response;
    const text = response.text();
    
    console.log('Response:', text);
    console.log('\nSUCCESS!');
    
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

simpleTest();
>>>>>>> Stashed changes
