require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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