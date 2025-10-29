require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
<<<<<<< Updated upstream
 * Test Gemini with multiple model options
=======
 * Simple test to verify Gemini API is working
>>>>>>> Stashed changes
 */
async function testGemini() {
  console.log('\n--- Testing Gemini API Connection ---\n');
  
<<<<<<< Updated upstream
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

=======
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY not found in .env file');
    console.log('Make sure your .env file contains:');
    console.log('GEMINI_API_KEY=your_key_here');
    return;
  }
  
  console.log('API Key found: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('\nSending test prompt to Gemini...\n');
    
    const result = await model.generateContent('Say "Hello, Gemini is working!" in a friendly way.');
    const response = await result.response;
    const text = response.text();
    
    console.log('SUCCESS! Gemini Response:');
    console.log('---');
    console.log(text);
    console.log('---\n');
    
    // Test booking intent parsing
    console.log('\n--- Testing Booking Intent Parsing ---\n');
    
    const bookingPrompt = `You are a ticket booking assistant. Parse this user request and respond ONLY with valid JSON:

User: "Book 2 tickets for Tiger Football Game"

Extract:
- event name (if mentioned)
- number of tickets (default to 1 if not mentioned)
- intent: "book" if they want to buy/book/purchase, "view" if they want to see events, or "query" for anything else

Respond in this exact JSON format:
{"event": "event name or null", "tickets": number, "intent": "book|view|query"}

JSON only, no other text:`;

    const result2 = await model.generateContent(bookingPrompt);
    const response2 = await result2.response;
    const text2 = response2.text();
    
    console.log('Raw Gemini Response:');
    console.log(text2);
    console.log('');
    
    // Try to parse JSON
    const cleanText = text2.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      const parsed = JSON.parse(cleanText);
      console.log('Parsed JSON:');
      console.log(parsed);
      console.log('\nSUCCESS! Gemini can parse booking intents correctly.\n');
    } catch (parseError) {
      console.log('WARNING: Could not parse JSON, but Gemini is responding.');
      console.log('Response:', cleanText);
    }
    
  } catch (error) {
    console.error('\nERROR: Failed to connect to Gemini');
    console.error('Error message:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Invalid API key - check your .env file');
    console.error('2. No internet connection');
    console.error('3. Gemini API quota exceeded');
    console.error('\nFull error:');
    console.error(error);
  }
}

// Run the test
>>>>>>> Stashed changes
testGemini();