// /**
//  * @file llmServer.js
//  * @description Entry point for the LLM microservice.
//  * Sets up the Express server, middleware, and LLM routes, then starts listening on the defined port.
//  */

// const express = require('express');
// const cors = require('cors');
// const llmRoute = require('./route/llmRoute');

// const app = express();
// const PORT = 7001;

// app.use(cors());
// app.use(express.json());

// app.use('/api/llm', llmRoute);
// if (require.main === module) {
//   // Only start the server when running "node llmserver.js"
//   app.listen(PORT, () => {
//     console.log(`LLM service is running on http://localhost:${PORT}`);
//   });
// }

// module.exports = app;

/**
 * @file llmserver.js
 * @description Entry point for the LLM microservice.
 * Uses PostgreSQL and Google Gemini to handle ticket booking requests.
 */

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const llmRoute = require('./route/llmRoute');
const { initializeDatabase } = require('./setup');

const app = express();
const PORT = process.env.PORT || 7001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/llm', llmRoute);

// Initialize database tables and then start server
initializeDatabase().then(() => {
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`LLM service is running on http://localhost:${PORT}`);
    });
  }
});

module.exports = app;
