
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

// after routes
initializeDatabase().then(() => {
  if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  }
});


app.use(cors());
app.use(express.json());

// Staring up the server
app.use('/api', routes);
const PORT = process.env.PORT || 6001; // fallback for local dev
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

module.exports = app;