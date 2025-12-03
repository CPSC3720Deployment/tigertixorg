// Backend/admin-service/db.js
const { Pool } = require("pg");

// Load local .env only if not in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway
  }
});

// Optional: log when connected
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

module.exports = pool;