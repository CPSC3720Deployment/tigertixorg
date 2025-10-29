require('dotenv').config();

console.log('Testing environment variables...\n');

if (process.env.GEMINI_API_KEY) {
  console.log('SUCCESS: API key found');
  console.log('Key starts with:', process.env.GEMINI_API_KEY.substring(0, 20));
  console.log('Key length:', process.env.GEMINI_API_KEY.length);
} else {
  console.log('ERROR: GEMINI_API_KEY not found in environment');
  console.log('Make sure .env file exists at:', __dirname + '/.env');
}