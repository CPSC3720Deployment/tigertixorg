// /**
//  * @file server.js
//  * @description Entry point for the Admin microservice.
//  * Sets up Express server, middleware, routes, and initializes the SQLite database.
//  * @returns {void} Starts the Express server and listens on the specified PORT.
//  */

// const express = require('express');
// const cors = require('cors');
// const {initializeDatabase } = require('./setup');
// const routes = require('./routes/adminRoutes');

// const app = express();
// const PORT = 5001;


// //Middleware to make sure we use json (I learned from using insomnia (Rodrigo))
// app.use(cors());
// app.use(express.json());

// // Staring up the server
// app.use('/api/admin', routes);

// initializeDatabase().then(() => 
// {
//     if (require.main === module) {
//         app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
//     }
// });

// module.exports = app;

/**
 * @file server.js
 * @description Entry point for the Admin microservice.
 * Sets up Express server, middleware, routes, and listens on specified port.
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/adminRoutes');
const { initializeDatabase } = require("./setup");

// Replace with your actual Vercel frontend URL
const FRONTEND_URL = "https://https://tigertixorg.vercel.app/";

// Middleware
app.use(cors({
  origin: FRONTEND_URL,  // only allow requests from frontend
  credentials: true      // allow cookies or Authorization headers
}));
app.use(express.json());

// Routes
app.use('/api/admin', routes);

// Port
const PORT = process.env.PORT || 5001;

// Start server after database initialization
initializeDatabase().then(() => {
  if (require.main === module) {
    app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));
  }
});

module.exports = app;
