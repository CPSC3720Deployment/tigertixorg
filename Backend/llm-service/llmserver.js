// // /**
// //  * @file llmServer.js
// //  * @description Entry point for the LLM microservice.
// //  * Sets up the Express server, middleware, and LLM routes, then starts listening on the defined port.
// //  */

// // const express = require('express');
// // const cors = require('cors');
// // const llmRoute = require('./route/llmRoute');

// // const app = express();
// // const PORT = 7001;

// // app.use(cors());
// // app.use(express.json());

// // app.use('/api/llm', llmRoute);
// // if (require.main === module) {
// //   // Only start the server when running "node llmserver.js"
// //   app.listen(PORT, () => {
// //     console.log(`LLM service is running on http://localhost:${PORT}`);
// //   });
// // }

// // module.exports = app;

// /**
//  * @file llmserver.js
//  * @description Entry point for the LLM microservice.
//  * Uses PostgreSQL and Google Gemini to handle ticket booking requests.
//  */

// require("dotenv").config({ path: require("path").join(__dirname, ".env") });
// const express = require('express');
// const cors = require('cors');
// const llmRoute = require('./route/llmRoute');
// const { initializeDatabase } = require('./setup');

// const app = express();
// const PORT = process.env.PORT || 7001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/llm', llmRoute);

// // Initialize database tables and then start server
// initializeDatabase().then(() => {
//   if (require.main === module) {
//     app.listen(PORT, () => {
//       console.log(`LLM service is running on http://localhost:${PORT}`);
//     });
//   }
// });

// module.exports = app;

/**
 * @file server.js
 * @description Entry point for the LLM microservice.
 * Sets up Express server, middleware, routes, and listens on specified port.
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./route/llmRoute'); // corrected to LLM routes
const { initializeDatabase } = require("./setup");

// Replace with your actual Vercel frontend URL
const allowedOrigins = [
  "https://tigertixorg.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no Origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middleware
app.use(cors({
  origin: FRONTEND_URL,  // only allow requests from frontend
  credentials: true      // allow cookies or Authorization headers
}));
app.use(express.json());

// Routes
app.use('/api/llm', routes);

// Port
const PORT = process.env.PORT || 7001;

// Start server after database initialization
initializeDatabase().then(() => {
  if (require.main === module) {
    app.listen(PORT, () => console.log(`LLM service running on port ${PORT}`));
  }
});

module.exports = app;
