
// // /**
// //  * @file server.js
// //  * @description Entry point for the Client microservice.
// //  * Sets up Express server, middleware, routes, and listens on specified port.
// //  */
// // require("dotenv").config({ path: require("path").join(__dirname, ".env") });
// // const express = require('express');
// // const cors = require('cors');
// // const app = express();
// // const routes = require('./routes/clientRoutes');

// // const { initializeDatabase } = require("./setup");

// // // after routes
// // initializeDatabase().then(() => {
// //   if (require.main === module) {
// //     app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
// //   }
// // });


// // app.use(cors());
// // app.use(express.json());

// // // Staring up the server
// // app.use('/api', routes);
// // const PORT = process.env.PORT || 6001; // fallback for local dev
// // if (require.main === module) {
// //   app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
// // }

// // module.exports = app;

// /**
//  * @file server.js
//  * @description Entry point for the Client microservice.
//  * Sets up Express server, middleware, routes, and listens on specified port.
//  */
// require("dotenv").config({ path: require("path").join(__dirname, ".env") });
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const routes = require('./routes/clientRoutes');
// const { initializeDatabase } = require("./setup");

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api', routes);

// // Port
// const PORT = process.env.PORT || 6001; // fallback for local dev

// // Start server after database initialization
// initializeDatabase().then(() => {
//   if (require.main === module) {
//     app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
//   }
// });

// module.exports = app;


/**
 * @file server.js
 * @description Entry point for the Client microservice.
 * Sets up Express server, middleware, routes, and listens on specified port.
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/clientRoutes');
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
app.use('/api', routes);

// Port
const PORT = process.env.PORT || 6001;

// Start server after database initialization
initializeDatabase().then(() => {
  if (require.main === module) {
    app.listen(PORT, () => console.log(`Client service running on port ${PORT}`));
  }
});

module.exports = app;
