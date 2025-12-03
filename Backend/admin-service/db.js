const { Pool } = require("pg");

// DO NOT load dotenv in production. Remove the require("dotenv").config() line
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

module.exports = pool;