require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Test Gemini with multiple model options
 */
async function testGemini() {
  console.log('\n--- Testing Gemini API Connection ---\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY not found in .env file');
    return;
  }
  
  console.log('API Key found: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try different model names
  const modelNames = [
    'models/gemini-pro',
    'gemini-pro',
    'models/gemini-1.5-pro-latest',
    'gemini-1.5-pro-latest',
    'models/gemini-1.0-pro-latest',
    'gemini-1.0-pro-latest'
  ];
  
  for (const modelName of modelNames) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say hi');
      const response = await result.response;
      const text = response.text();
      
      console.log('\n✅ SUCCESS! Working model found:', modelName);
      console.log('Response:', text);
      console.log('\n--- Use this model name in your code ---\n');
      return modelName;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
    }
  }
  
  console.log('\n❌ None of the models worked. Try running list-models.js to see available models.');
}

testGemini();