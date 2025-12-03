const pool = require('./db');

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Event (
        event_id SERIAL PRIMARY KEY,
        event_name TEXT NOT NULL,
        event_date DATE NOT NULL,
        event_tickets INTEGER NOT NULL CHECK (event_tickets >= 0),
        event_location TEXT NOT NULL
      );
    `);
    console.log("PostgreSQL tables initialized (llm-service).");
  } catch (err) {
    console.error("Database initialization error (llm-service):", err);
  }
}

module.exports = { initializeDatabase };
