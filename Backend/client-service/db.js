// client-service/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // use same private DATABASE_URL as admin
  ssl: { rejectUnauthorized: false }
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database (client-service)");
});

module.exports = pool;
