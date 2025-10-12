/**
 * @file setup.js
 * @description Sets up and initializes the shared SQLite database for the microservices.
 * Handles creation of Event and Ticket tables with proper schema and foreign key constraints.
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => 
    {
        if (err) 
        {
            console.error('Connection error with database', err.message);
        } 
        else
        {
            console.log('Connected to the SQLite database.');
        }
    });

/**
 * Initializes the SQLite database by creating Event and Ticket tables.
 * Drops existing tables if they exist and enforces foreign key constraints.
 * @function
 * @returns {Promise<void>} Resolves when the tables are successfully created.
 * @throws {Error} Rejects if there is an error creating the tables.
 */
    const initializeDatabase = () => 
{
    return new Promise((resolve, reject) => 
    {
        db.serialize(() => 
        {
            db.run('PRAGMA foreign_keys = ON');
            db.run('DROP TABLE IF EXISTS Ticket');
            db.run('DROP TABLE IF EXISTS Event');
            db.run('CREATE TABLE Event (event_id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT NOT NULL, event_date TEXT NOT NULL, event_tickets INTEGER NOT NULL, event_location TEXT NOT NULL)');
            db.run('CREATE TABLE Ticket (ticket_id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, ticket_price REAL, ticket_type TEXT, ticket_availability BOOLEAN NOT NULL, FOREIGN KEY(event_id) REFERENCES Event(event_id))', (err) => {
                if (err) 
                {
                    console.error('Failed to create the db tables:', err.message);
                    reject(err);
                } 
                else
                {
                    console.log('Succesfully made the db tables');
                    resolve();
                }
            });
        });
    });
};

module.exports = { initializeDatabase };