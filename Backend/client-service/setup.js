// client-service/setup.js
const pool = require("./db");

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Event (
        event_id SERIAL PRIMARY KEY,
        event_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_tickets INTEGER NOT NULL CHECK (event_tickets > 0),
        event_location TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Ticket (
        ticket_id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES Event(event_id) ON DELETE CASCADE,
        ticket_availability BOOLEAN NOT NULL DEFAULT true,
        ticket_price NUMERIC(10,2) NOT NULL,
        ticket_type TEXT NOT NULL
      );
    `);

    console.log("PostgreSQL tables initialized (client-service).");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

module.exports = { initializeDatabase };
