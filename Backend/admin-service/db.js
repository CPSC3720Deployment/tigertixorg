const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    ssl: { rejectUnauthorized: false } // Required for Railway
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL database");
});

module.exports = pool;