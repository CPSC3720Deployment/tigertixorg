// setup.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'db', 'login.sqlite');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Failed to connect to database:', err);
        return reject(err);
      }

      console.log(`Connected to database at: ${DB_PATH}`);

      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT
        )`,
        (err) => {
          if (err) {
            console.error('Failed to create users table:', err);
            return reject(err);
          }
          resolve();
        }
      );
    });
  });
}

module.exports = {
  initializeDatabase,
  DB_PATH,
};
