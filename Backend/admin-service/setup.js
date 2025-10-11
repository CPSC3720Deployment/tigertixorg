const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Connection error with database', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
    db.run('DROP TABLE IF EXISTS Event');
    db.run('DROP TABLE IF EXISTS Ticket');
    db.run('CREATE TABLE Event (event_id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT NOT NULL, event_date TEXT NOT NULL, event_tickets INTEGER NOT NULL, event_location TEXT NOT NULL)');
    db.run('CREATE TABLE Ticket (ticket_id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, ticket_price REAL, ticket_type TEXT, ticket_availability BOOLEAN NOT NULL, FOREIGN KEY(event_id) REFERENCES Event(event_id))');
});