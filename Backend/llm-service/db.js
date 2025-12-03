const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Railway
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database (llm-service)");
});

module.exports = pool;
